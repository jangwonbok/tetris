# WORKFLOW

이 문서는 `tetris` 프론트엔드 테트리스 프로젝트에서 진행한 프롬프트와 결과를 정리한 기록입니다.

---

## 1. AGENT.md 작성

### 프롬프트 (원본)

```
src/exercise/jangwonbok/day02/tetris 밑에 AGENT.md 파일을 만들어줘. 내용은 다음과 같아.
1) 입력하는 모든 프롬프트를와 결과를 WORKFLOW.md파일에 저장한다. 프롬프트 원본을 그대로 입력하고 결과는 요약하여 저장한다. 
2) git 원격에 변경된 내용이 있다면 rebase하지 않고 merge한다.
```

### 결과 (요약)

- `tetris/` 폴더 생성 후 `AGENT.md` 작성
- 규칙 2개 명시: (1) 모든 프롬프트/결과를 `WORKFLOW.md`에 기록(프롬프트 원본, 결과 요약), (2) 원격 변경 시 rebase 대신 merge 사용

---

## 2. 테트리스 MVP 웹앱 생성

### 프롬프트 (원본)

```
누구나 브라우저에서 바로 실행할 수 있는 간단한 프론트엔드 웹사이트 디자인을 가진 테트리스 애플리케이션을 만들어줘. 고급 기능은 필요없고, 점수 표시 블록 이동 기능 등 최소한의 기능만 갖춘 MVP 버전이면 충분해
```

### 결과 (요약)

- 리포지토리 컨벤션(`jangwonbok/day01/personal_landing` 등) 조사 후 빌드 도구 없는 `index.html` / `style.css` / `script.js` 구조로 결정
- `index.html` — canvas 기반 10x20 보드, 점수 표시, 조작 안내, 게임오버 오버레이·재시작 버튼 마크업 작성
- `style.css` — 다크 테마 레이아웃, 보드/사이드 패널 스타일, 게임오버 오버레이 스타일 작성
- `script.js` — 7종 테트로미노(I/O/T/S/Z/J/L) 정의, 좌우 이동·회전·소프트/하드 드롭, 충돌 판정, 줄 제거 및 점수 가산(100점 x 제거 줄 수), 게임오버 판정 및 재시작 로직 구현 (Vanilla JS, `requestAnimationFrame` 기반 게임 루프)
- `README.md` 작성 — 프로젝트 설명, 파일 구성, 주요 기능, 조작 방법, 실행 방법(`python3 -m http.server`) 정리
- 다음 블록 미리보기, 홀드, 고스트 피스, 레벨업, 사운드 등 고급 기능은 MVP 범위에서 제외

---

## 3. PLAN.md 저장 및 빌드 확인

### 프롬프트 (원본)

```
현재의 계획을 PLAN.md로 저장하고 빌드해줘
```

### 결과 (요약)

- 계획 문서를 `tetris/PLAN.md`로 저장 (모든 산출물 완료 상태로 갱신)
- 기존에 이미 생성된 `index.html`, `style.css`, `script.js`, `README.md`가 온전한지 확인 (빌드 도구가 없는 정적 사이트이므로 별도 컴파일 단계 없음)
- `script.js` 문법 재검증(`node --check`) 통과 확인

---

## 4. 레벨/속도 증가 시스템 추가

### 프롬프트 (원본)

```
시간이 흐르면서 점점 레벨이 오르고, 그에 따라 게임속도가 빨라지도록 해줘 게임도 게임화면에 보여줘. 30초가 지날때마다 레벨이 하나가 오르는걸로 해줘
```

### 결과 (요약)

- `index.html` — Score 옆에 Level 표시 패널(`#level`) 추가
- `style.css` — `#level`에 `#score`와 동일한 강조 스타일 적용
- `script.js` — `level`, `levelTimer` 상태 추가, `LEVEL_UP_INTERVAL`(30000ms)마다 레벨 +1 및 화면 갱신
- 드롭 간격을 고정값 대신 `currentDropInterval()` 함수로 계산 (`BASE_DROP_INTERVAL 800ms`에서 레벨당 `70ms`씩 감소, `MIN_DROP_INTERVAL 100ms`로 하한) → 레벨이 오를수록 블록 낙하 속도 증가
- 재시작 시 `level`/`levelTimer`도 초기값(1, 0)으로 리셋되도록 처리
- jsdom 기반 가속 시간 테스트로 30초/60초/90초 시점에 레벨이 정확히 2/3/4로 올라가는지 검증 완료

---

## 5. 모바일 반응형 대응 (터치 조작 제외)

### 프롬프트 (원본)

```
이 게임은 모바일 반응형 대응이 되어있나
터치를 제외하고 나머지만 적용해줘
```

### 결과 (요약)

