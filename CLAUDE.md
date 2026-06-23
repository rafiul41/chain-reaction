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

Single Angular 12 app (`src/app/`) with three routes and no services — all game state lives in the component.

**Routing** (`app-routing.module.ts`):
- `/home` → `HomeComponent` — game picker; "Play Online" is disabled (coming soon)
- `/chain-reaction` → `ChainReactionComponent` — the game itself
- `/game-rules` → `GameRulesComponent` — static rules page

**Game engine** (`components/chain-reaction/chain-reaction.component.ts`):

The game renders entirely on an HTML `<canvas>` via `requestAnimationFrame`. Key state fields:

| Field | Purpose |
|---|---|
| `cells: Cell[][]` | 2-D grid of cells; each cell holds its color, balls, and `maxBallCnt` |
| `transitionBalls: TransitionBall[]` | Balls currently flying between cells during a chain burst |
| `isTransitioning` | Blocks clicks while any ball is in flight |
| `currentColor` | The player color that triggered the current burst cascade; used to repaint captured cells |
| `hasAllPlayersClicked` | Game-over can only fire after every player has had at least one turn |
| `playerInd / playerCnt / turnCnt` | Turn management; default 2 players |

**Burst / chain-reaction mechanic**: when `addBallOnCell` fills a cell to `maxBallCnt`, `burstCell` empties it and pushes one `TransitionBall` toward each valid neighbour. `updateBalls` advances those balls each frame; when a ball reaches its destination it calls `addBallOnCell` again, which can chain. Game-over is detected in `updateBalls` when only one color remains in `cells` and `transitionBalls` is empty.

**Cell capacity rules** (from `functions.ts`):
- Corner cells: max 1 ball
- Edge cells: max 2 balls
- Interior cells: max 3 balls

**Utility layer** (`src/app/utility/`):
- `enums.ts` — `COLOR`, `GRID` (row/col counts, default cell width, padding), `SPEED` (vibration and transition speeds)
- `interfaces.ts` — `Grid`, `Cell`, `Ball`, `TransitionBall`, `Point`, `Direction`
- `functions.ts` — pure canvas/geometry helpers (`drawGrid`, `drawBall`, `createBall`, `createTransitionBall`, coordinate conversion, cell-type predicates)

**Responsive sizing**: `updateCellWidth()` shrinks cells to fit the viewport when `window.innerWidth < 511px` and is called on `resize`.

**Confirmation modal**: uses the native `<dialog>` element retrieved via `document.getElementById('confirmation-modal')` in `ngAfterViewInit`. It appears when the user tries to restart or navigate home mid-game.

**Global styles** (`src/styles.scss`): defines `.fancy-button-1`, `.text-vibrate` animation, and `.title` — shared across all components.

## Deployment

Hosted on Firebase (`firebase.json`, `.firebaserc`). The GitHub Pages build (`npm run github-pages-build`) writes to `docs/` for the `rafiul41/chain-reaction` repo pages site.
