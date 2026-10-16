# NO REAL NO HERE — Large Level Expansion v5

## Main-story expansion
- Added LEVEL 7–30 (24 additional main-story levels), each using a large 76 × 54 grid (228 × 162 world units at current scale).
- Every new level has its own name, narrative intro, objective, theme, six readable notes, four collectible objectives, an exit lock, and a next-level link.
- Maps contain a central spine, alternating large rooms, side alcoves, and cross-routes/loops to encourage exploration instead of a single straight hallway.
- Added theme-based environment props for hospital/school/shelter beds, server/factory/archive/library racks, city/suburb/mall/train seating, forest trees, and generic industrial cabinets.
- Added themed wet floor patches for water/red levels after the floor-cell list is created, fixing a temporal-dead-zone issue that could stop those levels from loading.
- Connected LEVEL 6 to LEVEL 7 and the chain proceeds through LEVEL 30, which triggers the existing ending choice flow.
- Updated the save-slot main-level list to include LEVEL 7–30.

## Validation
- `node --check` passed for `shared/levels.js`, `src/levelManager.js`, and `src/saveManager.js`.
- Automated grid reachability check passed for all 24 new maps: every collectible and note is reachable from the start while treating marked props as solid.
- This is code/map validation, not a full browser playthrough. Performance, exact 20–30 minute completion time, and all device compatibility still require playtesting.
