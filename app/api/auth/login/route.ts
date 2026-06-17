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
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .single()

    let userId: string
    let role: string = 'athlete'

    if (existingProfile) {
      // User exists
      userId = existingProfile.id
      role = existingProfile.role || 'athlete'
    } else {
      // Create new user profile
      const { data: newProfile, error: insertError } = await admin
        .from('profiles')
        .insert({
          email,
          full_name: email.split('@')[0],
          role: 'athlete',
        })
        .select('id')
        .single()

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 400 })
      }

      userId = newProfile.id
    }

    return NextResponse.json({
      success: true,
      userId,
      email,
      role,
      redirectTo: role === 'coach' ? '/dashboard' : '/log',
    })
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
