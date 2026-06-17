import { NextRequest, NextResponse } from 'next/server'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

const snsClient = new SNSClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Missing phone number or message' }, { status: 400 })
    }

    // Format phone number to E.164 format (e.g., +1234567890)
    const formattedPhone = phoneNumber.replace(/\D/g, '')
    const e164Phone = formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`

    const command = new PublishCommand({
      Message: message,
      PhoneNumber: e164Phone,
    })

    await snsClient.send(command)

    return NextResponse.json({ success: true, message: 'SMS sent successfully' })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
