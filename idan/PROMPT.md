# עידן – הפרומפט המלא (8 שלבים)

מקור: `guide.pdf` ("Build $5K Websites Using Claude Code", Daksham Bugreja), פרק V.
הפרומפט כתוב כתבנית. עידן ממלא את המשתנים לפי המוצר שבר מבקש:

| משתנה | משמעות | דוגמה מהמדריך |
|---|---|---|
| `{PRODUCT}` | שם המוצר המלא | Rolex Day-Date 40 in Everose gold |
| `{PRODUCT_SHORT}` | שם קצר לכותרות | Day-Date 40 |
| `{CATEGORY}` | סוג המוצר | luxury watch |
| `{FINISH}` | חומר/גימור שנשמר בכל הנכסים | Everose gold finish |
| `{PARTS}` | רשימת חלקים לפירוק | bezel, crystal, dial, movement plate, rotor, case, caseback, crown, bracelet links and clasp |
| `{ACCENT}` / `{ACCENT_HOVER}` | צבע מבטא + hover | #C8A96E / #E8C98E |
| `{BRAND_LINE}` | תווית קטנה בהירו | Est. 1905 · Geneva |
| `{HERO_CTA}` | כפתור בהירו | Explore Collection |
| `{FEATURES}` | 6 יתרונות | Perpetual Movement, Everose Gold, ... |
| `{SPECS}` | 8–10 שורות מפרט | Reference No., Case Diameter, ... |
| `{CLOSING_CTA}` | כפתור סיום | Find an Authorised Retailer |

---

