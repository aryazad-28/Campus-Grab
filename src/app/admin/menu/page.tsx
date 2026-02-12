'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Check, X, Loader2 } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useMenu } from '@/components/MenuProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = ['Breakfast', 'Main Course', 'Snacks', 'Beverages', 'Desserts']

const FOOD_IMAGES: Record<string, string> = {
    'Breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
    'Main Course': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop',
    'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
    'Desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
}

export default function MenuManagementPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAdmin()
    const { items, isLoading, addItem, deleteItem, toggleAvailability } = useMenu()
    const [showAddForm, setShowAddForm] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        category: 'Snacks',
        price: '',
        eta_minutes: '10',
        image_url: ''
    })

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [authLoading, isAuthenticated, router])

    const handleAdd = () => {
        if (!formData.name || !formData.price) return

        addItem({
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            eta_minutes: parseInt(formData.eta_minutes),
            available: true,
            image_url: formData.image_url || FOOD_IMAGES[formData.category] || FOOD_IMAGES['Snacks']
        })

        setFormData({ name: '', category: 'Snacks', price: '', eta_minutes: '10', image_url: '' })
        setShowAddForm(false)
    }

    const handleDelete = (id: string) => {
        if (!confirm('Delete this item?')) return
        deleteItem(id)
    }

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <h1 className="text-lg font-semibold">Menu</h1>
                    <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add</span>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {/* Add Form */}
                {showAddForm && (
                    <Card className="mb-6 bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white">Add New Item</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Input
                                    placeholder="Item name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                                <select
                                    className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white"
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
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                                <Input
                                    type="number"
                                    placeholder="ETA (min)"
                                    value={formData.eta_minutes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, eta_minutes: e.target.value }))}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                                <Input
                                    type="url"
                                    placeholder="Image URL (optional)"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1">
                                        <Check className="h-4 w-4" />
                                        Add
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-slate-600 text-white hover:bg-slate-700">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Leave image URL empty to use a default image based on category</p>
                        </CardContent>
                    </Card>
                )}

                {/* Items List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 mb-4">No menu items yet</p>
                        <Button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                            <Plus className="h-4 w-4" />
                            Add Your First Item
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => (
                            <Card key={item.id} className={`bg-slate-800 border-slate-700 ${!item.available ? 'opacity-50' : ''}`}>
                                <CardContent className="flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4">
                                    {item.image_url && (
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-700 sm:h-14 sm:w-14">
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-[150px]">
                                        <h3 className="font-medium text-sm text-white sm:text-base">{item.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">{item.category}</Badge>
                                            <span className="text-xs text-slate-500">{item.eta_minutes} min</span>
                                        </div>
                                    </div>

                                    <div className="font-semibold text-sm text-white sm:text-base">₹{item.price}</div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleAvailability(item.id)}
                                            className={`text-xs sm:text-sm ${item.available
                                                ? 'border-emerald-600 text-emerald-400 hover:bg-emerald-600/20'
                                                : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {item.available ? 'Available' : 'Unavailable'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
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
