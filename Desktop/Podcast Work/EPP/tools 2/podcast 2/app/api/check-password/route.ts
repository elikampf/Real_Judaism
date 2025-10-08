import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const correctPassword = process.env.PASSWORD

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'Password not configured' },
        { status: 500 }
      )
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