```
Build a scroll-driven product landing page for a {CATEGORY} using a
Higgsfield AI-generated video.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — CREATE THE ASSETS IN HIGGSFIELD AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate these three assets in order:

ASSET 1 — Base product image
Prompt:
"A studio-grade product photograph of a {PRODUCT}, shown at a three-quarter
angle revealing its key details. Pure black background with zero ambient
light bleed, no reflections, no surface shadows. The product is fully
assembled, intact. Shot as if for a high-end print campaign — clinical
precision, no stylization."

ASSET 2 — Exploded reference image (use Asset 1 as reference)
Prompt:
"Using the provided reference image: deconstruct the product into a precise
exploded-view diagram. Each component — {PARTS} — should float apart from its
assembled position along its natural mechanical axis, with uniform spacing
between parts. The arrangement should feel deliberate and symmetrical, like a
technical illustration or a luxury brand's campaign visual. Pure black
background. All parts retain their {FINISH} and material texture. No labels,
no lines, no graphic overlays."

ASSET 3 — Hero video (use Assets 1 and 2 as references)
Prompt:
"A {PRODUCT} floats in a pure black void, fully assembled, with no
environment, no ground plane, no ambient reflections. The camera begins at a
front-right angle and slowly orbits clockwise in a smooth, uninterrupted arc.
As the camera arrives at the direct front-facing position — approximately
halfway through the shot — the product begins a seamless mechanical
deconstruction. Each component separates along its natural axis with
deliberate, weighted momentum. Parts float outward in perfect radial symmetry
as if gravity has been selectively reversed. The movement is slow, cinematic,
and precise — never chaotic. By the end of the shot, all parts are suspended
in a balanced exploded arrangement, still against the black void."

Save the video as hero.mp4. All assets must have a pure black background so
they blend seamlessly with the page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — EXTRACT VIDEO FRAMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run ffprobe on the video to get duration, frame rate, and total frames.
Then extract all frames as JPEG at 1920px wide:

  ffmpeg -i hero.mp4 -vf "fps=24,scale=1920:-1" -q:v 3 \
    "frames/frame_%04d.jpg"

Count the output frames and store the number as FRAME_COUNT.
Copy the entire frames/ directory to public/frames/.
Also copy hero.mp4 to public/hero.mp4.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — SCAFFOLD THE NEXT.JS PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Set up package.json with: next 15, react 19, react-dom 19, framer-motion,
typescript, @types/react, @types/node.

Add tsconfig.json (standard Next.js App Router config).
Add next.config.ts (empty default export).

Create app/globals.css:
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; color: #fff;
         -webkit-font-smoothing: antialiased; overflow-x: hidden; }

Create app/layout.tsx:
- Import Inter and Playfair_Display from next/font/google
- Expose them as CSS variables: --font-inter, --font-playfair
- Set <title> to the product name

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — DESIGN TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use these values everywhere. Never deviate:

  Background:     #000000
  Text primary:   #ffffff
  Text body:      #E5E5E5
  Accent:         {ACCENT}
  Accent hover:   {ACCENT_HOVER}
  Dim text:       #888888    ← never below this on black
  Border subtle:  accent at 20% opacity

  Display font:   var(--font-playfair) — Playfair Display, weight 400
  Body font:      var(--font-inter)    — Inter, weight 300-500
  Label style:    Inter, 0.65rem, letter-spacing 0.25em, uppercase,
                  color: accent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — BUILD app/components/ScrollHero.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'. No video element. Use canvas + preloaded JPEG frames.

Structure:
- Outer div: height 300vh, position relative, ref: containerRef
- Inner div: position sticky, top 0, width 100vw, height 100vh,
  overflow hidden, background #000
- <canvas> inside: display block, width/height 100%, ref: canvasRef
- Overlay div: position absolute, inset 0, flex column,
  justify-content flex-end

useEffect:
  1. Get canvas context. Apply devicePixelRatio scaling.
  2. Cover-fit draw function:
       scale = Math.max(cw/iw, ch/ih)
       center the image, fill black behind it
  3. Preload all FRAME_COUNT images from /frames/frame_XXXX.jpg
     (4-digit zero-padded). Draw frame 0 on first image load.
  4. Start a requestAnimationFrame loop — NO scroll event listener:
       top      = containerRef.getBoundingClientRect().top
       progress = Math.max(0, Math.min(1,
                    -top / (container.offsetHeight - window.innerHeight)))
       target   = Math.round(progress * (FRAME_COUNT - 1))
       if target !== currentIdx: draw(target)
  5. Resize handler: re-size canvas, redraw current frame.
  6. Cleanup: cancelAnimationFrame, remove resize listener.

Overlay content (all fade in with Framer Motion, staggered from
800ms delay, ease easeOut):
  - Small label:  "{BRAND_LINE}" in accent color
  - h1:           Product name, Playfair Display, clamp(2.4rem,6vw,5.5rem)
  - p:            One-sentence brand line, Inter 300, #E5E5E5, max 460px
  - <a> button:   "{HERO_CTA}", background accent, color #000,
                  Inter 500, 0.7rem, letter-spacing 0.18em, uppercase,
                  padding 0.9rem 2.6rem, pointer-events auto

Gradient behind overlay:
  linear-gradient(to top, rgba(0,0,0,0.88) 0%,
                          rgba(0,0,0,0.35) 50%,
                          transparent 100%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — BUILD THE REST OF THE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background stays #000000 throughout. No navbar, footer, or cookie
banner. All sections use Framer Motion useInView scroll-triggered
fade-ins (y: 24→0, opacity: 0→1, stagger 100ms, ease [0.25,0,0,1],
once: true).

── FEATURES — app/components/FeaturesSection.tsx
  - Section label: "Crafted Without Compromise" (accent, uppercase)
  - h2: Playfair Display, clamp(2rem,4vw,3.5rem)
  - 3-column responsive grid (auto-fill, minmax 300px)
  - 6 feature cards, each: SVG icon (stroke accent) + label + 1-sentence copy
  - Card top border: 1px solid accent at 20% opacity
  - Write real product copy. No lorem ipsum.
  - Features: {FEATURES}

── SPECS — app/components/SpecsSection.tsx
  - Section label: "Technical Specifications" (accent, uppercase)
  - h2: "The architecture of precision."
  - 2-column responsive table (label left in accent, value right in #E5E5E5)
  - 8–10 rows: {SPECS}
  - Each row: border-bottom 1px solid rgba(255,255,255,0.07)
  - Use accurate specs for the product in the video

── CLOSING CTA — app/components/ClosingCTA.tsx
  - Full-width, centered, black background
  - Accent label: "Yours to Command"
  - h2 Playfair Display, clamp(2.2rem,5vw,4.5rem):
      line 1 regular, line 2 italic #E5E5E5
  - Subtext: Inter 300, #E5E5E5, max 480px
  - CTA button: "{CLOSING_CTA}", same style as hero button
    but with border 1px solid accent and hover: bg #000, color accent
  - Radial glow behind button:
      radial-gradient(ellipse, accent at 10% 0%, transparent 70%)
  - Framer Motion whileHover on button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — WIRE EVERYTHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app/page.tsx:
  import ScrollHero, FeaturesSection, SpecsSection, ClosingCTA
  Render in order inside <main style={{ background: '#000' }}>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8 — RUN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm install && npm run dev

Then confirm:
- http://localhost:3000 loads
- /frames/frame_0001.jpg returns 200
- Scrolling through the hero scrubs from assembled product to full
  deconstruction, frame by frame
- Features, Specs, and CTA sections animate in on scroll

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES (non-negotiable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- No lorem ipsum — all copy fits the product's brand
- No navbar, footer, or cookie banner
- No video element — canvas + JPEG frames only for the scrub
- No scroll event listener — rAF loop with getBoundingClientRect only
- Mobile responsive: stack grid to single column below 768px
- No text below #888888 contrast on black
- Do not ask clarifying questions — start with Step 1 immediately
```
