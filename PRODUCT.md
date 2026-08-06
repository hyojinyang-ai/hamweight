# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday people who want a simple, low-friction way to track weight trends. No fitness expertise assumed. Bilingual audience (English and Korean speakers). Mobile-first usage — quick daily check-ins, not long sessions.

## Product Purpose

MyWeight makes daily weight logging effortless and rewarding. Open, log, done. No accounts, no cloud sync, no friction. Streak gamification and visual progress keep users coming back without pressure. Success means a user who logs consistently because it feels easy and satisfying, not because they're anxious about their weight.

## Positioning

1. **Zero-friction simplicity** — no signup, no server, no sync. Data lives on-device in localStorage. Open the app and log in seconds.
2. **Fun over clinical** — streaks, celebrations, and a light tone turn a potentially stressful habit into something people actually enjoy.

## Operating Context

- Opened once daily (typically morning) on a phone browser
- Weight logged with optional context: time of day, exercise status, body measurements
- Goals set occasionally and tracked passively via progress ring
- History reviewed when curiosity strikes, not as a daily ritual
- Settings touched once during onboarding, rarely after

## Capabilities and Constraints

**Capabilities:**
- Weight logging with time-of-day and exercise context metadata
- Optional body measurements (waist, hips, chest, arms, thighs)
- Goal setting (lose, gain, maintain) with optional deadline
- Streak tracking with milestone celebrations
- Activity heatmap and weight trend chart
- Dark mode, metric/imperial units, daily notification reminders
- Full English/Korean localization
- PWA-capable, offline-first via localStorage

**Constraints:**
- No backend, no user accounts, no cloud sync
- Single-device data (localStorage only)
- No data export/import between devices (undecided — may change)
- Zustand store with `hamweight-storage` key

## Brand Commitments

- **Tone:** Minimal and fun. Encouraging, never clinical or intimidating. Copy should feel like a supportive friend, not a doctor.
- **Language:** Bilingual English/Korean with full parity.
- **Name:** MyWeight (마이웨이트).

## Evidence on Hand

- Hero image at `/public/images/myweight-hero.png`
- Goal illustration at `/public/images/goal-illustration.png`
- App icons at `/public/icons/`
- No real user testimonials, case studies, or external press
- No analytics or usage data

## Product Principles

1. **Seconds to log** — every interaction path from open to logged weight must be minimal-tap.
2. **Reward consistency, not results** — celebrate streaks and showing up, not specific weight numbers.
3. **Stay on-device** — privacy is a feature, not a limitation. No server dependency.
4. **Fun without noise** — gamification adds motivation; it never adds complexity or guilt.
5. **Bilingual by default** — Korean and English are equal citizens, not primary/fallback.

## Accessibility & Inclusion

No specific accessibility standard confirmed. Body-positive language is a product requirement — copy must never frame weight negatively or use shame-based motivation.
