-- Tanya's showcase listings, pinned so they stay on the feed. Run once in the
-- Supabase SQL editor after tanyahemdev@berkeley.edu has signed in once.
with me as (select id from public.profiles where email = 'tanyahemdev@berkeley.edu')
insert into public.listings (seller_id, title, description, category, price_cents, pickup_spot, photo_url, photos, pinned)
select me.id, v.title, v.description, v.category, v.price_cents, v.pickup_spot, v.photo_url, v.photos, true
from me, (values
  ('3 cameras: Canon, Panasonic and JVC',
   'All three for $95: Canon PowerShot A400, Panasonic Lumix with 16x zoom (25mm wide) and a JVC Everio 20GB HDD camcorder with lens cap. Great for that early-2000s digicam look.',
   'electronics', 9500, 'Northside (Euclid & Hearst)',
   'https://tanhemdev.github.io/curb/listings/cameras.jpg', '{}'::text[]),
  ('Cloud-style deep-seated sofa, white linen',
   'FREE (was listed at $400). Living Spaces cloud-style deep-seated sofa in white linen with four big pillows. Super comfy, some light marks on the fabric. You pick up: it needs two people and a van or SUV.',
   'furniture', 0, 'Albany',
   'https://tanhemdev.github.io/curb/listings/sofa-1.jpg', array['https://tanhemdev.github.io/curb/listings/sofa-2.jpg']),
  ('New automatic mahjong table',
   'Brand-new fully automatic mahjong table: shuffles and deals for you. White top with a folding base, still in the original boxes (second photo).',
   'furniture', 80000, 'Central Berkeley',
   'https://tanhemdev.github.io/curb/listings/mahjong-1.jpg', array['https://tanhemdev.github.io/curb/listings/mahjong-2.jpg']),
  ('Rare Trader Joe''s bags',
   'Free: two collectible Trader Joe''s reusable bags, the yellow whole-kernel-corn can and the orange I-heart-TJ''s city print.',
   'other', 0, 'Southside',
   'https://tanhemdev.github.io/curb/listings/tj-bags.jpg', '{}'::text[])
) as v(title, description, category, price_cents, pickup_spot, photo_url, photos)
where not exists (select 1 from public.listings l where l.seller_id = me.id and l.title = v.title)
returning title;
