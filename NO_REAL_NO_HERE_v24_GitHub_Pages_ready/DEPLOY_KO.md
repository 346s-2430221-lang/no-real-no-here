# NO REAL NO HERE v24 — GitHub Pages용 파일

이 ZIP은 GitHub 저장소 루트에 바로 올릴 수 있도록 `index.html`, `src/`, `shared/`, `libs/` 등이 최상위에 배치되어 있습니다.

## GitHub Pages 배포
1. ZIP 압축을 풉니다.
2. 압축을 푼 폴더 안의 모든 파일과 폴더를 저장소 최상위에 업로드합니다. `index.html`이 저장소 첫 화면에 보여야 합니다.
3. `.github/workflows/pages.yml` 파일도 포함되어 있는지 확인합니다.
4. 저장소의 Settings → Pages → Build and deployment → Source에서 `GitHub Actions`를 선택합니다.
5. `main` 브랜치에 커밋하면 Actions가 배포합니다. Actions 탭에서 초록색 체크를 확인합니다.
6. Settings → Pages에 표시된 사이트 주소를 엽니다.

## 중요한 제한
- GitHub Pages는 정적 파일만 호스팅하므로 싱글플레이용입니다.
- 멀티플레이 및 음성 시그널링에는 `server/`를 별도 Node.js 호스팅(예: Render)에 배포하고 게임의 멀티플레이 메뉴에서 `wss://...` 주소를 설정해야 합니다.
- 배포된 페이지에서 싱글플레이가 열리는 것과 멀티플레이 서버가 동작하는 것은 별개입니다.
