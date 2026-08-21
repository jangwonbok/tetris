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

---

## 12. 모바일 화면에 정확히 맞추기 (오버플로 제거)

### 프롬프트 (원본)

```
테트리스 게임화면이 모바일화면에 딱맞게 만들어줘
영역이 넘쳐나
```

### 결과 (요약)

- 이전에 적용한 `40vh` 폭 상한 방식은 대략적인 추정치라 기기별로 여전히 넘칠 수 있었음을 확인하고, `@media (pointer: coarse)` 블록을 flexbox 기반 "정확히 한 화면에 맞추기" 구조로 전면 교체
- `html, body`를 `height: 100dvh`로 고정하고 `.game-container`를 세로 flex 컬럼(`height:100%`)으로 구성: 제목(h1) → `.game-area`(`flex:1`) → 터치 버튼(`.touch-controls`, 이제 `position: static`으로 일반 흐름에 포함) 순서로 배치
- `.game-area` 내부는 다시 세로 flex(`flex-direction: column`)로 Score/Level 바(`.side-panel`, 가로 배치로 축소)와 보드(`.board-wrapper`, `flex:1`)를 쌓고, 보드는 남는 세로 공간을 모두 차지하도록 함
- `#board`를 `height:100%; width:auto; max-width:100%`로 바꿔, 폭이 아니라 **남은 높이를 기준으로** 가로:세로 1:2 비율에 맞게 크기가 계산되도록 함 — 세로로 긴 캔버스가 화면 높이를 넘기지 않도록 하는 핵심 수정
- 터치 버튼을 더 이상 `position: fixed`로 띄우지 않고 flex 컬럼의 마지막 항목으로 배치해, 별도의 `body` 하단 여백 계산(`padding-bottom`)이 필요 없어짐
- 만약을 위해 `overflow-y: auto`는 유지해 계산이 어긋나는 기기에서도 클리핑 대신 스크롤로 안전하게 대응

---

## 13. 게임 화면 잘림 수정 (JS 기반 정밀 크기 계산)

### 프롬프트 (원본)

```
게임화면이 잘려보여
테트리스 게임화면이 안잘리게 만들어주고
게임화면 + 조작키화면이 한 화면에 보이도록
```

### 결과 (요약)

- 원인 분석: `.board-wrapper`가 `width: auto`(내용에 맞춰 크기 결정)인 상태에서 캔버스에 `max-width: 100%`를 걸었는데, 기준이 되는 `.board-wrapper`의 폭 자체가 캔버스 크기에 의존하는 순환 참조 구조라 브라우저가 `max-width` 퍼센트값을 사실상 무시함 → 캔버스가 화면 폭을 넘어서도 그대로 렌더링되어 오른쪽이 잘려 보이는 문제였음
- CSS만으로는 이 순환 참조를 안전하게 풀기 어려워, `script.js`에 `fitBoardToViewport()` 함수를 추가해 `.board-wrapper`의 실제 렌더링된 폭/높이를 직접 측정(`clientWidth`/`clientHeight`) 후, `Math.min(가용폭, 가용높이/2)`로 1:2 비율을 유지하면서 두 방향 모두에 확실히 들어맞는 크기를 계산해 캔버스에 인라인 `style.width`/`style.height`로 적용
- `pointer: coarse`(터치 기기)에서만 적용되고, 데스크톱(`pointer: fine`)에서는 인라인 스타일을 비워 기존 CSS 기반 크기 조정을 그대로 사용
- `window`의 `resize`/`orientationchange` 이벤트에서 재계산하도록 연결, 페이지 로드 시 최초 1회도 실행
- `style.css`의 `.board-wrapper`/`#board` 관련 모바일 규칙을 단순화(폭 100%로 고정, 캔버스 크기는 JS가 전담)하고, 순환 참조를 유발하던 `aspect-ratio`/`max-width` 조합 제거
- jsdom 기반 스모크 테스트로 `matchMedia` 사용 코드가 예외 없이 로드됨을 확인

---

