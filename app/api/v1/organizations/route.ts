import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: body.name,
      slug,
      domain: body.domain || null,
      billing_email: body.billingEmail || user.email || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create org' }, { status: 500 })
  }

  await supabase.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  })

  return NextResponse.json(org, { status: 201 })
}
