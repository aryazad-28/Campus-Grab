'use client'

import { jsPDF } from 'jspdf'

interface InvoiceOrder {
    id: string
    token_number: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    created_at: string
    payment_method: string
    razorpay_payment_id?: string
    paid_at?: string
    user_name?: string
    user_email?: string
    canteen_name?: string
    canteen_area?: string
}

export function generateInvoicePDF(order: InvoiceOrder) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 20

    // Colors
    const darkGray = '#1a1a1a'
    const mediumGray = '#666666'
    const lightGray = '#999999'
    const accentRed = '#DC2626'

    // ---- Header ----
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(accentRed)
    doc.text('Campus Grab', margin, y)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(lightGray)
    doc.text('INVOICE', pageWidth - margin, y, { align: 'right' })
    y += 8

    // Canteen name
    if (order.canteen_name) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(darkGray)
        doc.text(order.canteen_name, margin, y)
        y += 5
        if (order.canteen_area) {
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(mediumGray)
            doc.text(order.canteen_area, margin, y)
            y += 5
        }
    }

    // Divider
    y += 4
    doc.setDrawColor('#e5e5e5')
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // ---- Order Info ----
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkGray)
    doc.text('Order Details', margin, y)
    y += 7

    const infoItems = [
        ['Order ID', order.token_number || order.id],
        ['Date', new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        })],
        ['Time', new Date(order.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        })],
        ['Payment', order.payment_method === 'online' ? 'Paid Online (UPI)' : order.payment_method],
    ]

    if (order.razorpay_payment_id) {
        infoItems.push(['Transaction ID', order.razorpay_payment_id])
    }

    if (order.user_name) {
        infoItems.push(['Customer', order.user_name])
    }

    if (order.user_email) {
        infoItems.push(['Email', order.user_email])
    }

    doc.setFontSize(9)
    for (const [label, value] of infoItems) {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(mediumGray)
        doc.text(label, margin, y)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(darkGray)
        doc.text(value, margin + 45, y)
        y += 6
    }

    // Divider
    y += 4
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // ---- Items Table ----
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkGray)
    doc.text('Items', margin, y)
    doc.text('Qty', pageWidth - margin - 50, y, { align: 'right' })
    doc.text('Amount', pageWidth - margin, y, { align: 'right' })
    y += 3

    doc.setDrawColor('#e5e5e5')
    doc.line(margin, y, pageWidth - margin, y)
    y += 7

    doc.setFontSize(9)
    for (const item of order.items) {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(darkGray)
        doc.text(item.name, margin, y)
        doc.setTextColor(mediumGray)
        doc.text(`x${item.quantity}`, pageWidth - margin - 50, y, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(darkGray)
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
        y += 7
    }

    // Divider
    y += 2
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // ---- Bill Summary ----
    const itemTotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(mediumGray)
    doc.text('Item Total', margin, y)
    doc.setTextColor(darkGray)
    doc.text(`₹${itemTotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
    y += 8

    // Total Paid
    doc.setDrawColor('#e5e5e5')
    doc.line(margin, y - 2, pageWidth - margin, y - 2)
    y += 4
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkGray)
    doc.text('Total Paid', margin, y)
    doc.setTextColor(accentRed)
    doc.text(`₹${order.total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
    y += 15

    // ---- Footer ----
    doc.setDrawColor('#e5e5e5')
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(lightGray)
    doc.text('Thank you for ordering with Campus Grab!', pageWidth / 2, y, { align: 'center' })
    y += 5
    doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, y, { align: 'center' })

    // Save
    const fileName = `CampusGrab_Invoice_${order.token_number || order.id}.pdf`
    doc.save(fileName)
}