## 14. 터치 조작키를 키보드 방향키 배치로 변경

### 프롬프트 (원본)

```
키보드 방향키 위치랑 동일하게 조작키 만들어줘
```

### 결과 (요약)

- `index.html` — 기존 2행 나열(◀⟳▶ / ▽ DROP) 구조를 물리 키보드 방향키 배치(역T자)로 변경: 회전(⟳, ArrowUp 대응)을 상단 중앙, 좌(◀)/소프트드롭(▽, ArrowDown 대응)/우(▶)를 하단 한 줄에 배치하는 `.touch-dpad` 컨테이너 도입
- 하드 드롭(Space 대응) 버튼은 물리 키보드의 스페이스바처럼 방향키 클러스터 아래에 전체 폭으로 분리 배치, 라벨을 `DROP (Space)`로 명확화
- `style.css` — `.touch-row`(flex) 방식을 제거하고 `.touch-dpad`를 3열×2행 CSS Grid로 구성, `grid-column`/`grid-row`로 각 버튼을 정확한 위치(위/왼쪽/아래/오른쪽)에 배치
- 버튼 `id`는 그대로 유지(`btn-left`/`btn-right`/`btn-rotate`/`btn-down`/`btn-drop`)해 `script.js`는 수정 없이 그대로 동작

---

## 15. 방향키 배치/버튼 크기 재수정 및 Score/Level 왼쪽 배치

### 프롬프트 (원본)

```
방향키 위치랑 달라 다시확인해서 구현해줘
끄리고 버튼크기가 작아서 깨져보임
스코어랑 레벨은 왼쪽에 위치하도록 만들어줘
```

### 결과 (요약)

- 방향키 배치 재검토: 이전 `.touch-dpad`가 `1fr` 컬럼으로 `.touch-controls` 전체 폭(최대 300px)에 늘어나 있어 버튼 3개가 넓게 흩어진 한 줄처럼 보였던 것이 원인으로 판단 — 실제 키보드 화살표 클러스터처럼 촘촘하게 붙은 모양이 아니었음
- `.touch-dpad`를 `1fr` 대신 **고정 크기**(64px×64px, gap 6px) 그리드로 변경하고 `justify-content: center`로 가운데 정렬 → 물리 키보드 화살표 클러스터처럼 좁고 조밀한 3×2 블록으로 변경
- `.touch-btn`에 `min-height: 56px`, `font-size: 26px`로 크기를 확실히 키워 "버튼이 작아 깨져 보임" 문제 대응
- DROP 버튼(`.touch-btn.wide`)도 dpad와 폭이 맞도록 `width: 204px`(dpad 전체 폭과 동일)로 고정, 두 클러스터가 시각적으로 정렬되도록 함
- Score/Level을 화면 왼쪽으로 이동: `@media (pointer: coarse)`에서 `.game-area`를 세로(column)에서 **가로(row)** 배치로 바꾸고, `.side-panel`에 `order: -1`을 줘 DOM 순서(보드 다음 패널) 변경 없이 시각적으로 왼쪽에 오도록 처리. 폭은 78px 슬림 컬럼으로 축소
- `.board-wrapper`는 이제 가로 배치의 남은 공간을 차지(`flex:1`)하며, `script.js`의 `fitBoardToViewport()`가 실제 렌더링된 폭/높이를 그대로 측정하므로 별도 JS 수정 없이 새 레이아웃에 맞게 자동으로 재계산됨

---

## 16. 회전 버튼 아이콘을 화살표로 변경

### 프롬프트 (원본)

```
↑  버튼 화살표로 변경해줘
```

### 결과 (요약)

- `index.html`의 회전(`#btn-rotate`, dpad 상단) 버튼 라벨을 회전 아이콘 `⟳`에서 화살표 `↑`로 변경 — 나머지 방향 버튼(◀▽▶)과 함께 실제 키보드 화살표 키와 동일한 화살표 모양으로 통일
- 기능(회전, `tryRotate`)과 `aria-label="회전"`은 그대로 유지, 표시 문자만 교체

---

