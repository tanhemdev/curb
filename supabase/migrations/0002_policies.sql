-- Row-level security: the database decides who can read and write each row,
-- so a modified client still can't see someone else's messages or edit
-- someone else's listing.

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;

-- Profiles: signed-in students can see names (to show who's selling);
-- you can only edit your own.
create policy "profiles readable by signed-in users" on public.profiles
  for select to authenticated using (true);
create policy "edit own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Listings: anyone can browse live listings; expired, removed or handed-off
-- rows are hidden from everyone except the seller.
create policy "live listings are public" on public.listings
  for select using (status = 'active' and expires_at > now());
create policy "sellers see their own listings" on public.listings
  for select to authenticated using (auth.uid() = seller_id);
create policy "post as yourself" on public.listings
  for insert to authenticated with check (
    auth.uid() = seller_id and status = 'active' and expires_at <= now() + interval '72 hours 1 minute'
  );
create policy "sellers update their own listings" on public.listings
  for update to authenticated using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id and expires_at <= now() + interval '72 hours 1 minute');

-- Threads: only the buyer and the seller can see a conversation. A buyer can
-- open one on a live listing that isn't theirs.
create policy "participants see their threads" on public.threads
  for select to authenticated using (auth.uid() in (buyer_id, seller_id));
create policy "buyers open threads on live listings" on public.threads
  for insert to authenticated with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = threads.seller_id and l.seller_id <> auth.uid()
        and l.status = 'active' and l.expires_at > now()
    )
  );

-- Messages: only participants can read or send, and only as themselves.
create policy "participants read messages" on public.messages
  for select to authenticated using (
    exists (select 1 from public.threads t where t.id = thread_id and auth.uid() in (t.buyer_id, t.seller_id))
  );
create policy "participants send messages" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id
    and exists (select 1 from public.threads t where t.id = thread_id and auth.uid() in (t.buyer_id, t.seller_id))
  );

-- Photos: anyone can view; each user uploads only into a folder named after them.
create policy "upload into your own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
