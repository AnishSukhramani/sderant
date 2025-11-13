# Life as an SDE — Cyberpunk Tech Bulletin Board

> Step into a neon-lit intranet where developers broadcast from the thin line between utopia and dystopia.

Life as an SDE is a realtime, anonymous bulletin board built to feel like the command center of a cyberpunk megacity. Posts, profiles, archetypes, and data visualizations ripple across a terminal-inspired HUD that balances pristine utopian systems with the gritty noise of the street.

## Concept

- Craft the sensation of a corporate-grade intranet that has been reclaimed by underground engineers.
- Fuse utopian clarity (perfect grid systems, structured metrics, disciplined typography) with dystopian artifacts (glitch pulses, scanlines, fragmented vectors).
- Encourage builders to share lore, intelligence, and memes inside an environment that always feels alive, reactive, and a little unstable.

## Experience & UI

### Layout & Flow
- Responsive multi-column grid anchored by the live post feed, flanked by search, trending filters, and archetype intel.
- Panels animate with `framer-motion` to behave like holographic tiles that slide, fade, and fold as the network shifts.
- Supabase realtime channels stream posts, comments, reactions, and profile updates without leaving the session.

### Visual Language
- Palette defined in `src/app/globals.css`: asphalt black `#0A0A0A`, phosphor green `#00FF41`, and sunburnt accent `#FF6B35`.
- Glitch typography (`.glitch` keyframes), matrix grid overlays, and neon stroked borders recreate a volumetric terminal wall.
- Archetype badges (`src/components/ArchetypeBadge.tsx`) glow with faction colors, referencing utopian guilds and dystopian street crews.

### Motion & Ambient Systems
- Custom cursor (`src/components/CustomCursor.tsx`) trails glyph particles, rotates with scroll depth, and detonates micro-particles on click.
- Scanlines, floating pulses, and animated matrix backgrounds sustain the hum of a living control room.
- Magnetic buttons, smooth scroll, and progressive reveals keep interactions precise and deliberate—utopian choreography layered over dystopian grit.

### Narrative: Utopia ↔ Dystopia
- **Utopian systems**: transparent metrics (`street_creds`, comment velocity, view momentum), curated trending windows, structured data visualization (world map arcs in `src/components/ui/world-map.tsx`).
- **Dystopian overlays**: anonymous posts, glitching panels, archetype lore hidden in tooltips, and a constant suggestion that the protocol can mutate.

## Feature Overview

- 🚀 Anonymous posting with optional archetype-aligned handles.
- 💬 Real-time reactions and comment threads driven by Supabase subscriptions.
- 🖼️ Media uploads stored in Supabase Storage with inline previews.
- 📊 Trending algorithm combining street cred, comment velocity, and view counts.
- 🧭 Archetype system with lore-driven badges, selectors, and profile surfaces.
- 🌐 Ambient data viz such as animated dotted world maps to broadcast the network’s reach.

## Stack & Architecture

- **Framework**: Next.js 15 (App Router) + TypeScript.
- **Styling & Motion**: Tailwind CSS with custom cyberpunk tokens, `framer-motion`, and Lucide icons.
- **Backend-as-a-Service**: Supabase for auth, PostgreSQL, storage, and realtime pub/sub.
- **State Management**: React hooks and dedicated context providers in `src/contexts`.
- **Utilities**: Utility helpers in `src/lib`, typed Supabase client in `src/lib/supabase.ts`.

## Getting Started

### Prerequisites
- Node.js 20+ (matches the Next.js 15 runtime expectations).
- Supabase project for database, auth, and realtime features.

### Clone & Install

```bash
git clone https://github.com/<your-org>/sderant.git
cd sderant
npm install
```

### Configure Environment

Copy the template and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=optional_for_local_scripts
```

Only the public URL and anon key are required for local development. Keep service role keys out of the browser.

### Provision Database & Storage

1. In Supabase SQL Editor, run `supabase-schema.sql` to create tables (`posts`, `comments`, `street_creds`, `userinfo`, etc.).
2. Execute `setup-storage.sql` to provision the storage bucket used for image uploads.
3. (Optional) Apply the migration guides and security hardening scripts in the repository when you extend the universe.

### Run the Terminal

```bash
npm run dev
```

Visit `http://localhost:3000` to connect to the board. Create an account through the cybernetic auth portal or jump straight into anonymous posting.

### Useful Scripts

- `npm run lint` — enforce project conventions.
- `npm run build` — production build smoke test.
- `npm run test` — hook up your preferred testing stack (placeholder for now).

## Key Files & Modules

- `src/app/app/page.tsx` — primary hub layout, feed orchestration, search, and realtime hydration.
- `src/app/globals.css` — theme variables, glitch keyframes, scanline overlays, and custom cursor styling.
- `src/components/PostForm.tsx` / `PostCard.tsx` — creation + display surfaces with neon framing and reaction controls.
- `src/components/CustomCursor.tsx` — adaptive terminal cursor with particle trails.
- `src/components/ArchetypeSelector.tsx` — faction selector UI with lore-rich descriptions.
- `src/components/ui/world-map.tsx` — dotted world map visualization for ambient storytelling.
- `src/contexts/AuthContext.tsx` — Supabase auth state, session management, and logout portal.
- `src/lib/archetypes.ts` — archetype metadata, color systems, and iconography.

## Customizing the Neon Theme

- Update palette, scanline frequency, and glow intensity in `src/app/globals.css`.
- Modify archetype lore, colors, and copy in `src/lib/archetypes.ts` to invent new factions.
- Tweak motion curves or introduce new holographic panels in `src/components` (e.g., extend `MagneticButton` or craft additional ambient widgets).
- Layer new background stories—city maps, live metrics, audio-reactive visuals—using the existing animation scaffolding.

## Deployment

### Vercel (recommended)

1. Push the project to GitHub/GitLab.
2. Import the repo into Vercel and choose the Next.js preset.
3. Define `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and any server-side keys.
4. Deploy. Edge caching keeps the board responsive across the megacity.

### Other Platforms

The app ships as a standard Next.js 15 project—deploy to Netlify, Render, Fly.io, or Supabase Functions as long as Node.js 20+ is available and environment variables are configured.

## Contributing

Open issues, share ideas, or submit pull requests. Whether you polish the utopian surfaces or double down on dystopian glitch, every contribution expands the story.

## License

MIT License — fork it, remix it, and spin up your own neon-fed developer intranet.