## 17. 데스크톱 UI 카드형 리디자인 + 전체 최고점수 추가

### 프롬프트 (원본)

```
(첨부 이미지: Score/Level/전체 최고점수/조작 방법이 각각 분리된 카드로 배치되고,
조작 방법 목록의 키 표기가 회색 배지로 강조된 UI 스크린샷)
조작키는 그대로두고 ui는 첨부된 이미지처럼 변경해줘
```

### 결과 (요약)

- 터치 조작키(`.touch-dpad`, `#touch-controls`)는 요청대로 변경하지 않음
- `index.html` — 사이드 패널에 **전체 최고점수** 카드(`#high-score`)를 Level과 조작 방법 사이에 추가, 조작 방법 목록의 키 표기(`← →`, `↓`, `↑`, `Space`)를 `<span class="key">`로 감싸 배지 스타일 적용
- `style.css` — `.panel-box` 패딩/모서리를 키워 이미지처럼 여유 있는 카드 느낌으로 조정, `.key` 배지 스타일(회색 배경, 둥근 모서리) 추가, `#high-score`를 `#score`/`#level`과 동일한 폰트 크기 규칙(기본/모바일/480px)에 포함
- `script.js` — 이 프로젝트엔 백엔드/DB가 없으므로 "전체 최고점수"는 **이 브라우저에 기록된 역대 최고점수**로 구현: `localStorage`(`tetris-high-score`)에 최고점수를 저장, 페이지 로드 시 불러와 표시(기록 없으면 `-`), 줄 제거로 점수가 오를 때마다 즉시 비교·갱신. `localStorage` 접근은 try/catch로 감싸 프라이빗 모드 등에서도 게임이 죽지 않도록 처리. 재시작(`startGame`) 시에도 최고점수는 리셋되지 않음
- 헤드리스 테스트로 (1) 최고점수 미기록 시 `-` 표시, (2) `localStorage`에 기존 값이 있으면 로드 시 정상 표시되는지 확인

---

## 18. 다음 블록 미리보기 추가

### 프롬프트 (원본)

```
그리고 다음나올 테트리스 블럭 미리보기도 만들어줘
```

### 결과 (요약)

- 원래 MVP 범위에서 제외했던 기능이지만 요청에 따라 구현
- `index.html` — 사이드 패널에 `Next` 카드와 `#next-board`(100x60) 미리보기 canvas 추가 (Level과 전체 최고점수 사이)
- `style.css` — `#next-board`를 `max-width:100%; height:auto`로 반응형 처리해 모바일 슬림 사이드바(78px)에서도 비율 유지한 채 축소 표시
- `script.js` — `nextType` 상태 추가(게임 시작 전 미리 1개 랜덤 생성), `spawnPiece()`가 `nextType`으로 현재 블록을 만들고 새 `nextType`을 뽑은 뒤 `renderNextPreview()` 호출하도록 변경(기존엔 매번 그 자리에서 랜덤 생성 → 다음 블록을 미리 알 수 없었음)
- `renderNextPreview()`는 다음 블록의 셰이프를 `NEXT_CELL(20px)` 기준으로 그리며, 도형 폭/높이를 계산해 캔버스 중앙에 배치
- 헤드리스 테스트로 `#next-board` 존재 확인 및 여러 번 하드 드롭 후에도 예외 없이 계속 렌더링되는지 확인
- README.md의 "고급 기능(제외 목록)"에서 "다음 블록 미리보기" 항목 제거

---

## 19. 터치 버튼 화살표 아이콘 통일

### 프롬프트 (원본)

```
그리고 화살표 아이콘도 ← → : 좌우 이동
↓ : 소프트 드롭
↑ : 회전 이 형태로 바꿔줘
```

### 결과 (요약)

- `index.html`의 터치 d-pad 아이콘을 삼각형 문자(◀ ▶ ▽)에서 조작 방법 목록과 동일한 화살표 문자(← → ↓)로 교체 (회전 `↑`은 이전 변경에서 이미 화살표였음)
- 기능/`id`는 변경 없음, `README.md` 조작 방법 표의 터치 버튼 열도 동일하게 갱신

