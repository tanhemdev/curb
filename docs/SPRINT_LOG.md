# Curb  -  Sprint Log

**Timeline:** April 8 – May 12, 2024 (4 weeks to pilot)
**Team:** Just me (Tanya), with design feedback from two friends

---

## Week 1: Auth + Listing Flow (Apr 8-14)

### Goals
- Firebase project setup
- .edu email authentication
- Basic listing creation (photo, title, price, location)

### What happened

**Monday-Tuesday:** Set up Firebase project, configured Auth with email link sign-in. Spent way too long figuring out why the magic link wasn't working  -  turns out I had the wrong `actionCodeSettings.url` and the redirect was going to localhost in production. Classic.

**Wednesday:** Built the .edu domain validation. Initially did it client-side only (just check if the email ends in `.edu`) but then realized someone could modify the client. Added the Cloud Function to validate on `onCreate` and set custom claims. This took longer than expected because custom claims don't propagate immediately  -  the client needs to force a token refresh. Added a polling mechanism that checks every 2 seconds after sign-up until the claim appears.

**Thursday-Friday:** Listing creation flow. Photo upload -> title -> price -> pin drop -> submit. Got the basic flow working but the photo upload was painfully slow on mobile. Realized I wasn't compressing before upload. Added client-side compression with `browser-image-compression` library  -  uploads went from 8-12 seconds to under 2 seconds.

**Weekend:** Pin drop using Google Maps. The map embed was weirdly hard to style to not look terrible on mobile. Ended up using `@react-google-maps/api` and spending a solid 4 hours getting the pin to actually land where you tap. Touch coordinates on mobile maps are a nightmare.

### Shipped
- [x] Firebase Auth with .edu email link
- [x] Custom claims for campus verification
- [x] Photo upload with client-side compression
- [x] Listing creation flow (basic)
- [x] Pin drop on Google Maps

### Didn't ship
- [ ] Pin drop accuracy still off on some Android phones
- [ ] No loading states yet (screen just freezes during upload)

### Learnings
- Firebase Auth custom claims are powerful but the propagation delay is annoying. Document this for anyone who follows.
- Always compress images client-side first. Always.

---

## Week 2: Feed + Search + Geo (Apr 15-21)

### Goals
- Pinterest-style masonry feed
- Category filtering
- Geo-fencing (campus radius validation)
- Basic search

### What happened

**Monday-Tuesday:** Built the masonry feed. Tried `react-masonry-css` first but it was janky with variable-height images. Switched to CSS columns which actually worked better and was simpler. The feed subscribes to Firestore in real-time so new listings pop in without refresh  -  that moment when I listed a test item on my laptop and it appeared on my phone instantly was genuinely exciting.

**Wednesday:** Category filtering. Added a horizontal scrolling chip bar at the top of the feed (furniture, electronics, kitchen, textbooks, misc). Each category maps to a Firestore compound query. Had to create composite indexes  -  Firebase CLI makes this easy but I kept forgetting and then getting the "needs index" error in console. Created all the indexes I could think of up front.

**Thursday:** Geo-fencing. Defined Berkeley's campus boundary as a center point + 3.2km radius (generous enough to include off-campus apartments on Southside and Northside). Validation happens at listing creation  -  if your pin is outside the radius, you get a warning. For the feed, I just filter by `campus` field since every listing is already validated. Considered using Geohashes for true radius queries but decided it was overkill for pilot. Campus-level filtering is fine when you only have one campus.

**Friday-Weekend:** Search. Initially planned to use Algolia but the free tier limits seemed tight and I didn't want another service to manage. Implemented basic search using Firestore  -  querying on title with `>=` and `<=` string range. It's hacky and only matches from the start of the title, but it works for "desk" and "fridge" which are the main things people search for. Will replace with proper full-text search later.

Also added the 72-hour expiry badge to listing cards. Shows a countdown ("expires in 14h") and the card gets a subtle yellow border when under 8 hours. This was a small UI thing but it really drives the urgency feeling.

