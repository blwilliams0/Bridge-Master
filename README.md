# Bridge Master

A single-player contract bridge desktop app built with Electron, React, and TypeScript. Play South with three AI players, or learn through 11 interactive lessons.

## Run locally

Use Node.js 22.12 or newer with npm.

```sh
npm install
npm run dev
```

## Playing

- Choose **New Game** to deal. You sit South, partnered with North.
- Select a legal bid or Pass when prompted. Illegal calls are disabled.
- During play, select a highlighted card. You must follow suit when possible.
- If you declare, you also play North's dummy hand. If North declares, the AI plays your dummy hand.
- Each completed trick remains visible briefly before the winner leads again.
- **Menu** pauses the hand. **Resume Game** continues it, including after visiting lessons or settings.
- Completed and passed-out hands offer **Next Hand** or **Back to Home**.

The table shows the board, dealer, vulnerability, current turn, tricks, contract target, and cumulative partnership scores. Scoring uses duplicate-style per-board scoring; the two cumulative totals are equal and opposite. Dealer and vulnerability rotate with the board number.

Settings offer Beginner and Club Player play difficulty. The bidding AI uses Standard American heuristics; it is a practice opponent rather than an expert solver. Settings, lifetime stats, and lesson progress are saved locally. The current game can be resumed within the running app, but is not saved across app restarts. Starting a new game replaces the current game and resets its cumulative score.

## Verification

```sh
npm test
npm run lint
npm run build
```

Tests cover card dealing, bidding, scoring, randomized legal and AI hands, and the game lifecycle (pause/resume, stale timers, trick display, passed-out boards, and complete 52-card hands). The build also checks TypeScript for the main process and renderer.

## Packaging

```sh
npm run build:win
npm run build:mac
npm run build:linux
```

Use `npm run build:unpack` for an unpacked application. Packaging may download platform tooling; signing and distribution credentials are not configured in this repository.
