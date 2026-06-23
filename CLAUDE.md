# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (auto-reloads)
npm run build      # production build → dist/
npm test           # Karma + Jasmine unit tests (runs in Chrome)

# GitHub Pages deploy build
npm run github-pages-build   # outputs to docs/ with base-href /chain-reaction

# Angular CLI scaffolding
npx ng generate component components/<name>
```

Run a single spec file by passing `--include` to karma or targeting `fit`/`fdescribe` inside the spec.

## Architecture

Single Angular 12 app (`src/app/`) with three routes.

**Routing** (`app-routing.module.ts`):
- `/home` → `HomeComponent` — game picker; "Play Online" is disabled (coming soon)
- `/chain-reaction` → `ChainReactionComponent` — the game itself
- `/game-rules` → `GameRulesComponent` — static rules page

**Service layer** (`src/app/services/`):
- `GameEngineService` (`game-engine.service.ts`, `providedIn: 'root'`) — owns all logical game state and game logic. Call `initGame()` in `ngOnInit` to reset between sessions.

**Game engine split**:
- `GameEngineService` owns: `cells`, `grid`, `players`, `playerInd`, `playerCnt`, `turnCnt`, `hasAllPlayersClicked`, `isGameOver`, `currentColor`. Key methods: `initGame`, `addBallToCell` (returns `BurstResult | null`), `burstCell`, `goToNextPlayer`, `isValidMove`.
- `ChainReactionComponent` owns: canvas rendering, `transitionBalls` animation, and user input routing.

The game renders entirely on an HTML `<canvas>` via `requestAnimationFrame`. Key component state:

| Field | Purpose |
|---|---|
| `transitionBalls: TransitionBall[]` | Balls currently flying between cells during a chain burst |
| `isTransitioning` | Blocks clicks while any ball is in flight |
| `hasWentToNextPlayer` | Tracks whether `goToNextPlayer` has been called for the current turn |

**Burst / chain-reaction mechanic**: when `addBallToCell` fills a cell to `maxBallCnt`, `burstCell` empties it and returns the valid neighbours as a `BurstResult`. The component creates `TransitionBall`s for each neighbour. `updateBalls` advances those balls each frame; when a ball arrives it calls `addBallToCell` again, which can chain. Game-over is detected in `updateBalls` when only one color remains in `cells` and `transitionBalls` is empty.

**Cell capacity rules** (from `functions.ts`):
- Corner cells: max 1 ball
- Edge cells: max 2 balls
- Interior cells: max 3 balls

**Utility layer** (`src/app/utility/`):
- `enums.ts` — `COLOR`, `GRID` (row/col counts, default cell width, padding), `SPEED` (vibration and transition speeds)
- `interfaces.ts` — `Grid`, `Cell`, `Ball`, `TransitionBall`, `Point`, `Direction`, `Player`, `BurstResult`, `PlayerMove`
- `functions.ts` — pure canvas/geometry helpers (`drawGrid`, `drawBall`, `createBall`, `createTransitionBall`, coordinate conversion, cell-type predicates)

**Responsive sizing**: `updateCellWidth()` shrinks cells to fit the viewport when `window.innerWidth < 511px` and is called on `resize`.

**Confirmation modal**: uses the native `<dialog>` element retrieved via `document.getElementById('confirmation-modal')` in `ngAfterViewInit`. It appears when the user tries to restart or navigate home mid-game.

**Global styles** (`src/styles.scss`): defines `.fancy-button-1`, `.text-vibrate` animation, and `.title` — shared across all components.

## Deployment

Hosted on Firebase (`firebase.json`, `.firebaserc`). The GitHub Pages build (`npm run github-pages-build`) writes to `docs/` for the `rafiul41/chain-reaction` repo pages site.