---

## 20. 조작키가 안 보이는 문제 (pointer:coarse 매칭 실패 대응)

### 프롬프트 (원본)

```
조작키 영역이 테스트리 게임플레이 영역을 침범함
```
```
https://jangwonbok.github.io/tetris/ 확인해보면 조작키 자체가 안보임
```

### 결과 (요약)

- 배포된 `jangwonbok/tetris`의 `index.html`/`script.js`를 직접 curl로 받아 로컬 소스와 diff — 완전히 동일하고 `x-cache: MISS`로 캐시가 아닌 최신 응답임을 확인 (침범 문제는 강력 새로고침 안 한 상태에서의 구버전 잔상으로 추정, 조작키 자체가 안 보이는 문제는 실제 코드 상 원인이 있다고 판단)
- 원인 추정: 터치 조작키 표시가 전적으로 `@media (pointer: coarse)`에만 의존하고 있었는데, 일부 기기/브라우저 조합(트랙패드가 연결된 태블릿, pointer 감지가 기대와 다르게 동작하는 브라우저 등)에서는 실제 터치 기기인데도 `pointer: coarse`가 매칭되지 않아 터치 버튼이 계속 `display:none` 상태로 남아있을 수 있음
- `style.css`의 `@media (pointer: coarse)` → `@media (pointer: coarse), (max-width: 700px)`로 변경해, pointer 감지가 실패하더라도 화면 폭이 좁으면(스마트폰 화면 크기) 터치 레이아웃이 적용되도록 안전장치 추가
- `script.js`의 `window.matchMedia('(pointer: coarse)')`도 동일한 조건(`'(pointer: coarse), (max-width: 700px)'`)으로 맞춰, 보드 크기 계산(`fitBoardToViewport`)과 CSS 레이아웃 전환 기준이 어긋나지 않도록 함

---

## 21. 머티리얼 디자인 적용

### 프롬프트 (원본)

```
머티리얼 디자인 반영해줘
```

### 결과 (요약)

