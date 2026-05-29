import { sendEmail } from '@/lib/email/resend'
import { OrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { generateInvoicePDF } from '@/lib/invoice/generate-pdf'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface SendInvoiceParams {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
}

/**
 * Generates a PDF invoice and sends an order confirmation email with the PDF attached.
 */
export async function sendOrderInvoice(params: SendInvoiceParams) {
  const {
    customerName,
    customerEmail,
    orderNumber,
    orderDate,
    items,
    subtotal,
    shippingCost,
    total,
  } = params

  // Generate PDF invoice
  const pdfBuffer = await generateInvoicePDF({
    invoiceNumber: orderNumber,
    orderDate,
    customerName,
    customerEmail,
    items,
    subtotal,
    shippingCost,
    total,
  })

  // Send email with PDF attachment
  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmed - #${orderNumber} | 8-Ball Africa`,
    react: OrderConfirmationEmail({
      customerName,
      orderNumber,
      orderDate,
      items,
      subtotal,
      shippingCost,
      total,
    }),
    attachments: [
      {
        filename: `invoice-${orderNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  })
}
