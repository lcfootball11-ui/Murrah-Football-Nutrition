import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Missing phone number or message' }, { status: 400 })
    }

    // Check for Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    // Format phone number to E.164 format
    const formattedPhone = phoneNumber.replace(/\D/g, '')
    const e164Phone = formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: e164Phone,
    })

    return NextResponse.json({ success: true, messageId: response.sid })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
