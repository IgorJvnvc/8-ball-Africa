import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// GET /api/orders/:id/stream - SSE for order status updates
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', orderId: id })}\n\n`))

      // In production, this would subscribe to a pub/sub system (Redis, etc.)
      // For demo purposes, we'll send a heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
