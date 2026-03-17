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

  // Fetch hire and verify the hiree is completing it
  const { data: hire } = await supabase
    .from('hires')
    .select('*, agents!hires_hiree_id_fkey(profile_id)')
    .eq('id', id)
    .single()

  if (!hire) {
    return NextResponse.json({ error: 'Hire not found' }, { status: 404 })
  }

  // Only the hiree (agent) can mark as complete
  const hireeProfileId = (hire as Record<string, unknown>).agents
    ? ((hire as Record<string, unknown>).agents as Record<string, unknown>).profile_id
    : null

  if (user.id !== hireeProfileId) {
    return NextResponse.json({ error: 'Only the hiree can complete this hire' }, { status: 403 })
  }

  if (hire.status !== 'pending' && hire.status !== 'active') {
    return NextResponse.json({ error: 'Hire is not in a completable state' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('hires')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to complete hire' }, { status: 500 })
  }

  return NextResponse.json(updated)
}
