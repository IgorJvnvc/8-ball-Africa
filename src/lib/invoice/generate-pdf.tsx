import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

interface InvoiceItem {
  name: string
  quantity: number
  price: number
}

interface InvoiceData {
  invoiceNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  items: InvoiceItem[]
  subtotal: number
  shippingCost: number
  total: number
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  brand: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  tagline: { fontSize: 8, color: '#64748b', marginTop: 4 },
  invoiceTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  invoiceMeta: { fontSize: 9, color: '#475569', textAlign: 'right', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#1e293b' },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableRow: { flexDirection: 'row', paddingVertical: 4 },
  colName: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '17.5%', textAlign: 'right' },
  colTotal: { width: '17.5%', textAlign: 'right' },
  headerText: { fontFamily: 'Helvetica-Bold', color: '#475569', fontSize: 9 },
  totalsSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  totalLabel: { width: 100, textAlign: 'right', paddingRight: 12, color: '#475569' },
  totalValue: { width: 80, textAlign: 'right' },
  grandTotal: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#1e40af' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8 },
})

function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>8-Ball Africa</Text>
            <Text style={styles.tagline}>Premium Pool & Billiards Equipment</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>#{data.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>{data.orderDate}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text>{data.customerName}</Text>
          <Text style={{ color: '#475569' }}>{data.customerEmail}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colName]}>Item</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colPrice]}>Price</Text>
            <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>R {item.price.toFixed(2)}</Text>
              <Text style={styles.colTotal}>R {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>R {data.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>R {data.shippingCost.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>R {data.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          8-Ball Africa • orders@8ballafrica.com • www.8ballafrica.com
        </Text>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoicePDF data={data} />)
  return Buffer.from(buffer)
}
