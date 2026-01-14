'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { supabase, MenuItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = ['Breakfast', 'Main Course', 'Snacks', 'Beverages', 'Desserts']

export default function MenuManagementPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAdmin()
    const [items, setItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Snacks',
        price: '',
        eta_minutes: '10',
        canteen_id: 1
    })

    // Auth check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch menu items
    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        if (!supabase) {
            // Demo data if Supabase not connected
            setItems([
                { id: '1', name: 'Masala Dosa', category: 'Breakfast', price: 60, image_url: null, eta_minutes: 8, canteen_id: 1, available: true },
                { id: '2', name: 'Cold Coffee', category: 'Beverages', price: 50, image_url: null, eta_minutes: 5, canteen_id: 1, available: true },
                { id: '3', name: 'Samosa', category: 'Snacks', price: 20, image_url: null, eta_minutes: 3, canteen_id: 1, available: true },
            ])
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching items:', error)
                // Use demo data on error
                setItems([])
            } else {
                setItems(data || [])
            }
        } catch (err) {
            console.error('Fetch error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!formData.name || !formData.price) return

        const newItem = {
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            eta_minutes: parseInt(formData.eta_minutes),
            canteen_id: formData.canteen_id,
            available: true,
            image_url: null
        }

        if (supabase) {
            const { data, error } = await supabase
                .from('menu_items')
                .insert(newItem)
                .select()
                .single()

            if (error) {
                console.error('Error adding item:', error)
                alert('Error adding item. Make sure the menu_items table exists in Supabase.')
                return
            }

            setItems(prev => [data, ...prev])
        } else {
            // Demo mode
            const demoItem = { ...newItem, id: Date.now().toString() } as MenuItem
            setItems(prev => [demoItem, ...prev])
        }

        setFormData({ name: '', category: 'Snacks', price: '', eta_minutes: '10', canteen_id: 1 })
        setShowAddForm(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        if (supabase) {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting:', error)
                return
            }
        }

        setItems(prev => prev.filter(item => item.id !== id))
    }

    const toggleAvailability = async (id: string, available: boolean) => {
        if (supabase) {
            const { error } = await supabase
                .from('menu_items')
                .update({ available: !available })
                .eq('id', id)

            if (error) {
                console.error('Error updating:', error)
                return
            }
        }

        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, available: !available } : item
        ))
    }

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <Button onClick={() => setShowAddForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold">Menu Management</h1>

                {/* Add Form */}
                {showAddForm && (
                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Add New Item</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <Input
                                    placeholder="Item name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <select
                                    className="h-10 rounded-lg border border-neutral-200 px-3"
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <Input
                                    type="number"
                                    placeholder="Price (₹)"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                />
                                <Input
                                    type="number"
                                    placeholder="ETA (min)"
                                    value={formData.eta_minutes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, eta_minutes: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} className="flex-1 gap-1">
                                        <Check className="h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Items List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 mb-4">No menu items yet</p>
                        <Button onClick={() => setShowAddForm(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Your First Item
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => (
                            <Card key={item.id} className={!item.available ? 'opacity-60' : ''}>
                                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary">{item.category}</Badge>
                                            <span className="text-sm text-neutral-500">{item.eta_minutes} min</span>
                                        </div>
                                    </div>

                                    <div className="font-semibold">₹{item.price}</div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={item.available ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => toggleAvailability(item.id, item.available)}
                                        >
                                            {item.available ? 'Available' : 'Unavailable'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