### Shipped
- [x] Masonry feed with real-time updates
- [x] Category filter chips
- [x] Geo-fence validation on listing creation
- [x] Campus-level feed filtering
- [x] Basic title search
- [x] Expiry countdown badges
- [x] Pull-to-refresh

### Didn't ship
- [ ] Search is really limited (prefix-only matching)
- [ ] No "sort by" options yet (just reverse chronological)

### Learnings
- CSS columns > JS masonry libraries for this use case
- Don't over-engineer geo-queries when campus-level filtering works
- Real-time Firestore listeners are magic for UX but make sure to unsubscribe properly or you'll get memory leaks

---

## Week 3: Chat + Handoff (Apr 22-28)

### Goals
- 1:1 in-app messaging
- Claim flow ("I want this" -> notification -> chat)
- Handoff confirmation
- Push notifications

### What happened

**Monday-Tuesday:** Chat system. Built using Firestore subcollections (`chats/{chatId}/messages/{messageId}`). Real-time listener on the messages subcollection gives instant message delivery. The tricky part was structuring the chat creation  -  when someone claims an item, we need to check if a chat already exists between those two users for that listing, and if so, reopen it instead of creating a new one. Wrote a Cloud Function to handle this atomically.

**Wednesday:** The claim flow. User taps "I want this" -> creates a chat (or reopens one) -> sends an auto-message "Hey! I'm interested in your [item]" -> seller gets notified. Debated whether to let the buyer customize the first message or just auto-send. Went with auto-send to reduce friction  -  you can always type a follow-up.

**Thursday:** Push notifications via FCM. This was BY FAR the most annoying part of the entire build. PWA push notifications require:
1. Service worker registration
2. User permission prompt (and handling "denied")
3. FCM token generation and storage
4. Cloud Function to send notifications
5. Handling token refresh

Got it working on Chrome Android after many hours. Safari on iOS was a whole other nightmare  -  PWA push only works on iOS 16.4+ and requires the app to be added to home screen first. Decided to just handle this gracefully: if push isn't available, we fall back to in-app notification badges.

**Friday-Weekend:** Handoff confirmation. After a chat, either party can tap "Handoff complete." Both parties confirm -> listing status changes to `claimed` -> removed from feed -> both users get a feel-good "You diverted a [item] from the landfill!" message. Added a simple counter that shows total items diverted campus-wide on the feed screen.

### Shipped
- [x] 1:1 real-time chat
- [x] Claim flow with auto-first-message
- [x] Push notifications (Chrome Android)
- [x] In-app notification badges (fallback)
- [x] Handoff confirmation (both-party)
- [x] Diversion counter on feed

### Didn't ship
- [ ] Push notifications on iOS Safari (partially working, needs home screen install)
- [ ] Read receipts (nice to have, not critical)
- [ ] Chat photo sharing

### Learnings
- PWA push notifications are still a mess in 2024, especially on iOS. If I were starting over, I might seriously consider React Native for this reason alone.
- The "both parties confirm handoff" flow adds friction but is important for accurate metrics. One-sided confirmation would inflate our diversion numbers.

---

## Week 4: Pilot Launch (Apr 29 - May 12)

### Goals
- Polish, bug fixes, loading states
- Onboard 50 seed users before move-out starts
- Launch during move-out week (May 8-12)
- Survive

### What happened

**Monday-Wednesday (Apr 29 - May 1):** Polish sprint. Added loading skeletons, error boundaries, empty states. Fixed a nasty bug where the feed would show expired listings for a split second before the query filter kicked in (race condition with the real-time listener). Added the PWA manifest and made sure "Add to Home Screen" worked properly. Tested on 6 different phones borrowed from friends  -  found and fixed 3 layout bugs on smaller screens.

**Thursday-Friday (May 2-3):** Onboarding. Texted 50 people I know at Berkeley  -  mostly seniors I knew were moving out. Made a 30-second screen recording showing how to list an item. Sent it in 6 group chats. Got 47 people signed up by Friday night. Three people had issues with the magic link email going to spam  -  added a "check your spam folder" message to the sign-up flow.

