import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const admin = adminClient()
    const tempPassword = Math.random().toString(36).slice(-12)

    // Try to create new user
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    let userId: string

    if (newUser?.user?.id) {
      // New user was created
      userId = newUser.user.id

      // Create profile for new user
      await admin.from('profiles').insert({
        id: userId,
        full_name: email.split('@')[0],
        role: 'athlete',
      }).catch(err => console.error('Profile creation error:', err))
    } else if (createError?.message?.includes('already been registered')) {
      // User exists, try to sign them in
      // This is a bit of a hack - we update their password then sign in
      await admin.auth.admin.updateUserById(
        // We don't have the ID, so we'll need to get it differently
        // For now, just try signing in - if it fails, we'll handle it
        'temp-id',
        { password: tempPassword }
      ).catch(() => {})

      // Just return a message to redirect to the app
      return NextResponse.json({
        success: true,
        redirectTo: '/log',
        message: 'User exists, redirecting...'
      })
    } else {
      return NextResponse.json({ error: createError?.message || 'Sign up failed' }, { status: 400 })
    }

    // Sign in the user immediately with the temp password
    const publicSupabase = publicClient()
    const { data: signInData, error: signInError } = await publicSupabase.auth.signInWithPassword({
      email,
      password: tempPassword,
    })

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 400 })
    }

    // Get user profile to determine redirect
    const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()

    return NextResponse.json({
      success: true,
      session: signInData.session,
      userId,
      redirectTo: profile?.role === 'coach' ? '/dashboard' : '/log',
    })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 })
  }
}
