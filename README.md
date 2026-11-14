## Midhula Farm Hut

The Midhula Farm Hut website is a responsive showcase for ornamental fish, aquarium life, and the business's social and contact links.

## Requirements

- Node.js 20.9.0 or later
- npm

## Run Locally

1. Clone the repository from GitHub and open the project folder in a terminal.
2. Install the locked dependencies:

	```bash
	npm ci
	```

3. Start the development server:

	```bash
	npm run dev
	```

4. Open [http://localhost:3000](http://localhost:3000). If port 3000 is already in use, Next.js prints the alternate local URL in the terminal.

No `.env` file or API credentials are required for local development.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create the optimized production build. |
| `npm run start` | Serve the production build; run `npm run build` first. |

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Home page route. |
| `src/app/layout.tsx` | Root layout and page metadata. |
| `src/app/globals.css` | Brand styling, layout, responsive rules, and motion preferences. |
| `src/components/home-experience.tsx` | Homepage sections, navigation, media cards, and animations. |
| `public/` | Logo, images, favicon source, and local video assets. |

The homepage uses Next.js, React, Tailwind CSS, Framer Motion, GSAP ScrollTrigger, Lucide React, and React Icons. Local images and videos are served from `public/`; update references in the homepage component if an asset is renamed.

## Production

Build and start the production server with:

```bash
npm run build
npm run start
```

First, run the development server:

```bash
npm run dev
