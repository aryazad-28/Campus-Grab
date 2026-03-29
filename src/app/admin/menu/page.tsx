'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, X, Loader2, Clock } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useMenu } from '@/components/MenuProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

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
    const t = useTranslations('Admin')
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
        )
    }

    return (
        <div className="animate-in fade-in pb-20">
            {/* Header */}
            <div className="sticky top-[4rem] z-40 border-b glass bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold">{t('menu')}</h1>
                    <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('add')}</span>
                    </Button>
                </div>
            </div>

            <main className="container mx-auto px-4 py-6">
                {/* Add Form */}
                {showAddForm && (
                    <Card className="mb-6 border-[var(--border)] overflow-hidden">
                        <CardHeader className="pb-3 bg-[var(--card)]/50">
                            <CardTitle className="text-lg">{t('addNewItem')}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Input
                                    placeholder={t('itemName')}
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <div className="relative">
                                    <select
                                        className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                         <svg className="h-4 w-4 text-[var(--muted-foreground)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <Input
                                    type="number"
                                    placeholder={t('price')}
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                />
                                <Input
                                    type="number"
                                    placeholder={t('eta')}
                                    value={formData.eta_minutes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, eta_minutes: e.target.value }))}
                                />
                                <Input
                                    type="url"
                                    placeholder={t('imageOptional')}
                                    value={formData.image_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                                        <Check className="h-4 w-4" />
                                        {t('add')}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-[var(--muted-foreground)] opacity-80">{t('defaultImage')}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Items List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[var(--muted-foreground)] mb-4">{t('noItems')}</p>
                        <Button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <Plus className="h-4 w-4" />
                            {t('addFirstItem')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => (
                            <Card key={item.id} className={`overflow-hidden transition-opacity ${!item.available ? 'opacity-50 grayscale-[0.2]' : ''}`}>
                                <div className="flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center">
                                    {/* Left side: Image + Info */}
                                    <div className="flex items-center gap-4 flex-1 w-full">
                                        {item.image_url ? (
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)]">
                                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--muted)] flex items-center justify-center">
                                                 <span className="text-xs text-[var(--muted-foreground)]">No Img</span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base truncate">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <Badge variant="secondary" className="text-xs font-normal bg-[var(--muted)]">{item.category}</Badge>
                                                <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {item.eta_minutes} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Price + Actions */}
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t border-[var(--border)] sm:border-0 mt-2 sm:mt-0">
                                        <div className="font-bold text-[var(--foreground)] sm:hidden">₹{item.price}</div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="font-bold text-[var(--foreground)] hidden sm:block w-20 text-right">₹{item.price}</div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleAvailability(item.id)}
                                                    className={`h-8 px-3 text-xs sm:text-sm font-medium transition-colors ${item.available
                                                        ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                                        : 'hover:bg-[var(--accent)] text-[var(--muted-foreground)]'
                                                        }`}
                                                >
                                                    {item.available ? t('available') : t('unavailable')}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
