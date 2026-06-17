import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // Check for GroupMe bot ID
    if (!process.env.GROUPME_BOT_ID) {
      return NextResponse.json({ error: 'GroupMe not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.groupme.com/v3/bots/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bot_id: process.env.GROUPME_BOT_ID,
        text: message,
      }),
    })

    if (!response.ok) {
      throw new Error(`GroupMe API error: ${response.statusText}`)
    }

    return NextResponse.json({ success: true, service: 'GroupMe' })
  } catch (error) {
    console.error('GroupMe send error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
