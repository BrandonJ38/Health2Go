@AGENTS.md

# Health App

Expo + React Native app focused on health, wellness, and longevity.

## Stack
Same as the nihongo-app (`../nihongo-app`):
- Expo ~57.0.4 (see AGENTS.md — v57 changed a lot, check versioned docs before coding)
- React 19.2 / React Native 0.86, TypeScript (strict mode)
- expo-router for navigation
- react-native-reanimated, gesture-handler, svg
- @react-native-async-storage/async-storage for local data
- expo-location (Healthy Nearby)
- Planned: Supabase (accounts, sync, user reports), expo-camera barcode scanning, Open Food Facts (product data), expo-notifications (daily tips)

## Commands
- `npm start` — Expo dev server (then choose platform)
- `npm run android` / `npm run ios` / `npm run web`

## Current State
Navigation skeleton built (expo-router, entry `expo-router/entry`). Healthy Nearby is fully built; all other screens are placeholders listing planned features.
- `app/_layout.tsx` — root Stack; `app/profile.tsx` opens from the header icon on every tab
- `app/(tabs)/` — bottom tabs: `index` (Home), `tracker`, `nearby`, `learn`, `diet`
- `components/` — `Screen` (shared page wrapper), `HeaderHomeButton` (header Home button on pages opened directly); `constants/theme.ts` — colors/spacing
- **Healthy Nearby is built and live** (Google key in `.env.local`, Places API (New) enabled; tested 2026-10-13 against Austin, TX):
  - `app/api/nearby+api.ts` — server route (`web.output: "server"` in app.json); reads `GOOGLE_PLACES_API_KEY` from `.env.local` (gitignored, never bundled). 30-min in-memory cache per area/food/filter search.
  - `lib/nearby/googlePlaces.ts` — server-only Google Places (New) calls: Nearby Search (5 km, fast food excluded), Text Search for city/zip, food searches, and per-filter targeted searches.
  - `lib/nearby/scoring.ts` — fast-food filter (type + chain list), keyword rules per criterion with negation handling, price mapping, ranking. Tune the rules here.
  - `lib/nearby/websiteScan.ts` — reads restaurant homepage + menu page for keywords and online-ordering links.
  - `lib/nearby/verifiedSources.ts` — sourced Verified list (chain announcements, Seed Oil Free Certified restaurants).
  - `app/(tabs)/nearby.tsx` + `components/nearby/RestaurantCard.tsx` — food search, location/city/zip, filters, cards with badges, $ price, evidence and action buttons.
- **Build step 1 (Onboarding + Profile) is done** (2026-10-19, tested end to end with a scripted headless-Edge run):
  - `lib/profile/` — `options.ts` (all answer options), `types.ts` (Profile shape, defaults, unit helpers; body stats stored metric), `ProfileContext.tsx` (`useProfile()`, saved to AsyncStorage key `profile:v1`, on-device only).
  - `app/setup.tsx` — one screen for every flow: `?mode=quick` (required quick start), `?mode=more` (optional Personalize more), `?mode=edit&step=<id>` (edit one answer). Steps defined in `components/setup/steps.tsx`.
  - `app/(tabs)/_layout.tsx` redirects to the quick start until `onboardingComplete`. Home shows a "Finish personalizing" card until `personalizeComplete`.
  - `app/profile.tsx` — all answers, tap to edit, "Start over" (two-tap confirm).
  - Nearby filters default from the avoid list (seed oils → Seed-oil free, added sugar → No added sugar, ultra-processed → Fresh ingredients).
  - Restaurant picker is a scrolling list with logos (Google favicon service, letter fallback) and a filter box.
- **Build step 2 (Calorie tracker + barcode scanner) is done** (2026-10-19, tested end to end on web; camera scanning not yet tested on a phone):
  - `lib/food/targets.ts` — Mifflin-St Jeor × activity, goal adjustment, safe-pace limit (1% body weight/week) with warning, minimum calories, macros by goal/eating style, user override (`profile.calorieTargetOverride`). Profile now stores `birthYear` (Age field on the body step).
  - `lib/food/avoidCheck.ts` — flags avoid-list ingredients (ingredient names, E-number additive tags, NOVA 4 = ultra-processed, trans fat), handles "no added sugar"/"sugar alcohol" exclusions; `rateFood` → Good (0 flags) / Okay (1) / Avoid (2+ or trans fats), counting only the user's own avoid list.
  - `lib/food/openFoodFacts.ts` + `app/api/food+api.ts` — server-side Open Food Facts: product by barcode (v2 API) and name search (search.openfoodfacts.org, US products first, worldwide fallback). 24 h cache. The legacy `cgi/search.pl` endpoint was returning 503.
  - `lib/food/FoodLogContext.tsx` — food log in AsyncStorage `foodlog:v1`; `recent()` for quick re-logging.
  - `app/(tabs)/tracker.tsx` (day view, target/remaining, macros, avoid-list check, meals) + `app/food/add.tsx` (search, recent, barcode entry, quick add with avoid tags) + `app/food/product.tsx` (rating, flagged ingredients, amount, Log it) + `app/food/scan.tsx` (expo-camera on phones; typed barcode on web).
  - Restaurant cards have "Log meal" (quick add prefilled with the name, pre-tagged with categories the place is rated Unlikely on). Home "Today" card shows eaten / target.
