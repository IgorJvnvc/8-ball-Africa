import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('Resend API key is not configured')
  }
  return new Resend(apiKey)
}

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
  attachments?: { filename: string; content: Buffer }[]
}

export async function sendEmail({ to, subject, react, attachments }: SendEmailOptions) {
  const { data, error } = await getResendClient().emails.send({
    from: '8-Ball Africa <orders@8ballafrica.com>',
    to,
    subject,
    react,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  })

  if (error) {
    console.error('[Email Error]', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}
