-- Free payments: a seller's Venmo username, shown as "Pay with Venmo".
alter table public.listings add column venmo text
  check (venmo is null or venmo ~ '^[A-Za-z0-9_-]{5,30}$');