- **Build step 3 (Learn section + daily tips) is done** (2026-10-19, tested on web; notifications not yet tested on a phone):
  - `lib/learn/sources.ts` — every source verified against PubMed / publisher pages; `lib/learn/articles.ts` — 7 articles (seed oils, added sugar, HFCS, maltodextrin, AGEs, fried & fast food, ultra-processed), 31 claims, numbers checked against each study's abstract. All `reviewed: false` (shown as "not yet reviewed" in the app) until an RD/MD checks them.
  - Seed oils article presents both sides with "Debated" labels (Ramsden recovered-trial data vs AHA/Farvid). Fried food: 28% more major heart events but no clear link to overall death (Qin 2021) — keep claims this precise.
  - `lib/learn/tips.ts` — 27 tips, each tied to an article; chosen by avoid list + eating-out challenges, rotated daily and interleaved by topic. `lib/learn/links.ts` — badge/flag → article mapping.
  - `lib/learn/tipReminders.ts` + `components/TipReminderSync.tsx` — expo-notifications; schedules the next 14 days individually (so text varies) and refreshes on app open; tapping opens the article. Setting in Profile (Off / 7 AM … 8 PM). Phone only.
  - `app/(tabs)/learn.tsx` (tip, "On your avoid list", topics, evidence legend), `app/learn/[slug].tsx` (article). Tab renamed "Science" → "Learn". Home shows today's tip. Restaurant cards and product flags link to articles.
  - Not yet written: artificial sweeteners, alcohol, trans fats articles (avoid-list categories without an article).
