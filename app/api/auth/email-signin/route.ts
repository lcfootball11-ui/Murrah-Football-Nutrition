import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const admin = adminClient()

    // Try to get existing user by email
    const { data: existingUser } = await admin.auth.admin.getUserByEmail(email)

    let userId: string

    if (existingUser?.id) {
      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-12),
        email_confirm: true,
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }

      userId = newUser.user.id

      // Create profile for new user
      const { error: profileError } = await admin.from('profiles').insert({
        id: userId,
        full_name: email.split('@')[0],
        role: 'athlete',
      })
      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    // Generate a magic link to get a valid token
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    // Extract token from the link
    const actionLink = linkData.properties?.action_link || ''
    const tokenMatch = actionLink.match(/token_hash=([^&]+)/)
    const token = tokenMatch ? tokenMatch[1] : ''

    // Get user profile to determine redirect
    const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()

    return NextResponse.json({
      success: true,
      token,
      redirectTo: profile?.role === 'coach' ? '/dashboard' : '/log',
    })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 })
  }
}
