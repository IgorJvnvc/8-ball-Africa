import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_FOLDERS = new Set(['products', 'categories'])

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const requestedFolder = (searchParams.get('folder') || 'products').trim().toLowerCase()
    const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'products'

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Use JPG, PNG, WEBP, or GIF.' },
        { status: 400 },
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'File is empty' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File is too large (max 4MB)' },
        { status: 400 },
      )
    }

    const timestamp = Date.now()
    const fileName = sanitizeFileName(file.name || 'image')

    const blob = await put(`${folder}/${timestamp}-${fileName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })

    return NextResponse.json({ success: true, data: { url: blob.url } })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 })
  }
}