**Saturday-Sunday (May 4-5):** Pre-launch seeding. Asked 8 friends to list at least one item each so the feed wouldn't be empty on day one. Got 23 listings up. One friend listed her entire kitchen in 4 separate listings  -  pots, plates, utensils, and a rice cooker. The feed looked legit.

**Move-Out Week (May 8-12):**

*May 8 (Wednesday):* Shared the link in 4 more group chats and the Berkeley Free & For Sale Facebook group. Posted: "if you're moving out and have stuff to get rid of, this is faster than F&FS." Got 40 new sign-ups and 35 new listings by end of day. First organic handoff happened at 2pm  -  someone claimed a desk lamp within 20 minutes of it being listed. I genuinely screamed.

*May 9 (Thursday):* Things picked up. 89 new listings. The feed was actually bustling. Had a minor panic when a Firestore read quota warning appeared  -  turns out the real-time listener was re-fetching every listing every time any listing updated. Added a more targeted query. Crisis averted.

*May 10 (Friday):* Peak day. 156 new listings. Chat system was getting hammered  -  200+ messages sent. One user listed a couch and got 7 claims in under an hour. Had to add a "multiple people interested" indicator to help sellers manage. Stayed up until 2am monitoring everything.

*May 11-12 (Sat-Sun):* Tail end of move-out. New listings slowed to ~60/day but claims stayed strong. A lot of the remaining items were free. One user messaged me: "this is the first time I've moved out of a place without feeling guilty about what I left behind." That message made the whole month worth it.

### Final pilot numbers
- 214 total users
- 800+ items listed
- 584 successful handoffs (73% conversion)
- 1,200+ chat messages sent
- 0 major outages
- 1 Firebase billing scare (stayed within free tier by $2)

### Shipped
- [x] Loading skeletons and empty states
- [x] Error boundaries
- [x] PWA manifest + install prompt
- [x] Onboarded 50 seed users
- [x] Survived move-out week
- [x] Did not crash

### What broke
- Real-time listener efficiency (fixed during week)
- Magic link emails going to spam for some .edu addresses (partially mitigated)
- One user uploaded a 25MB photo and the upload hung forever (added file size validation)
- Pin drop location was wrong on two listings (user reported  -  likely the Android accuracy issue from Week 1)

---

## Post-Pilot Retro

### What worked
1. **72-hour expiry was the right call.** It created urgency and kept the feed clean. Zero complaints about it.
2. **Photo-first listing was fast.** Average listing creation time was 47 seconds. Way under our 2-minute target.
3. **The counter was motivating.** Multiple users mentioned the "800+ items diverted" counter as something that made them want to participate.
4. **Free items moved fast.** Free listings had a 91% conversion rate vs. 62% for priced items.

### What didn't work
1. **Search was useless.** Only 12% of users even tried it, and the prefix-matching meant "shelf" wouldn't find "bookshelf." Need real search.
2. **No way to relist easily.** When a handoff fell through, sellers had to create a whole new listing. Need a "relist" button.
3. **Push notifications were unreliable.** Only ~40% of users accepted the push prompt. Most people just checked the app periodically.
4. **No reporting/blocking.** Didn't need it for pilot (small, trusted community) but will need it at scale.

### Surprised us
- **Textbooks moved faster than expected.** 12% of listings but 89% conversion rate. Might warrant its own category or flow.
- **People wrote nice messages.** The chat wasn't just transactional  -  people said thanks, shared stories about the items. One person wrote a paragraph about the desk's history. Unexpected warmth.
- **Evening listings performed better.** Items listed between 6-10pm got claimed 2.3x faster than morning listings. Probably because people browse after dinner.

---

*Sprint log format inspired by Basecamp's Hill Charts concept  -  are we uphill (figuring it out) or downhill (executing)?*
