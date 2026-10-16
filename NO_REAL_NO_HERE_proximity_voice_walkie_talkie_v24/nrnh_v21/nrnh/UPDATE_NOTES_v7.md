# NO REAL NO HERE — Poolrooms & Survival update v7

## Poolrooms
- Poolrooms remains two sequentially playable floors: LEVEL 9 / FLOOR 1 -> LEVEL 9 / FLOOR 2 -> LEVEL 10.
- Repositioned the bright-green bacteria-contaminated water so the visible toxic pools sit on traversable floor areas rather than overlapping mostly solid walls.
- Entering these green pools damages health and drains sanity over time. Leave the green water to stop the damage.

## Survival systems
- HUD displays health, stamina, and sanity.
- Sprinting consumes stamina; resting restores it.
- Dark areas gradually drain sanity; safer lit areas restore sanity.
- Very low sanity can cause subtle camera instability.
- Health, stamina, and sanity are persisted to the active local save slot. Reaching zero health returns the player to the current level start with reduced survival values, preserving progress.

## Verification
- JavaScript syntax checks passed for all project JS files.
- Verified both Poolrooms floors contain two toxic zones each and that all cells under those zones are traversable floor cells (not wall cells).
- Confirmed level9 -> level9b -> level10 progression.
- Full browser/device playthrough was not performed.

## v8 — 상태 이상 연출
- 체력이 10 이하로 내려가면 `치명적 부상!` 경고를 표시합니다. 체력이 다시 10 초과로 회복된 뒤 재진입하면 다시 경고할 수 있습니다.
- 스태미나가 30 이하일 때 플레이어 전용 헐떡임/거친 숨소리를 재생합니다. 30 초과로 회복되면 멈춥니다.
- 정신력이 20 이하(0 초과)일 때 카메라에만 붙는 스마일러 환영이 나타나며, 정신력이 낮을수록 더 크고 자주 보입니다. 이 오브젝트는 카메라 자식이라 다른 플레이어에게 복제되지 않습니다.
- 정신력이 0이 되면 스마일러에게 당하는 토스트/효과음을 재생하고 시작 지점에서 깨어납니다. 체력 65, 스태미나 45, 정신력 35로 재설정합니다.
- JS 구문 검사는 통과했지만, 실제 브라우저에서 사운드/게임플레이를 직접 플레이 테스트한 것은 아닙니다.
