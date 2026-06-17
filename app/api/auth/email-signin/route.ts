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

    // Try to create new user, if they exist already that's fine
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
    })

    let userId: string

    if (createError && !createError.message.includes('already been registered')) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (newUser?.user) {
      // New user was created
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
    } else {
      // User already exists, get their ID by generating a magic link then extracting it
      const tempLink = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })
      userId = tempLink.data?.user?.id || ''
      if (!userId) {
        return NextResponse.json({ error: 'Could not determine user ID' }, { status: 400 })
      }
    }

    // Generate a magic link
    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`,
      },
    })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    // Extract token from the link URL
    const linkUrl = new URL(data.properties?.action_link || '')
    const token = linkUrl.searchParams.get('token_hash')

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