- 기존에는 `viewport` 메타 태그만 있고 실제 반응형 CSS(미디어 쿼리, 유동 크기)는 없었음을 확인
- `style.css` 수정: `.game-area`에 `flex-wrap` 적용해 좁은 화면에서 보드와 사이드 패널이 자동으로 세로로 쌓이도록 변경
- `.board-wrapper`, `.side-panel`을 `width: min(300px, 92vw)`로 유동 폭 적용, `#board`는 `width:100%; height:auto; aspect-ratio:1/2`로 캔버스 내부 해상도(300x600)는 유지한 채 화면 크기에 맞춰 시각적으로 축소
- `body`에 여백(`padding:16px`) 추가로 좁은 화면에서 콘텐츠가 화면 끝에 붙지 않도록 처리
- `max-width: 480px` 미디어 쿼리 추가 — 제목·점수/레벨 폰트 크기, 패널 여백, 요소 간 간격을 소형 화면에 맞게 축소
- 요청에 따라 터치 조작(화면 내 방향 버튼, 스와이프/탭 이벤트 등)은 추가하지 않음 — 조작은 계속 키보드 전용

---

## 6. GitHub Pages 배포 가이드(DEPLOY.md) 작성

### 프롬프트 (원본)

```
이 tetris 게임을 githubs pages로 배포할 건데 github 꼐정은 가지고 있어. 아직 repo는 만들어지지않았는데 repo 생성부터 배포까지 어떻게 해야하는지 정리해서 DEPLOY.md 파일로 저장해줘. 참고로 git 인증은 ssh로 하고 있으니 git 작업은 ssh 인증기준으로 해줘
```

### 결과 (요약)

- `ssh -T git@github.com`으로 SSH 인증 상태 확인 (계정: `jangwonbok`)
- `tetris/DEPLOY.md` 작성 — 모노레포 하위 경로는 GitHub Pages가 직접 지원하지 않으므로, 게임 전용 새 저장소를 만들어 배포하는 방식으로 정리
- 내용: (0) SSH 인증 확인 → (1) github.com/new에서 빈 저장소 생성(README/gitignore/license 미체크) → (2) 배포 전용 로컬 폴더에 `index.html`/`style.css`/`script.js`/`README.md`만 복사 + `.nojekyll` 추가 → (3) `git init -b main` → SSH 원격(`git@github.com:jangwonbok/tetris.git`) 추가 → 첫 push → (4) Settings > Pages에서 "Deploy from a branch", main/root로 활성화 → (5) `https://jangwonbok.github.io/tetris/` 접속 확인 → (6) 이후 업데이트 시 파일 재복사 후 커밋, push 전 `git fetch` + `git merge`로 원격 반영(rebase 금지, AGENT.md 규칙과 동일)
- 커스텀 도메인 및 사용자 페이지(`jangwonbok.github.io`) vs 프로젝트 페이지 차이도 참고로 정리
- 실제 저장소 생성/push/Pages 활성화는 외부에 영향을 주는 작업이라 이번 턴에서는 실행하지 않고 가이드 문서만 작성함

---

## 7. DEPLOY.md를 모노레포 기준(git subtree)으로 재정리

### 프롬프트 (원본)

```
공용 repo 사용방법을 제거하자. 내 github 계정은 jangwonbok이고 생성할 repo 이름은 tetris로 해서 DEPOLY.md로 모노 repo 기준으로 정리해줘
```

### 결과 (요약)

- `DEPLOY.md` 참고 섹션에서 "저장소 이름을 `jangwonbok.github.io`로 만드는 사용자 페이지(계정당 1개, 다른 프로젝트와 공유)" 방식 안내를 제거
- 별도 로컬 복사 폴더(`~/deploy/tetris`)를 만드는 방식 대신, **모노레포 안에서 `git subtree push --prefix=src/exercise/jangwonbok/day02/tetris tetris main`**으로 해당 폴더만 새 GitHub 저장소(`tetris`, 계정 `jangwonbok`) 루트로 바로 push하는 방식으로 전면 재작성
- 절차: (0) SSH 인증 확인 → (1) GitHub 빈 저장소 생성 → (2) 모노레포에 `tetris` 원격 추가 → (3) `git subtree push`로 최초 배포 → (4) Settings > Pages에서 main/root 활성화 → (5) 접속 확인 → (6) 이후 파일 수정 후 커밋 + 동일한 `git subtree push` 재실행 (원격에 반영 안 된 변경이 있으면 `git subtree pull`로 먼저 merge — rebase 금지, AGENT.md 규칙과 동일)
- subtree push 시 폴더 내 모든 파일(`AGENT.md`/`WORKFLOW.md`/`PLAN.md`/`DEPLOY.md` 포함)이 그대로 새 저장소에 올라감을 안내
- GitHub Pages가 Jekyll 빌드를 건너뛰도록 `tetris/.nojekyll` 빈 파일 추가 (subtree push에 함께 포함되도록)

---

## 8. GitHub Pages 실제 배포 진행

### 프롬프트 (원본)

```
DEPLOY.md  파일 참고해서 배포해줘
```

