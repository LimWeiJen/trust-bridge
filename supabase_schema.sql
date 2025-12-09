-- 1. Create the table
create table verification_requests (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  requester_name text,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  owner_id text,                 -- The ID of the user who approved it
  created_at timestamptz default now()
);

-- 2. Enable Realtime for this table
-- This is crucial! Without this, "postgres_changes" listeners won't fire.
alter publication supabase_realtime add table verification_requests;

-- 3. (Optional) Disable RLS for Hackathon/Prototype speed
-- WARNING: Don't do this in production.
alter table verification_requests enable row level security;
create policy "Enable all access for all users" on verification_requests for all using (true) with check (true);
