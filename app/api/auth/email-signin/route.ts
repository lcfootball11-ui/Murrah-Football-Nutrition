import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function generateSupabaseJWT(userId: string) {
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '')

  const jwt = await new SignJWT({
    sub: userId,
    aud: 'authenticated',
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)

  return jwt
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

    // Get user profile to determine redirect
    const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()

    // Generate JWT token
    const accessToken = await generateSupabaseJWT(userId)

    return NextResponse.json({
      success: true,
      accessToken,
      userId,
      redirectTo: profile?.role === 'coach' ? '/dashboard' : '/log',
    })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 })
  }
}
