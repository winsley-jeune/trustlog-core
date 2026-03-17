import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: hire } = await supabase
    .from('hires')
    .select('*')
    .eq('id', id)
    .single()

  if (!hire) {
    return NextResponse.json({ error: 'Hire not found' }, { status: 404 })
  }

  // Only the hirer can cancel
  if (user.id !== hire.hirer_id) {
    return NextResponse.json({ error: 'Only the hirer can cancel' }, { status: 403 })
  }

  if (hire.status !== 'pending' && hire.status !== 'active') {
    return NextResponse.json({ error: 'Only pending or active hires can be cancelled' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('hires')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to cancel hire' }, { status: 500 })
  }

  return NextResponse.json(updated)
}
