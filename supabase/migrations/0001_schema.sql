-- Curb schema: profiles, listings, buyer-seller threads and their messages.
-- Run in the Supabase SQL editor or with `supabase db push`.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null default '',
  campus text,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 600),
  category text not null check (category in ('furniture', 'appliances', 'electronics', 'kitchen', 'decor', 'books', 'bikes', 'other')),
  price_cents integer not null default 0 check (price_cents between 0 and 50000),
  pickup_spot text not null,
  photo_url text,
  status text not null default 'active' check (status in ('active', 'handed_off', 'removed')),
  created_at timestamptz not null default now(),
  -- Every listing lives 72 hours; relisting pushes this forward.
  expires_at timestamptz not null default (now() + interval '72 hours')
);
create index listings_feed_idx on public.listings (status, expires_at desc, created_at desc);
create index listings_seller_idx on public.listings (seller_id);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id), -- one conversation per buyer per listing
  check (buyer_id <> seller_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index messages_thread_idx on public.messages (thread_id, created_at);

-- A profile row appears when someone first confirms their sign-in link.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, campus)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    split_part(split_part(lower(new.email), '@', 2), '.', -2)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Photos: a public bucket for listing images.
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Live chat: stream new messages to the two people in a thread.
alter publication supabase_realtime add table public.messages;
