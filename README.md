# JP Studio — Unified Public Site + Admin Panel

One React app (JavaScript, Create React App — no TypeScript), one Firebase
project, two experiences:

- **Public site** (`/`, `/packages`, `/gallery`, `/book`, `/track`, `/contact`)
  — what your customers see.
- **Admin panel** (`/admin/...`) — gated behind a real Firebase Auth login,
  reachable from the hamburger menu's "Admin Login" link on the public site.

Everything is organized into **self-contained feature folders** under
`src/features/` — each folder holds its `.jsx`, its `.css`, and (where
relevant) its own Firestore service file, so you can open one folder and
have everything about that feature in front of you.

---

## 1. Install & connect Firebase

```bash
cd jpstudio-app
npm install
```

Paste your Firebase project config into `src/firebase/config.js` (this is
the one truly shared/global file — everything else lives inside a feature
folder). Then in the Firebase console:

1. **Firestore Database** → Create database → production mode
2. **Storage** → Get started (for gallery uploads)
3. **Authentication** → Sign-in method → enable Email/Password
4. **Authentication → Users** → add your admin user. You mentioned you've
   already created:
   - Email: `prakash@jpstudio.com`
   - Password: *(the one you set in the console — not stored anywhere in
     this code on purpose. See "About that login" below.)*
5. Deploy the rules already included at the project root:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
   (or paste `firestore.rules` / `storage.rules` into the console's Rules
   tabs directly)
6. `npm start`

### About that login
The admin login page (`/admin/login`) pre-fills the email field with
`prakash@jpstudio.com` as a convenience since you said that account already
exists in your Firebase Auth. The **password is intentionally not written
anywhere in the source code** — anyone who opens dev tools or views the
deployed JS bundle could otherwise read it. You'll type it once when you
log in; the browser will happily remember it after that if you want.

---

## 2. What's new since the last drop

### Cascading package selection
Every package now has a `category` field (Wedding / Pre Wedding / Baby
Shoot / Birthday / Maternity — see `PACKAGE_CATEGORIES` in
`features/packages/packageService.js`). On both the public **Book Now**
wizard and the admin's **New Booking** wizard, picking an Event Type
filters the package list down to just that category — the cascading
behavior you asked for. Change the category list in one place and both
forms pick it up.

### Package details flow, matching your mockup
- `/packages` — category tabs, grid of active packages
- `/packages/:id` — full detail page (hero image, description, "What's
  Included" checklist, Share button, Book This Package)
- Admin's package form now has **Description** + a chip-based "What's
  Included" editor (add "Drone Shoot", "8 Hours Coverage", etc. one at a
  time) — anything saved here shows up live on both the packages grid and
  the detail page, no redeploy needed.

### Calendar — booked dates are now a solid circle
Instead of small dots, a booked date shows a filled gold circle around the
day number itself (with a small red count badge if more than one booking
that day), so scanning the month for open dates is instant. Cancelled-only
days show a red outline instead of solid fill.

### Dynamic offers / announcements (`/admin/offers`)
A new admin page lets you create/edit/delete promotional messages (e.g.
"10% off all Wedding packages this month!") and flip them Active/Hidden.
Whichever offer is Active shows as a dismissible banner across the entire
public site (`features/offers/OfferBanner.jsx`, wired into
`PublicLayout`). Customers who dismiss it won't see that specific offer
again, but a new offer you publish will show up regardless.

### Tomorrow's-booking reminders (with an eye on your APK plan)
The admin Dashboard now:
- Shows an "Enable Notifications" prompt (browser Notification API)
- Once granted, fires a real OS-level notification once per day whenever
  there's a booking tomorrow — not just an in-app card
- Still shows the in-app "Reminder" card either way, so nothing is missed
  even if notifications are off

Read `features/adminShell/reminderNotifications.js` before you wrap this in
an APK — it has a comment block explaining exactly why a plain Notification
API call won't wake up a fully-closed app, and the two real paths forward
(Capacitor Local Notifications, or Firebase Cloud Messaging + a scheduled
Cloud Function). Nothing here blocks that future work; this is just
today's best version without a backend.

### Reports — month-over-month
`/admin/reports` now has a month switcher and shows the selected month's
orders + collection against the previous month automatically, plus the
existing "bookings by event type" breakdown scoped to that month.

### Booking source tag
Bookings created by the admin on a customer's behalf (e.g. over a phone
call) are tagged `source: "admin"` and show a small "Booked by Staff" pill
in the Bookings list, distinct from bookings customers placed themselves
through the website.

---

