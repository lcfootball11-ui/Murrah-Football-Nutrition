import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 })
    }

    // Check for GroupMe bot ID
    if (!process.env.GROUPME_BOT_ID) {
      return NextResponse.json(
        { error: 'GroupMe bot ID not configured. Add GROUPME_BOT_ID to environment variables.' },
        { status: 500 }
      )
    }

    console.log('Sending message via GroupMe:', {
      message,
      timestamp: new Date().toISOString(),
    })

    const response = await fetch('https://api.groupme.com/v3/bots/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bot_id: process.env.GROUPME_BOT_ID,
        text: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GroupMe API error: ${error}`)
    }

    console.log('GroupMe message sent')

    return NextResponse.json({
      success: true,
      message,
      service: 'GroupMe',
    })
  } catch (error: any) {
    console.error('GroupMe error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
