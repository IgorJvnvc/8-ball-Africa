import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
  attachments?: { filename: string; content: Buffer }[]
}

export async function sendEmail({ to, subject, react, attachments }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
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
