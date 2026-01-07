# Shadow Tutor

English shadow speaking practice app with AI-powered text-to-speech.

## Features

- **Text Upload**: Upload `.txt` files or paste text directly
- **AI Text-to-Speech**: Native pronunciation powered by OpenAI TTS API
- **Learning Modes**:
  - **Continuous Mode**: Play through all sentences automatically
  - **Shadowing Mode**: Listen, pause for practice, then auto-advance
- **Customizable Settings**:
  - Playback speed (0.5x - 2.0x)
  - Pause duration for shadowing (1-10 seconds)
  - Voice selection (multiple native speaker voices)
- **Progress Tracking**: Resume where you left off with IndexedDB storage
- **Dark/Light Theme**: System-aware theme support

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **TTS**: OpenAI TTS API
- **Storage**: IndexedDB (via idb)
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shadow-tutor.git
cd shadow-tutor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Type check
npm run type-check

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variable:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy!

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── upload/            # Text upload page
│   ├── practice/          # Practice selection
│   └── settings/          # Settings page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── practice/          # Practice-related components
│   ├── settings/          # Settings components
│   └── upload/            # Upload components
├── lib/
│   ├── hooks/             # Custom React hooks
│   ├── api/               # API utilities
│   └── db/                # IndexedDB utilities
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## License

MIT

## Acknowledgments

- [OpenAI](https://openai.com) for the TTS API
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Vercel](https://vercel.com) for hosting
