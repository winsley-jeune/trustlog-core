create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  email text,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can insert feedback"
  on public.feedback for insert
  with check (true);

create policy "Service role can read feedback"
  on public.feedback for select
  using (false);