## 3. Folder structure — one feature, one folder

```
src/
  firebase/
    config.js                 <- the ONE truly global file, paste your config here
  styles/
    variables.css              <- design tokens (colors, fonts, radii)
    common.css                 <- shared button/card/badge/form classes
  shared/
    StatusBadge.jsx / .css     <- used by both admin + public tracking page
    StatCard.jsx / .css
    statuses.js                 <- the 7-stage booking pipeline + colors
  features/
    auth/            AdminLogin.jsx/.css, PrivateRoute.jsx, auth.js
    adminShell/       Sidebar.jsx/.css, Topbar.jsx/.css, Layout.jsx/.css,
                        notificationService.js, reminderNotifications.js
    dashboard/        Dashboard.jsx/.css
    bookings/         bookingService.js, Bookings.jsx/.css (admin list),
                        BookingDetails.jsx/.css, AddBooking.jsx/.css (admin),
                        BookNow.jsx/.css (public), TrackBooking.jsx/.css (public)
    customers/        customerService.js, CustomersList.jsx/.css, CustomerDetails.jsx/.css
    calendar/         CalendarView.jsx/.css
    packages/         packageService.js, AdminPackages.jsx/.css,
                        PublicPackages.jsx/.css, PackageDetail.jsx/.css
    offers/           offerService.js, AdminOffers.jsx/.css, OfferBanner.jsx/.css
    gallery/          galleryService.js, AdminGallery.jsx/.css, PublicGallery.jsx/.css
    photographers/    Photographers.jsx/.css
    reports/          Reports.jsx/.css
    settings/         settingsService.js, Settings.jsx/.css
    home/             Home.jsx/.css
    contact/          Contact.jsx/.css
    navbar/           Navbar.jsx/.css
    footer/           Footer.jsx/.css
    publicLayout/     PublicLayout.jsx/.css
  App.js               <- every route, public and admin, in one place
  index.js / index.css
```

Whenever you want to change something about ONE feature — say, add a
"featured" flag to packages — everything you need to touch (the form, the
public display, the service function) is inside `features/packages/`.
Cross-feature imports (e.g. the Dashboard needing `bookingService`) are
just a relative import to a sibling folder — nothing is duplicated.

---

## 4. Firestore data model

| Collection | Doc ID | Notes |
|---|---|---|
| `bookings` | the booking code itself (e.g. `JP1007`) | Lets the public Track Booking page fetch a single doc by ID without needing "list" permission. See the comment in `bookingService.js`. |
| `customers` | phone number | Auto-accumulates `totalBookings` / `totalSpent` across repeat visits. |
| `packages` | auto-id | Now includes `category`, `description`, `inclusions[]`. |
| `offers` | auto-id | `title`, `message`, `active`. |
| `galleryPhotos` | auto-id | `url`, `category`, `fileName`. |
| `notifications` | auto-id | Admin-only in-app bell. |
| `settings` | fixed doc `studio` | Contact info, social links, `googleMapsUrl`, `googleMapsEmbedUrl`, `heroImageUrl`. |
| `counters` | fixed doc `bookingCounter` | Hands out sequential booking numbers safely to both public and admin flows via a transaction. |

## 5. Security model, in one paragraph

Anyone can create a booking or read a single booking by its exact code
(that's how Track Booking works without login) and can read
packages/gallery/offers/settings (that's how the public site works without
login). Only a signed-in admin can list all bookings/customers, or write to
packages/gallery/offers/settings/notifications. Full rules are in
`firestore.rules` / `storage.rules` at the project root — read the
comments, they explain the why next to each rule.

## 6. Deploying

Since you're on Firebase Hosting already for the old user app, the
cleanest path is a second Hosting site in the same project (Hosting
supports multiple sites per project on the free Spark plan) — deploy this
unified app there, or replace the old user-facing deployment with this one
entirely, since it now covers everything the old app did plus the admin
panel.

## 7. What I'd flag for your next round of pings

- **True background push notifications** (admin's phone buzzes even with
  the app fully closed) needs either Capacitor's Local Notifications (once
  you wrap this as an APK) or Firebase Cloud Messaging + a scheduled Cloud
  Function — both require moving off the pure client-only setup this repo
  uses today. Happy to build either once you've decided how you're
  packaging the APK.
- **"My Bookings" for repeat customers** (mockup screen 6) — the current
  Track Booking page requires typing the code + mobile every time. A
  persistent "my bookings" list would need either lightweight device
  storage (easy, but device-specific) or real customer accounts (bigger
  lift). Ping me with a preference and I'll build it.
