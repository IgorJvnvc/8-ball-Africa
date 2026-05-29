import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface OrderConfirmationEmailProps {
  customerName: string
  orderNumber: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
}

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shippingCost,
  total,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your 8-Ball Africa order #{orderNumber} has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Thank you for your order! We&apos;re getting your pool equipment ready.
          </Text>

          <Section style={orderInfo}>
            <Row>
              <Column>
                <Text style={label}>Order Number</Text>
                <Text style={value}>#{orderNumber}</Text>
              </Column>
              <Column>
                <Text style={label}>Order Date</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            Items
          </Heading>
          {items.map((item, i) => (
            <Row key={i} style={itemRow}>
              <Column style={{ width: '60%' }}>
                <Text style={itemName}>{item.name}</Text>
                <Text style={itemQty}>Qty: {item.quantity}</Text>
              </Column>
              <Column style={{ width: '40%', textAlign: 'right' as const }}>
                <Text style={itemPrice}>R {(item.price * item.quantity).toFixed(2)}</Text>
              </Column>
            </Row>
          ))}

          <Hr style={hr} />

          <Section style={totals}>
            <Row>
              <Column>
                <Text style={label}>Subtotal</Text>
              </Column>
              <Column style={{ textAlign: 'right' as const }}>
                <Text style={value}>R {subtotal.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Shipping</Text>
              </Column>
              <Column style={{ textAlign: 'right' as const }}>
                <Text style={value}>R {shippingCost.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={{ ...label, fontWeight: 'bold' }}>Total</Text>
              </Column>
              <Column style={{ textAlign: 'right' as const }}>
                <Text style={{ ...value, fontWeight: 'bold', fontSize: '18px' }}>
                  R {total.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Your invoice is attached as a PDF. If you have any questions, reply to this email.
          </Text>
          <Text style={footer}>— The 8-Ball Africa Team</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = { backgroundColor: '#0a0f1e', fontFamily: 'Inter, sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' }
const h1 = { color: '#06b6d4', fontSize: '28px', marginBottom: '16px' }
const h2 = { color: '#e2e8f0', fontSize: '18px', marginBottom: '12px' }
const text = { color: '#cbd5e1', fontSize: '14px', lineHeight: '24px' }
const label = { color: '#94a3b8', fontSize: '12px', margin: '0' }
const value = { color: '#e2e8f0', fontSize: '14px', margin: '4px 0 0' }
const hr = { borderColor: '#1e293b', margin: '24px 0' }
const orderInfo = { margin: '16px 0' }
const itemRow = { marginBottom: '12px' }
const itemName = { color: '#e2e8f0', fontSize: '14px', margin: '0' }
const itemQty = { color: '#94a3b8', fontSize: '12px', margin: '2px 0 0' }
const itemPrice = { color: '#e2e8f0', fontSize: '14px', margin: '0' }
const totals = { margin: '16px 0' }
const footer = { color: '#64748b', fontSize: '12px', marginTop: '8px' }
