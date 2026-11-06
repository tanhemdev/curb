-- Reviews, extra photos and Stripe Payment Links.

-- Listings: up to 5 extra photos, an optional Stripe Payment Link (Apple Pay,
-- Link and cards through Stripe's own checkout), and a $1,000 price cap.
alter table public.listings add column photos text[] not null default '{}' check (cardinality(photos) <= 5);
alter table public.listings add column payment_link text
  check (payment_link is null or payment_link ~ '^https://buy\.stripe\.com/[A-Za-z0-9_/-]{3,}$');
alter table public.listings drop constraint listings_price_cents_check;
alter table public.listings add constraint listings_price_cents_check check (price_cents between 0 and 100000);

-- Reviews of a seller, tied to the listing they were about.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  listing_title text not null default '',
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 400),
  created_at timestamptz not null default now(),
  unique (listing_id, author_id), -- one review per person per listing
  check (author_id <> seller_id)
);
create index reviews_seller_idx on public.reviews (seller_id, created_at desc);

-- The database fills in the reviewer's first name and the listing title, so
-- a client can't pass off a review under someone else's name.
create function public.fill_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.author_name := coalesce((select split_part(name, ' ', 1) from public.profiles where id = new.author_id), 'A buyer');
  select l.title, l.seller_id into new.listing_title, new.seller_id from public.listings l where l.id = new.listing_id;
  new.created_at := now();
  return new;
end;
$$;
create trigger reviews_fill before insert on public.reviews
  for each row execute function public.fill_review();

alter table public.reviews enable row level security;

create policy "reviews are public" on public.reviews for select using (true);

-- Only someone who messaged the seller about that listing can review it.
create policy "buyers who messaged can review" on public.reviews
  for insert to authenticated with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.threads t
      where t.listing_id = reviews.listing_id and t.buyer_id = auth.uid() and t.seller_id = reviews.seller_id
    )
  );
create policy "delete your own review" on public.reviews
  for delete to authenticated using (auth.uid() = author_id);
