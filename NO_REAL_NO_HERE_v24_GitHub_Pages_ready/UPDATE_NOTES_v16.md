# Update v16 — multiplayer/voice virtual simulation

This update focuses on validating feature 3 (multiplayer) in code and in an in-process simulation.

## Checks added
- `tests/multiplayer_sim.js`: loads the real `server/server.js` with only its WebSocket transport class replaced by a deterministic in-memory fake. Exercises two-client room creation/join, WebRTC offer/answer/ICE signaling relay, downed broadcast, server-authoritative revive and restored stats, invalid revive rejection, and chat relay.
- `tests/voice_client_sim.js`: evaluates the real `src/net.js` with mocked browser/WebRTC APIs. Exercises client offer creation, early ICE queue/flush, applying an answer, answering an incoming offer, and applying a later ICE candidate.
- `server/package.json` test script runs map/AI/ending validation plus both multiplayer simulations.

## Validation
- JavaScript syntax checks pass for `src/*.js`, `shared/*.js`, `server/*.js`, and `tests/*.js`.
- `tests/validate.js` passes: 35 level definitions and existing map/AI/ending assertions.
- `tests/multiplayer_sim.js` passes.
- `tests/voice_client_sim.js` passes.
- ZIP archive integrity check passes.

## Important limits
These are automated, in-process simulations. They do not prove that microphones, browser autoplay policies, public Internet NAT traversal, TURN relay, or two physical devices work. The default voice config uses public STUN servers only; deployment still needs a properly configured TURN server for difficult networks and HTTPS for microphone access outside localhost.
