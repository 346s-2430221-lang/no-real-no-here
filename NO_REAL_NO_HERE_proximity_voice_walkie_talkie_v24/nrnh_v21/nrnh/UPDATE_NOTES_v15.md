# v15 — map/objective QA, AI navigation, ending progression

## Fixed
- Poolrooms floor 2's second collectible was placed inside a wall; moved it onto a reachable floor tile.
- Map generation could place pillars/desks directly on notes and items. All level maps are now sanitized so interactables never overlap those props.
- Entity path planning now treats pillars/desks as obstacles and chooses the closest reachable waypoint when the exact target is blocked/unreachable, rather than blindly trying to walk through a wall.
- Replaced the always-available final ending menu with 8 ending choices that have explicit, testable requirements. Unmet requirements show a message and do not unlock the ending.

## Ending requirements
- True ending: reach level 30 and collect at least 8 notes.
- Alone ending: always available.
- Loop ending: collect at least 3 exploration coins in the current run.
- Sacrifice ending: arrive at the final door with health 25 or lower.
- Guardian ending: collect at least 15 exploration coins cumulatively.
- Hidden Truth ending: collect at least 4 key notes.
- Corrupted Reality ending: arrive at the final door with sanity 20 or lower.
- Fake Exit ending: always available at the final choice.

## Automated tests
- Added `tests/validate.js` and `npm test` script under `server/`.
- Checks all 35 level maps for rectangular grids, reachable exits, reachable notes/items, valid start cells, toxic water not placed inside walls, and Poolrooms progression.
- Checks that seven distinct AI behavior profiles and all eight ending gates remain in the code.
- Actual multiplayer/browser playtest is still required; this is not a claim of full release QA.
