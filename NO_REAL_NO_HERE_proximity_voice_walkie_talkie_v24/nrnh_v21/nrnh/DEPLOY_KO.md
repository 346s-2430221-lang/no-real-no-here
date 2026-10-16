# NO REAL NO HERE 배포 가이드

## 중요한 점
- GitHub Pages는 싱글플레이용 정적 게임 파일을 호스팅합니다. WebSocket 멀티플레이 서버는 별도로 배포해야 합니다.
- 이 작업은 배포 파일을 준비한 상태이며, 사용자의 GitHub 계정에 로그인하거나 원격 저장소를 만들고 실제로 공개 배포하지는 않았습니다.
- 게임은 프로젝트 루트의 상대 경로를 사용하므로 GitHub Pages 프로젝트 사이트에서도 정적 파일 경로를 유지합니다.

## A. GitHub Pages 배포
1. GitHub에서 새 저장소를 만듭니다(예: `no-real-no-here`). 공개/비공개 여부는 원하는 대로 선택합니다.
2. 이 프로젝트 ZIP을 풀고, 안쪽 `nrnh` 폴더의 **내용물 전체**를 저장소 루트에 올립니다. `index.html`, `src/`, `shared/`, `libs/`가 저장소 최상위에 있어야 합니다.
3. GitHub 저장소의 **Settings → Pages → Build and deployment → Source**에서 `GitHub Actions`를 선택합니다.
4. `main` 브랜치에 올리면 `.github/workflows/pages.yml`이 문법 검사를 실행한 뒤 정적 사이트를 배포합니다. Actions 탭에서 결과를 확인합니다.
5. 배포된 URL을 엽니다. GitHub Pages는 HTTPS이므로 마이크 사용 권한을 요청할 수 있습니다.

## B. WebSocket 서버(Render) 배포
1. 같은 저장소를 GitHub에 올립니다. `render.yaml`은 저장소 루트에 있어야 합니다.
2. Render에서 **New + → Blueprint**를 선택하고 해당 저장소를 연결합니다. `render.yaml`의 서비스 구성을 확인한 뒤 생성합니다.
3. 배포가 끝나면 Render가 제공하는 `https://서비스이름.onrender.com` 주소를 확인합니다. `/health`를 열었을 때 JSON에 `"ok":true`가 나와야 합니다.
4. 게임의 멀티플레이 메뉴에서 서버 주소를 `wss://서비스이름.onrender.com`으로 입력합니다. HTTPS 게임 페이지에서 `ws://` 주소를 사용하면 브라우저가 차단할 수 있습니다.
5. 서로 다른 네트워크의 두 기기에서 방 만들기/참가, 채팅, 음성 연결을 확인합니다. 무료 호스팅은 유휴 후 잠들거나 시작이 지연될 수 있습니다.

## C. 음성 채팅 주의
- 기본 ICE 설정은 공개 STUN만 포함합니다. STUN만으로 연결되지 않는 공유기/통신사 네트워크에서는 TURN 서버가 필요할 수 있습니다.
- TURN 자격 증명은 공개 저장소의 JS 파일에 고정값으로 넣지 마세요. 만료되는 임시 자격 증명을 서버에서 발급하도록 별도 구현해야 합니다.
- Render 서버가 WebSocket 시그널링을 제공하는 것만으로 음성이 모든 네트워크에서 보장되지는 않습니다. 실제 두 기기 테스트가 필요합니다.

## D. 로컬 사전 검사
프로젝트 루트에서:
```bash
node --check src/main.js
for f in src/*.js shared/levels.js server/server.js tests/*.js; do node --check "$f"; done
cd server && npm install && npm test && npm start
```
다른 터미널에서 `http://localhost:8080/health`를 열어 상태를 확인할 수 있습니다.

## 현재 한계
방/플레이어 상태는 서버 메모리에 보관되므로 서버 재시작 시 사라집니다. 공개 서비스 전에 rate limiting, 영구 저장, TURN 자격 증명 발급, abuse protection 및 실기기 검증을 추가하는 것이 좋습니다.
