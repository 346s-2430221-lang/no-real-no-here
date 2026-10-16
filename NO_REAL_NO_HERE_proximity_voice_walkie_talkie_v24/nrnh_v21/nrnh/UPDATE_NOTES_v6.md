# NO REAL NO HERE — Survival & Poolrooms update v6

## Added
- Poolrooms is now split into two sequentially playable floors: LEVEL 9 / FLOOR 1 and LEVEL 9 / FLOOR 2. Floor 1 exits into the second floor, which continues to LEVEL 10.
- Toxic bacteria water patches are highlighted with bright green emissive surfaces and bubbles. Standing in marked patches damages health and drains sanity; leave the water to stop the damage.
- Added persistent survival stats: health, stamina, and sanity.
- Sprinting consumes stamina; stamina recovers while not sprinting.
- Dark areas drain sanity slowly; sanity recovers in safer lit areas. Low sanity adds subtle camera instability.
- Survival status bars are shown on the HUD and values are saved in the active local save slot.

## Controls / notes
- Sprint: Shift on PC or the existing Run button on touch controls.
- Toxic water: visibly green patches in Poolrooms; avoid them.
- If health reaches zero, the player wakes up at the current level's start with reduced stats rather than losing the save.

## Verification
- `node --check` passed for edited JavaScript files.
- Confirmed level9 -> level9b -> level10 chain exists.
- A full browser/device playthrough has not been performed; please test movement and water hazards in-browser.