- **Build step 4 (Best-order guides + Diet Builder) is done** (2026-10-19, tested on web):
  - `lib/guides/guides.ts` — 20 hand-curated guides (one per onboarding restaurant): cooking-oil fact with source + Official/Reported label, verdict (Seed-oil free kitchen / Some good options / Tough), best picks, skip, how to order, last-checked month. Several oil facts rest on press reports or old statements (e.g. Taco Bell 2007, Raising Cane's 2018) — re-verify before public launch. `guideKeyForName()` matches Google names to guides (short names like "CAVA" must match exactly).
  - `app/guide/[restaurant].tsx` — guide screen. Nearby cards show "What to order" when a result matches a guide.
  - `lib/diet/foods.ts` (35 tagged whole foods) + `lib/diet/builder.ts` (rules: eating-style exclusions, allergies, dislikes, liked ★, goal-based ordering, Mediterranean notes) → `app/(tabs)/diet.tsx`: targets + protein per meal, eat-more list by group, limit/avoid list with Learn links, go-to restaurant guides + "other restaurant guides".
- **Build step 5 (Accounts, sync, user reports) is built — waiting on the user's Supabase project** (2026-10-19; regression-tested with cloud not configured):
  - `supabase/schema.sql` — run once in Supabase SQL Editor: `user_data` (profile + foodlog JSON per user, owner-only RLS) and `restaurant_reports` (one vote per user/place/criterion; readable by anyone, writable by owner).
  - `.env.local` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` (publishable key; public by design). Never use the secret/service_role key in the app.
  - `lib/cloud/supabase.ts` (lazy client, skipped during web server rendering), `AuthContext.tsx` (email + password; Apple/Google sign-in deferred to polish), `CloudSync.tsx` (sign-in merge: same account/never synced → newest profile wins + food logs union; different account → that account's data replaces the device's; then debounced push), `reports.ts` (tallies; "Confirmed by users" = 2+ yes and more yes than no).
  - `lib/food/merge.ts` — food log merge with `deleted` ids so deletions sync. Profile has `updatedAt`; contexts expose `replace()`.
  - `app/account.tsx` — sign in / create account / signed-in status / sign out. Links from Profile, onboarding welcome ("Already have an account?") and done screen.
  - Restaurant cards: per-criterion Yes/No reports (sign-in required), "Users confirm: …" chip, "Users report it's not: …".
  - Supabase is connected (user's project; values in `.env.local`). Signed-out RLS verified: reports readable, private data hidden, writes refused.
- **Step 6 polish (2026-10-20):**
  - Learn now covers every avoid-list category: + artificial sweeteners & additives, alcohol, trans fats (10 articles, 42 claims, 43 verified sources).
  - Account deletion: `supabase/002_delete_account.sql` (security-definer `delete_my_account()`, also appended to schema.sql) + "Delete my account" on the Account screen. **User still needs to run 002 in Supabase.**
  - Phones store the login session encrypted (`lib/cloud/secureSessionStore.ts`, expo-secure-store + aes-js, per Supabase's Expo guide). Web uses browser storage. Not yet tested on a real phone.
  - Home redesigned as a dashboard: greeting + goal, today's calories + avoid check, quick actions, tip, go-to restaurant guides, backup nudge.
  - Removed the unused PlannedList placeholder. All 5 scripted web test suites pass.
- **More Nearby filters + logos (2026-10-20):** `lib/nearby/attributes.ts` adds 12 filter options in three groups (Diet: vegan, vegetarian, plant-based, gluten-free, dairy-free, keto/paleo; Cooking: olive oil, avocado oil, tallow/butter/ghee; Sourcing: grass-fed, organic, wild-caught) behind "More filters". Levels: yes (explicit — main Google category, "100% vegan", "cooked in olive oil") vs likely (mentions, secondary Google categories, Google's servesVegetarianFood flag which is on for most restaurants). Olive oil needs cooking context, except Mediterranean-style kitchens that mention it (labeled as such). These don't affect ranking; explicit matches sort first when filtering. Server caps targeted searches at 4 per request (newest filters first). `lib/nearby/logos.ts` — chain logo, else the site's favicon only if it exists (Google's service 404s otherwise), else a letter badge. Results stay on screen while filters update.
- **Menus + ordering in the app (2026-10-20):** website scan now keeps a menu link (page, PDF or externally hosted menu; social/review/delivery sites excluded) and only shows it if it loads. Cards get a "Menu" button (falls back to the online-ordering page). `lib/openInApp.ts` opens menus, ordering pages and websites in an in-app browser on phones (expo-web-browser: Safari View Controller / Chrome Custom Tabs, so saved cards and Apple/Google Pay work) and a new tab on web. Delivery apps still open their own app. After ordering, the card offers "Log this meal". True in-app checkout (our own cart + payment) is NOT built — it needs partnerships with ordering platforms (Toast, ChowNow, DoorDash, aggregator APIs) and a business entity.
- **Before any public launch:** expert (RD/MD) review of all articles; re-verify restaurant guide oil facts; Apple/Google sign-in; app name, icon and splash; host the API routes (e.g. EAS Hosting) with the Google key as a server secret; privacy policy (location goes to Google, health data, accounts); monetization decision; Google API quotas/caching for real traffic; developer accounts (Apple $99/yr, Google $25).
  - Web output is server-rendered: pages show text slightly before they're interactive (matters for automated tests — wait ~2 s after load before clicking).
- expo-router v57: import `Tabs` from `expo-router/js-tabs` and `Stack` from `expo-router/stack` (the root `Tabs` export is deprecated)

## Product Plan (agreed 2026-10-19 via grill-me session)

### Vision
- Longevity-focused app for people into health, fitness, and living longer.
- Starts **private** (personal testing/use). Decide later whether to launch publicly; goal is to grow into a business.
- Web and mobile both supported, optimized for mobile (on-the-go use).
- Everything in the plan is fully built before any public release.

### Core (the hook): restaurant finder + longevity education
- **Healthy Nearby** — built; see "Healthy" Definition below.
- **Learn section** (the `learn` tab) — food-focused first. Topics: the six avoid categories plus specifics (AGEs, fried/fast food, maltodextrin, high-fructose corn syrup, …).
  - Fixed article format: short version → how it affects the body → where it hides (foods, dishes, label names) → better swaps → sources.
  - Every claim links to a study and carries an evidence label: **Strong / Emerging / Debated**. Articles make the case against these ingredients, honestly labeled.
  - Restaurant badges link to the matching article (e.g. "Seed-oil free" → seed oils article).
  - Content drafted by the user with AI help; expert (RD/MD) review before any public launch.
- **Daily tips** — on Home, plus one optional daily notification at a user-chosen time. Each tip links to its Learn article.

### Avoid list (default categories)
Seed oils · added/refined sugar · ultra-processed foods · artificial sweeteners & additives · alcohol · trans fats. Specific ingredients (maltodextrin, HFCS, etc.) are covered within these.

### Supporting features
- **Onboarding**
  - Required quick start (~5 screens): goal (longevity / fat loss / muscle / energy / general health), eating style (none / keto / paleo / carnivore / Mediterranean / vegetarian-vegan), avoid list (six categories pre-checked), allergies & restrictions, location permission.
  - Optional "Personalize more" (now or later from Profile, with a gentle reminder): gender, height, weight, goal timeline, activity level, how many days/week they eat out, hardest part of eating out, how they decide what to eat, favorite restaurants (15–20 common chains, fast food included), food categories they eat, food categories they dislike.
  - Every answer must change something in the app (e.g. eating-out answers tailor tips and Home emphasis). Account creation offered at the end, skippable.
- **Calorie Tracker**
  - Daily calorie target calculated from body stats (Mifflin-St Jeor + activity + timeline), with a safety limit (~0.5–1% body weight/week) and user override.
  - Calories + macros, plus a daily **avoid-list check** ("2 meals with seed oils, 1 with added sugar").
  - Meals can be logged from restaurant cards.
- **Barcode scanner** — a Scan button in the Calories tab (plus a Home shortcut). Shows Good / Okay / Avoid, flagged ingredients linked to Learn articles, and "Log it". Data: Open Food Facts. Web: search products by name instead of scanning.
- **Best-order guides** — healthiest order at each favorite chain, hand-curated from official chain ingredient statements, each linked to its source, rechecked periodically.
- **Diet Builder** — rules-based (no AI generation): personalized food list ("eat more / avoid") plus calorie & macro targets, from goal, eating style, avoid list, likes/dislikes. Later idea: day plans mixing home meals and restaurant orders.
- **Accounts & user reports** — optional accounts via Supabase (email/Apple/Google): saves data, syncs phone ↔ web, enables restaurant reports ("they cook in olive oil ✅ / canola ❌"). 2+ matching reports → "Confirmed by users", kept visually separate from the official "Verified" badge.

### Build order
1. Onboarding + Profile
2. Calorie tracker + barcode scanner
3. Learn section + daily tips (first articles: seed oils, AGEs, fried/fast food, added sugar, maltodextrin, HFCS)
4. Best-order guides + Diet Builder
5. Accounts, sync, user reports (Supabase)
6. Polish → test on phone → decide on public launch

### Open decisions
- **Monetization** — undecided. Options discussed: freemium subscription, ads (risk: food/supplement ads can contradict the app's teaching), delivery-app referral fees. **The Verified badge must never be for sale.**

## "Healthy" Definition (Healthy Nearby)
A healthy restaurant is:
- Not fast food
- Seed-oil free (cooks with e.g. olive oil, avocado oil, butter, tallow)
- Clean, fresh, whole ingredients (made from scratch, minimally processed)
- Sugar free, and separately No added sugar (two distinct user options: "refined sugar free" counts as no added sugar, not sugar free)

Each criterion is a user-selectable filter option. Data comes from four layers:
1. Targeted Google searches per active filter (e.g. "seed oil free restaurant") — 1 billed search each, cached 30 min
2. Scanning each restaurant's website homepage + one menu page (free, cached 24 h)
3. Sourced "Verified" list (`lib/nearby/verifiedSources.ts`): chain announcements (Sweetgreen, True Food Kitchen) and individually documented Seed Oil Free Certified restaurants. Every entry needs a source URL. Importing the Seed Oil Free Alliance's full list requires their permission.
4. Keyword rules over reviews / Google summary / website text, with negation handling ("never canola" = supports seed-oil free). A single weak hint isn't enough for Likely/Unlikely.
Planned: user reports (see Accounts & user reports).

Search has two inputs: a natural food search ("What are you craving?", plus quick suggestion chips) and location (current location or typed city/zip). Food searches use Google Text Search without the restaurant-type restriction (so cafés/juice bars/food trucks match), combine with filter searches ("seed oil free" + food), and drop results >15 km away when using GPS.

Each card has action buttons: Order, Directions (Google Maps), Website, Call. Order opens options: the restaurant's own online-ordering link (found by the website scan — Toast, ChowNow, Square, DoorDash Storefront etc.; gift card/reservation/marketing links excluded), call to order, and search links into DoorDash / Uber Eats / Grubhub (hidden when Google says the place doesn't deliver). Phone, delivery and takeout come from Google (same pricing tier as reviews, no extra cost).

Prices on a 1–3 scale: $, $$, $$$ ($$$ = most expensive). Places with no price data show no indicator. Each criterion is shown with its confidence (Verified / Likely / Unlikely / Unknown) rather than claiming certainty.

## Screens
1. Home — daily tip, today's summary, scan shortcut, entry points
2. Calories — tracker + barcode scanner
3. Nearby — Healthy Nearby
4. Learn — education articles
5. Diet Builder
6. Profile / Settings — onboarding answers, body stats, preferences, permissions, account

Onboarding is a one-time flow and doesn't count toward the cap.

## Surface Area Constraint
- Max 5-7 screens total (same as nihongo-app). Every new screen proposal should be justified against this cap.

## Guardrails
- Show a "not medical advice" disclaimer; never present diet output as a medical prescription.
- Health data is sensitive: on-device by default; synced only for users who create an account.
- Ask for location permission when first needed (onboarding or Healthy Nearby), and handle denial gracefully.
- Calorie targets respect a safe pace limit; warn on unrealistic timelines.