(이어서 저장소 생성 여부 확인 질문에 사용자가 "아직 안 만들었음"으로 응답 → 사용자가 직접 https://github.com/jangwonbok/tetris.git 저장소를 생성 후 URL 공유)

### 결과 (요약)

- `gh` CLI 미설치·API 토큰 없음을 확인 → 저장소 생성/Pages 설정 화면(웹 UI 로그인 필요)은 사용자가 직접 진행하도록 안내
- 모노레포에 `src/exercise/jangwonbok/day02/tetris/`가 아직 커밋되지 않은 상태(untracked)였음을 확인, 해당 폴더만 로컬 커밋(원격 `origin`에는 push 안 함)
- `git remote add tetris git@github.com:jangwonbok/tetris.git` 추가
- `git subtree push --prefix=src/exercise/jangwonbok/day02/tetris tetris main` 실행 → `jangwonbok/tetris` 저장소의 `main` 브랜치로 정상 push 완료 (`git ls-remote`로 확인)
- 남은 GitHub Pages 활성화(Settings → Pages → Deploy from a branch, main/root)는 웹 UI 작업이라 사용자가 직접 진행하도록 단계 안내

---

## 9. 모바일 터치 조작 추가

### 프롬프트 (원본)

```
모바일에서 사용가능하도록 할수있어?
```

(위 질문에 터치 버튼 추가 방식을 제안하고 진행 여부를 물었고, 사용자가 이어서 "만들어줘"로 승인)

### 결과 (요약)

- `index.html` — 보드 하단에 `#touch-controls` 영역 추가: ◀/⟳/▶, ▽/DROP 버튼 (좌우 이동, 회전, 소프트 드롭, 하드 드롭)
- `style.css` — `.touch-controls`/`.touch-btn` 스타일 추가, 기본은 숨김 처리하고 `@media (pointer: coarse)`(터치 기기)에서만 표시되도록 구성
- `script.js` — 각 버튼에 클릭 이벤트 연결, 기존 `tryMove`/`tryRotate`/`softDrop`/`hardDrop` 함수를 재사용하는 `handleTouchAction` 헬퍼로 게임오버 가드 및 렌더링 처리 (키보드 핸들러와 동일한 패턴)
- jsdom 기반 헤드리스 테스트로 5개 버튼 모두 존재 확인 및 클릭 시 예외 없이 동작함을 검증
- `README.md`에 터치 버튼 안내 추가, 조작 방법 표에 키보드/터치 버튼 매핑 정리

---

## 10. 터치 버튼 반응성 개선 및 하단 고정

### 프롬프트 (원본)

```
방향키가 동작을 안하고 방향키를 하단에 고정시켜줘
```

### 결과 (요약)

- `script.js` — 버튼 클릭만으로는 실제 터치 기기에서 손가락이 살짝 움직이면 `click`이 취소되어 반응이 늦거나 안 되는 문제가 있을 수 있어, `touchstart`(즉시 반응 + `preventDefault`로 뒤이은 중복 `click` 억제)와 `click`(마우스 환경 대응)을 함께 바인딩하는 `bindPressButton` 헬퍼로 교체
- `style.css` — `.touch-controls`를 `position: fixed; bottom: 0`으로 화면 하단에 고정, 반투명 배경·구분선 추가, iOS 홈 인디케이터 영역은 `env(safe-area-inset-bottom)`으로 여백 확보
- 터치 기기(`pointer: coarse`)에서는 고정 버튼이 콘텐츠를 가리지 않도록 `body`에 하단 여백(`padding-bottom: 180px`) 추가
- 헤드리스 테스트로 click 경로(데스크톱 마우스 시뮬레이션)가 여전히 정상 동작함을 재확인

---

## 11. 모바일 사이즈 최적화 및 확대(zoom) 방지

### 프롬프트 (원본)

```
모바일 사이즈에 맞게 만들어줘 
zomm 기능도 막아줘 터치하면 화면이 확대됨
```

### 결과 (요약)

- `index.html` — `viewport` 메타 태그에 `maximum-scale=1.0, user-scalable=no` 추가해 핀치/더블탭 확대를 전역적으로 차단
- `style.css` — `html`에 `touch-action: manipulation` 추가(더블탭 확대 억제 보강)
- `.board-wrapper` 폭 계산에 `40vh` 상한을 추가(`min(300px, 92vw, 40vh)`)해, 세로로 긴 캔버스(가로:세로 1:2)가 화면 높이 대비 과도하게 커져 스크롤이 심해지는 문제를 완화
- 터치 기기(`pointer: coarse`)에서는 키보드 전용 안내(`조작 방법` 박스, `.keyboard-help`)를 숨기고 `.game-area` 간격과 `h1` 여백을 줄여 세로 공간을 절약
- `index.html`의 "조작 방법" 패널 박스에 `keyboard-help` 클래스 추가 (숨김 대상 지정용)
