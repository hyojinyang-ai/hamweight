# Design Decisions Log

## 2026-03-27: Neo-Brutalism Style Overhaul

**Decision:** Replace the original soft/modern UI with hand-drawn neo-brutalism style.

**Reference:** [Freepik hand-drawn neo-brutalism template](https://www.freepik.com/premium-vector/hand-drawn-neo-brutalism-template_208482491.htm)

**What changed:**
- Thick black borders (`2.5px solid`) on all interactive elements
- Hard offset shadows (`4px 4px`, no blur, solid black)
- Flat colors only — no gradients
- Warm cream background instead of white
- Cards are white with thick borders + hard shadow
- Buttons have physical press effect (translate on active)
- Bold/black font weights throughout
- Increased border-radius to `1rem`

**Why:** User wanted a more distinctive, playful visual identity matching the neo-brutalism trend.

---

## 2026-03-27: Coral Primary Color Retained

**Decision:** Keep the warm coral/salmon as primary color (`hsl(6, 78%, 66%)`) through the neo-brutalism redesign.

**Why:** User explicitly asked to "keep the main color tone." The coral works well with neo-brutalism's flat-color approach and warm cream backgrounds.

---

## 2026-03-27: Mascot Character Removed

**Decision:** Removed all character images (originally hamster, briefly chihuahua SVG).

**History:**
1. Started with hamster PNG image
2. Replaced with inline SVG hamster in neo-brutalism style
3. Changed to chihuahua SVG
4. User requested complete removal from all pages

**Impact:** Simplified UI. The Hamster component file still exists but is not imported anywhere. Types (`HamsterExpression`, `HamsterSize`) remain in `types.ts` as dead code.

---

## 2026-03-27: Activity Heatmap with Calendar Detail

**Decision:** Added GitHub-style contribution heatmap on home screen showing weight logging history.

**Reference:** iOS activity tracking app with green contribution grid + calendar view

**Implementation:**
- Compact heatmap card on home (last 16 weeks)
- Tapping opens bottom sheet with:
  - Expanded heatmap with day/month labels
  - Streak badge
  - Monthly calendar with logged-day indicators
  - Tapping a calendar day shows weight entries for that date
- Colors use primary (coral) at varying opacities for intensity levels

---

## 2026-03-30: Internationalization (English/Korean)

**Decision:** Add client-side i18n with English and Korean.

**Approach:** Simple translation object in `lib/i18n.ts`, no external library.

**Why not next-intl or i18next:** App is client-only with localStorage state. A simple object lookup is sufficient for 2 languages. No server rendering concerns.

**Language stored in:** `UserProfile.language` in Zustand store.

**Onboarding:** Language selector added to setup step so new users can choose Korean from the start.

---

## 2026-03-30: Emojis Replaced with Lucide Icons

**Decision:** Replace all emoji usage with Lucide React icon components.

**Mapping:**
| Context | Before | After |
|---------|--------|-------|
| Morning | 🌅 | `Sunrise` |
| Lunch | 🌞 | `Sun` |
| Afternoon | 🌤️ | `CloudSun` |
| Evening | 🌙 | `Moon` |
| No exercise | 😴 | `BedDouble` |
| Before workout | 💪 | `Dumbbell` |
| After workout | 🏃 | `PersonStanding` |
| Streak fire | 🔥 | `Flame` |

**Why:** Icons render consistently across platforms, respect the neo-brutalism line-art aesthetic, and adapt to the theme (color/weight).

---

## 2026-03-27: No Backend

**Decision:** All data stays in localStorage. No server, no database, no auth.

**Why:** Weight tracking is inherently personal and private. localStorage is sufficient for a single-user PWA. Eliminates infrastructure complexity.

**Trade-off:** No cross-device sync, no backup (mitigated by CSV/JSON export in Settings).

---

## 2026-03-27: Zustand over Context API

**Decision:** Use Zustand for state management instead of React Context.

**Why:** Zustand's `persist` middleware gives free localStorage sync. Selectors prevent unnecessary re-renders. Less boilerplate than Context + useReducer.

---

## 2026-03-27: Internal Units Always Metric

**Decision:** Store all weights in kg, all heights in cm internally.

**Why:** Simplifies all calculations (BMI, goal progress). Imperial conversion happens only at display layer via `formatWeight()`, `kgToLb()`, `cmToFtIn()`.
