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

Single Angular 22 app (`src/app/`) using **standalone components** and **zoneless change detection** (no NgModule, no zone.js).

**Bootstrap** (`src/main.ts`):
- `bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection(), provideRouter(routes)] })`

**Routing** (`src/app/app.routes.ts`):
- `/home` → `HomeComponent` — game picker
- `/local` → `LocalSettingsComponent` — configure players/board for a local game
- `/chain-reaction` → `ChainReactionComponent` — local pass-and-play game
- `/online` → `OnlineLobbyComponent` — create or join an online room
- `/online/game` → `OnlineChainReactionComponent` — online multiplayer game
- `/game-rules` → `GameRulesComponent` — static rules page

**Service layer** (`src/app/services/`):
- `GameEngineService` (`game-engine.service.ts`, `providedIn: 'root'`) — owns all game state and logic. Call `initGame()` in `ngOnInit` to reset between sessions.
- `OnlineGameService` (`online-game.service.ts`, `providedIn: 'root'`) — manages the Socket.IO connection and online room lifecycle.

**Signals architecture**:

All template-reactive state is exposed as Angular signals. Change detection fires automatically whenever a signal is written — no `ChangeDetectorRef` or `NgZone` anywhere in the codebase.

`GameEngineService` signals (template-facing):
| Signal | Type | Purpose |
|---|---|---|
| `players` | `Signal<Player[]>` | Active players in the current game |
| `playerInd` | `Signal<number>` | Index of the current player |
| `turnCnt` | `Signal<number>` | Total moves played |
| `isGameOver` | `Signal<boolean>` | Whether the game has ended |
| `currentColor` | `Signal<string>` | Color of the player making the current move |

Plain (non-signal) internal state: `cells`, `grid`, `playerCnt`, `hasAllPlayersClicked`, `colorsOnBoard` — used only by canvas rendering and game logic, never bound in templates.

`OnlineGameService` signals:
| Signal | Purpose |
|---|---|
| `mySocketId` | This client's socket ID |
| `myPlayerInd` | This player's index in the room |
| `currentRoom` | Current `RoomState` (null when not in a room) |

Event streams (RxJS `Subject`) for one-shot triggers: `roomCreated$`, `roomJoined$`, `roomUpdated$`, `roomStarted$`, `roomError$`, `moveBroadcast$`, `playerDisconnected$`.

**Game engine split**:
- `GameEngineService` owns: all logical game state and game logic. Key methods: `initGame`, `addBallToCell` (returns `BurstResult | null`), `burstCell`, `goToNextPlayer`, `isValidMove`.
- `ChainReactionComponent` / `OnlineChainReactionComponent` own: canvas rendering, `transitionBalls` animation, and user input routing.

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
- `interfaces.ts` — `Grid`, `Cell`, `Ball`, `TransitionBall`, `Point`, `Direction`, `Player`, `BurstResult`, `PlayerMove`, `RoomState`, `RoomPlayer`, `OnlineMoveBroadcast`
- `functions.ts` — pure canvas/geometry helpers (`drawGrid`, `drawBall`, `createBall`, `createTransitionBall`, coordinate conversion, cell-type predicates)

**Responsive sizing**: `updateCellWidth()` shrinks cells to fit the viewport when `window.innerWidth < 511px` and is called on `resize`.

**Confirmation modal**: uses the native `<dialog>` element retrieved via `document.getElementById(...)` in `ngAfterViewInit`. It appears when the user tries to restart or navigate home mid-game. Visibility is toggled via `[style.display]` binding driven by an `isModalShowing` signal.

**Global styles** (`src/styles.scss`): defines `.fancy-button-1`, `.text-vibrate` animation, and `.title` — shared across all components.

**Templates**: use Angular's built-in control flow (`@if`, `@for`) throughout. No `CommonModule`, `NgIf`, or `NgFor` imports needed.