- 레이아웃/반응형 구조(폭, flex, grid, 모바일 브레이크포인트 등)는 전혀 건드리지 않고, 색상·타이포그래피·모양(shape)만 머티리얼 디자인 톤으로 교체
- `index.html` — Google Fonts에서 Roboto(400/500/700) 로드하는 `<link>` 추가
- `style.css` — `:root`에 머티리얼 다크 테마 팔레트를 CSS 변수로 정의: `--md-primary`(#6200ee), `--md-secondary`(#03dac6, 점수/레벨 강조색), `--md-background`(#121212)/`--md-surface`(#1e1e1e, 머티리얼 표준 다크 서피스), `--md-error`(#cf6679), elevation 그림자 3단계(`--md-elevation-1/2/4`)
- 카드(`.panel-box`)에 elevation 그림자와 더 둥근 모서리(12px) 적용, 라벨(`h2`)은 대문자+자간(오버라인 스타일)
- 보드(`#board`)는 두꺼운 테두리 대신 elevation 그림자로 "떠 있는 서피스" 느낌 적용
- 버튼: 방향 터치 버튼(`.touch-btn`)을 FAB 스타일 원형(`border-radius:50%`)으로, DROP 버튼과 재시작 버튼은 필(pill) 형태(`border-radius:24px`)의 Contained Button 스타일로, 눌렀을 때(`:active`) elevation이 낮아지는 눌림 효과 추가
- `.key` 배지를 머티리얼 칩(chip) 스타일(완전 둥근 pill, 반투명 배경)로 변경
- Game Over 텍스트는 머티리얼 error 색상 + 대문자로 변경
- `README.md`에 머티리얼 디자인 적용 사실 명시

---

## 22. 테트리스 랜딩 페이지 추가

### 프롬프트 (원본)

```
(첨부 이미지: 파란 배경에 떠다니는 큐브 모양과 T-테트로미노 모양 판에
 무지개색 "TETRIS" 로고가 있는 스크린샷)
첨부된 이미지 참고해서 테트리스 랜딩페이지 만들어줘
```

### 결과 (요약)

- 기존 게임 화면이었던 `index.html`을 `game.html`로 이름 변경(`git mv`로 히스토리 보존), `style.css`/`script.js` 참조는 상대 경로라 수정 없이 그대로 유지됨
- 새 `index.html`을 랜딩 페이지로 작성 — GitHub Pages 진입점이 되어, PLAY 버튼 클릭 시 `game.html`로 이동
- `landing.css` 신규 작성:
  - 파란색 그라디언트 배경 + 은은하게 떠다니는(`@keyframes drift`) 반투명 사각형들로 첨부 이미지의 큐브 느낌 재현 (`prefers-reduced-motion`이면 애니메이션 정지)
  - "TETRIS" 로고를 담는 판을 `clip-path`로 실제 **T-테트로미노 실루엣**(3칸 너비 상단 바 + 중앙 1칸 하단 stem)으로 잘라내어 이미지의 특징적인 판 모양을 그대로 구현
  - 각 글자를 개별 `<span>`으로 감싸 이미지처럼 글자마다 다른 색(빨강/주황/노랑/초록/파랑/분홍)을 지정
  - 흰색 필(pill) 모양 PLAY 버튼, 태그라인, 간단한 기능 소개 목록 추가
- `game.html`에 랜딩 페이지로 돌아가는 `← Home` 링크 추가, `style.css`에 `.back-link` 스타일(모바일 전용 축소 규칙 포함, 기존 "한 화면에 꽉 맞추기" 레이아웃 예산이 깨지지 않도록 처리)
- `README.md`의 파일 구성/실행 방법을 index.html(랜딩)·game.html(게임) 구조에 맞게 갱신, `DEPLOY.md`의 배포 확인 체크리스트에 랜딩 페이지 확인 항목 추가

---

## 23. 터치 조작키를 반투명 플로팅 버튼으로 변경

### 프롬프트 (원본)

```
(첨부 이미지: 모바일 퍼즐 게임 화면 위에 반투명한 회전/방향 버튼이
 게임판에 겹쳐 떠 있는 조작 UI 스크린샷)
조작키 첨부된 이미지와 동일하게 만들어줘
투명도있는 버튼에 플로팅 되어있는 형태로
```

### 결과 (요약)

- 방향키 배치(키보드 화살표와 동일한 위/좌/아래/우 십자 배열)는 이전에 확정한 대로 유지하고, 핵심 요청인 "투명도 있는 버튼 + 플로팅"에 집중해 스타일과 배치 방식을 변경
- `game.html` — `#touch-controls`를 기존에는 `.game-area` 옆의 별도 행(자체 공간 차지)이었던 것을 **`.board-wrapper` 내부로 이동**시켜, 게임오버 오버레이와 같은 방식으로 보드 위에 겹쳐지는 구조로 변경 (중복 id 제거)
- `style.css`:
  - `.touch-controls`를 화면 하단에 고정된 불투명 바(`position:fixed`, 배경색, 상단 테두리)에서, `board-wrapper` 기준 `position:absolute; bottom`으로 **보드 위에 뜨는 오버레이**로 변경 — 더 이상 별도 세로 공간을 차지하지 않아 보드가 쓸 수 있는 높이가 늘어남
  - `.touch-btn`을 반투명 유리 느낌으로 변경: `background: rgba(255,255,255,0.16)`, `backdrop-filter: blur(6px)`, 얇은 반투명 테두리 — 보드가 버튼 너머로 비쳐 보이는 "플로팅 글래스" 스타일
  - 버튼 사이 빈 공간은 `pointer-events:none`/버튼만 `pointer-events:auto`로 처리해 클릭이 버튼에만 반응하도록 함
- 헤드리스 테스트로 버튼 5개가 정확히 1개씩만 존재(중복 id 없음)하고 `board-wrapper` 내부에 위치하며, 클릭 시 예외 없이 동작함을 확인
