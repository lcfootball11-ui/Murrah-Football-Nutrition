import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'phoneNumber and message required' }, { status: 400 })
    }

    // Check for Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to environment variables.' },
        { status: 500 }
      )
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    // Format phone number to E.164 format
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`

    console.log('Sending SMS via Twilio:', {
      to: formattedNumber,
      message,
      timestamp: new Date().toISOString(),
    })

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    })

    console.log('Twilio Response:', response.sid)

    return NextResponse.json({
      success: true,
      messageId: response.sid,
      phoneNumber: formattedNumber,
      message,
    })
  } catch (error: any) {
    console.error('SMS error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
