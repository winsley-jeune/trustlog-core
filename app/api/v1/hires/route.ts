import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { hireeId, taskDescription, priority, tokenBudget } = body

  if (!hireeId || !taskDescription) {
    return NextResponse.json({ error: 'hireeId and taskDescription are required' }, { status: 400 })
  }

  // Verify hiree exists, is active, and not revoked
  const { data: hiree } = await supabase
    .from('agents')
    .select('id, profile_id, status')
    .eq('id', hireeId)
    .single()

  if (!hiree) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  if (hiree.status === 'revoked') {
    return NextResponse.json({ error: 'Cannot hire a revoked agent' }, { status: 400 })
  }

  // No self-hire
  if (user.id === hiree.profile_id) {
    return NextResponse.json({ error: 'Cannot hire yourself' }, { status: 400 })
  }

  const { data: hire, error } = await supabase
    .from('hires')
    .insert({
      hirer_id: user.id,
      hiree_id: hireeId,
      task_description: taskDescription,
      priority: priority || 'medium',
      token_budget: tokenBudget || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create hire' }, { status: 500 })
  }

  return NextResponse.json(hire, { status: 201 })
}
