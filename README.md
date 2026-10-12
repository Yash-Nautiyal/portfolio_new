# Yash Nautiyal: portfolio ("Cold Start")

The site is an Android device. On desktop a phone docks beside the text and plays each section:
it boots, unlocks, shows the skills home screen, pulls down a notification shade for experience,
opens each project like an app, and slides up a compose sheet (joined by an iPad and an iPhone) at contact.
Background: live signal-strength contours radiating from whichever device is on screen.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Environment variables (set on Vercel):

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Real domain, used for metadata, OG image, sitemap and robots. Defaults to `https://example.com`. |
| `RESEND_API_KEY` | Sends contact-form email. Without it the form shows an error. |
| `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Optional sender/recipient overrides. |

## Editing content

All content lives in `src/data/`:

- `experience.ts`: jobs, newest first. Add an object to `EXPERIENCE`; the section, the phone's notification
  groups and the scroll length all adapt. `highlights` lists words to emphasise in the bullets.
- `projects.tsx`: projects. `summary` and `shots` feed the homepage and the phone; `content` is the case study;
  `tint` colours the dock icon, the page tint and the background contours.
- `skill-showcase.ts`: the skills index and the phone's home screen.
- `config.ts`: name, links, resume, About-page details.

## Where things are

| Path | What |
| --- | --- |
| `src/components/coldstart/stage.tsx` | All scroll choreography (GSAP + ScrollTrigger): hero film, apps, shade, contact devices |
| `src/components/coldstart/phone.tsx` | The Android phone and its layers, plus the iPhone and iPad |
| `src/components/coldstart/signal-field.tsx` | Background contours (canvas, marching squares) |
| `src/components/coldstart/smooth-scroll.tsx` | Lenis smooth scrolling, driven by GSAP's ticker |
| `src/components/coldstart/developer-mode.tsx` | Tap "Build number" 7 times on /about for layout bounds |
| `src/app/globals.css` | Tokens (Material 3 surface roles) and all component styles |

## Tuning

- Scroll feel: `lerp` and `wheelMultiplier` in `smooth-scroll.tsx`.
- Hero film length: `end: "+=160%"` in `stage.tsx`.
- Background: `LEVELS` (ring count/spacing) and alphas in `signal-field.tsx`.
- Page tint strength: `"9%"` in `stage.tsx`, `amount` in `page-tint.tsx`.

## Accessibility

- Every page passes axe (WCAG 2.1 AA and best practice) in light and dark mode, desktop and mobile.
- Keyboard: skip link, visible focus, all interactions reachable.
- The decorative phones are hidden from assistive tech; their content exists as text in the page.
- `prefers-reduced-motion`: no film, no smoothing, no contour animation. The phone sits docked and unlocked.

## Dev notes

- After editing `globals.css`, Turbopack's dev cache may serve stale CSS: stop the server, delete `.next`, restart.
- Phone screens load as 640px WebP via `/_next/image` (`src/lib/phone-shot.ts`); originals stay in `public/assets`.
