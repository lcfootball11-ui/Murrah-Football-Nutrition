import { NextRequest, NextResponse } from 'next/server'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'phoneNumber and message required' }, { status: 400 })
    }

    // Check for AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS credentials not configured. Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to Vercel environment variables.' },
        { status: 500 }
      )
    }

    const snsClient = new SNSClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    // Format phone number to E.164 format
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`

    console.log('Sending SMS:', {
      to: formattedNumber,
      message,
      timestamp: new Date().toISOString(),
    })

    const params = {
      Message: message,
      PhoneNumber: formattedNumber,
    }

    const command = new PublishCommand(params)
    const response = await snsClient.send(command)

    console.log('SNS Response:', response)

    return NextResponse.json({
      success: true,
      messageId: response.MessageId,
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
