# CLAUDE.md — Refracture Project Guidelines

## Workspace & Git Rules
- **`code_root`: `/workspace/project`** — All project files (`./runserver`, `package.json`, `vite.config.js`, `index.html`, `src/`, `scripts/`, `docs/`, `assets/`) reside directly in `/workspace/project` in the sandbox.
- **Do NOT run `git init` or `git clone` in this project.**
- Leave out and do not commit dependency, cache, and build folders (`node_modules/`, `.venv/`, `venv/`, `__pycache__/`, `.next/`, `dist/`, `build/`).

## Project Overview
**Refracture** is a Phaser 3 + Electron physics-platformer and experimental game about a jumping spider navigating a fractured cosmos (`A game about a spider. And neurodivergence.`). It uses a custom Entity Component System (ECS), a procedural N-gon Perlin fracture graph (`FractureGraph`), custom WebGL shader pipelines, and a dual-runtime architecture separating the **Lab Suite** from the **Main Game Runtime**.

## Local Evaluation (`./runserver`) & Scripts
- Run the project locally for browser evaluation using `./runserver`:
  ```bash
  ./runserver          # Launches the Main Game Runtime at http://localhost:3000 (or $PORT)
  ./runserver lab      # Launches the Lab / Sandbox Suite at http://localhost:3001 (or $PORT)
  ```
  *(If `node_modules/` is not yet installed, `./runserver` automatically runs `npm install` before starting Vite.)*
- Additional npm scripts (`package.json`):
  - `npm run dev` / `npm run dev:game` — Vite dev server for the Game Runtime (`REFRACTURE_RUNTIME=game`, port `3000`).
  - `npm run dev:lab` — Vite dev server for the Lab Runtime (`REFRACTURE_RUNTIME=lab`, port `3001`).
  - `npm run start:game` / `npm run start:lab` — Electron desktop wrapper with native macOS GameController bridge (`src/main.js`).
  - `npm run build [game|web|steam|windows|linux|mac|xbox|lab]` — Multi-target build orchestrator (`scripts/build.cjs`).

## Dual-Runtime & Modular Architecture
`vite.config.js` aliases `@runtime-entry` based on `REFRACTURE_RUNTIME`:
1. **Game Runtime (`src/entries/game.js`)** — Shipped game entry loading `GameMenuScene` and `RefractureGameScene` (strictly excludes Lab/test scenes).
2. **Lab Runtime (`src/entries/lab.js`)** — Categorized sandbox browser (`LabMenuScene` + `LabRegistry.js`) organized across the **6 Design Spaces** plus the legacy experimental scene archive:
   - **Space 1 (`world-graph`)**: Procedural N-gon boundary, Perlin-noise fracture graph (`Corners -> Edges -> Cells` pure topological hierarchy without redundant neighbor arrays), and scrambled cell shards (`01_WorldGraphLab.js`).
   - **Space 2 (`cell-physics`)**: Mutual cell mass/density gravity, local cell edge pull, and push/pull land manipulation.
   - **Space 3 (`yijing-energy`)**: 64 unnamed energy types (`0..63`), cell stored vs. background energy, **Maia** (universal state) & **Ziran** (local state).
   - **Space 4 (`player-spider`)**: Dot-to-spider camera zoom, vector unit-to-pixel scaling, 360° slingshot jump, and surface attachment.
   - **Space 5 (`items-ecology`)**: Unified item model (creatures, plants, objects differentiated by Ziran) with passive/active abilities targeting subsets of the 64 energy types.
   - **Space 6 (`visuals-maia-ziran`)**: Procedural visual themes, WebGL post-processing pipelines (`AquarellePipeline`, `GrayscalePipeline`, `OldGlassPipeline`, `RainbowPipeline`), and decoupled cell/graph styles.

## Directory Structure
- `src/app.js` — Phaser 3 bootstrap and gamepad bridge initialization.
- `src/main.js` & `src/preload.js` — Electron main process and preload script (compiles `src/native/mac_gamepad.m` on macOS if needed).
- `src/entries/` — Runtime entry points (`game.js`, `lab.js`).
- `src/world/` — `FractureGraph.js` (procedural N-gon + Perlin fracture generator) and `GraphQueries.js` (topological edge/cell/neighbor queries and polygon area calculation).
- `src/ecs/`
  - `components/` — Pure data component factories (`Position`, `Velocity`, `Collider`, `SlingshotJump`, `GraphCell`, `Renderable`, `ZLayer`, etc.).
  - `systems/` — ECS update and render systems (`MovementSystem`, `PhysicsSystem`, `AttachmentSystem`, `RaycastPlatformSystem`, `CameraSystem`, `RenderFactory`, etc.).
  - `entities/` — Entity constructors (`player.js`, `cell.js`, `platform.js`, `plant.js`, `art/`, etc.).
- `src/styles/` — Decoupled visual style definitions (`CellStyles.js`, `GraphStyles.js`).
- `src/graphics/` & `src/backgrounds/` — Procedural Phaser graphics objects and custom WebGL shader pipelines.
- `src/scenes/`
  - `game/` — `GameMenuScene.js`, `RefractureGameScene.js`.
  - `lab/` — `LabMenuScene.js`, `LabRegistry.js`, `01_WorldGraphLab.js`.
  - `test/` — `BaseTestScene.js` and 23 legacy experimental sandbox scenes (`00_ blank.js` through `23_RainbowArtistLab.js`).
- `docs/` — `GAME_DESIGN.md` and design specifications (`README.md`).
