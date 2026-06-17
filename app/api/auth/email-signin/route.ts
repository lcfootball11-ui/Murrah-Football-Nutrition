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

    // Check if user exists
    const { data: { users = [] } } = await admin.auth.admin.listUsers()
    let user = users.find(u => u.email === email)

    if (!user) {
      // Create new user with random password
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-12),
        email_confirm: true,
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }

      user = newUser.user

      // Create profile for new user
      await admin.from('profiles').insert({
        id: user.id,
        full_name: email.split('@')[0],
        role: 'athlete',
      })
    }

    // Create a session directly using admin privileges
    const { data: { session }, error: sessionError } = await admin.auth.admin.createSession(user.id)

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 })
    }

    // Get user profile to determine redirect
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    return NextResponse.json({
      success: true,
      session,
      redirectTo: profile?.role === 'coach' ? '/dashboard' : '/log',
    })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 })
  }
}
