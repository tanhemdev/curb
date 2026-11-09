-- Pinned listings and public seller names.

-- Pinned listings stay on the feed instead of expiring after 72 hours (the
-- founder's showcase items). Only the database owner can pin: students can't
-- set or change this column.
alter table public.listings add column pinned boolean not null default false;
create function public.guard_pinned() returns trigger
language plpgsql as $$
begin
  if new.pinned is distinct from old.pinned and current_user in ('authenticated', 'anon') then
    raise exception 'Only the Curb owner can pin listings.';
  end if;
  return new;
end;
$$;
create trigger listings_guard_pinned before update on public.listings
  for each row execute function public.guard_pinned();

drop policy "live listings are public" on public.listings;
create policy "live listings are public" on public.listings
  for select using (status = 'active' and (pinned or expires_at > now()));

drop policy "post as yourself" on public.listings;
create policy "post as yourself" on public.listings
  for insert to authenticated with check (
    auth.uid() = seller_id and status = 'active' and not pinned
    and expires_at <= now() + interval '72 hours 1 minute'
  );

drop policy "buyers open threads on live listings" on public.threads;
create policy "buyers open threads on live listings" on public.threads
  for insert to authenticated with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = threads.seller_id and l.seller_id <> auth.uid()
        and l.status = 'active' and (l.pinned or l.expires_at > now())
    )
  );

-- Visitors who aren't signed in can see a seller's name (never their email),
-- so listing pages say who's selling.
create policy "seller names are public" on public.profiles for select to anon using (true);
revoke select on public.profiles from anon;
grant select (id, name, campus) on public.profiles to anon;
