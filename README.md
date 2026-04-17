# 🧘 PauseState

A calming breathing exercise and meditation tracking app. Choose from guided breathing patterns, track your daily meditation habits, and build a consistent practice — all in your browser, no account required.

**[Try it live →](https://pausestate.net)**

## Features

- **Guided Breathing Patterns** — Box Breathing (4-4-4-4), Relaxing 4-7-8, Deep Calm, Energizing, or fully customizable timings
- **Beautiful Visuals** — Animated breathing circle with particle effects and nature-themed backgrounds
- **Session Timer** — Set your desired meditation length (1-60 minutes) with countdown display
- **Meditation Tracking** — All sessions are saved locally and viewable in your progress dashboard
- **Daily Streaks** — Track consecutive days of practice with a streak counter
- **Daily Goals** — Set a daily minutes target and watch your progress
- **Session Summary** — After each session see your duration, pattern, streak, and goal progress
- **Privacy First** — All data stays in your browser. No accounts, no tracking, no servers.

## Breathing Patterns

| Pattern | Inhale | Hold | Exhale | Pause |
|---------|--------|------|--------|-------|
| Box Breathing | 4s | 4s | 4s | 4s |
| Relaxing 4-7-8 | 4s | 7s | 8s | - |
| Deep Calm | 6s | - | 6s | - |
| Energizing | 2s | 2s | 2s | - |
| Custom | You choose! | | | |

## Development

```bash
npm install
npm start       # dev server at http://localhost:3000
npm test        # run tests
npm run build   # production build
```

## Deployment

Deploys automatically to GitHub Pages on push to `main` via GitHub Actions.

1. Go to repository **Settings > Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` -- the workflow handles the rest

## Tech Stack

React 19 - TypeScript - CSS animations - localStorage - GitHub Pages

## License

[MIT](LICENSE)

