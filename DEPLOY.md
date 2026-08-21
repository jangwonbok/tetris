# DEPLOY (GitHub Pages 배포 가이드)

이 문서는 `tetris` 게임을 GitHub Pages로 배포하기 위한 절차를 저장소 생성부터 정리한 것입니다.
Git 인증은 SSH 기준으로 작성했습니다 (`git@github.com:...` 원격 사용).

## 개요

- 이 게임은 모노레포(`kosa-vibecoding-2026-5th`) 안 `src/exercise/jangwonbok/day02/tetris/`에 있다. GitHub Pages는 저장소 **루트** 또는 `/docs` 폴더만 지원하므로 이 경로를 그대로는 배포할 수 없다.
- 별도의 복사 폴더를 새로 만들지 않고, **모노레포 안에서 `git subtree`로 해당 폴더만 새 GitHub 저장소의 루트로 push**하는 방식을 사용한다. 빌드 과정은 없다(정적 파일 그대로 서빙).
- GitHub 계정: `jangwonbok`
- 생성할 저장소 이름: `tetris`
- 배포 후 주소: `https://jangwonbok.github.io/tetris/`

## 0. 사전 준비 확인

SSH 키가 이미 GitHub 계정에 등록되어 있는지 확인한다.

```bash
ssh -T git@github.com
```

`Hi jangwonbok! You've successfully authenticated...` 메시지가 나오면 준비 완료.

## 1. GitHub에 새 저장소 생성

1. https://github.com/new 접속
2. Repository name: `tetris`
3. Public 선택 (GitHub Pages를 무료로 쓰려면 Public 권장)
4. "Add a README file", ".gitignore", "license"는 모두 **체크 해제** — 빈 저장소로 생성해서 subtree push와 충돌이 없게 한다.
5. **Create repository** 클릭

## 2. 모노레포에 새 원격(remote) 추가

모노레포 루트(`kosa-vibecoding-2026-5th`)에서 실행한다.

```bash
git remote add tetris git@github.com:jangwonbok/tetris.git
```

## 3. git subtree로 tetris 폴더만 push

```bash
git subtree push --prefix=src/exercise/jangwonbok/day02/tetris tetris main
```

- `--prefix`로 지정한 폴더의 내용만 떼어내어, `tetris` 원격의 `main` 브랜치 루트로 push한다.
- 폴더 안의 모든 파일(`index.html`, `style.css`, `script.js`, `README.md`, `.nojekyll`뿐 아니라 `AGENT.md`, `WORKFLOW.md`, `PLAN.md`, `DEPLOY.md`도 포함)이 그대로 새 저장소에 올라간다. 게임 동작에는 영향 없다.

## 4. GitHub Pages 활성화

1. 새로 만든 저장소 페이지에서 **Settings** 탭 이동
2. 왼쪽 메뉴에서 **Pages** 클릭
3. "Build and deployment" → Source: **Deploy from a branch** 선택
4. Branch: **main**, 폴더: **/(root)** 선택 후 **Save**
5. 잠시 후 상단에 `Your site is live at https://jangwonbok.github.io/tetris/` 안내가 나타난다 (수십 초~수 분 소요)

## 5. 배포 확인

브라우저로 다음 주소에 접속해 확인한다.

```
https://jangwonbok.github.io/tetris/
```

- 랜딩 페이지(TETRIS 로고, PLAY 버튼)가 정상적으로 로드되는지
- PLAY 버튼 클릭 시 `game.html`로 이동하고, 게임 화면(보드, Score, Level)이 정상적으로 로드되는지
- 키보드 조작(← → 이동, ↓ 소프트 드롭, ↑ 회전, Space 하드 드롭)이 동작하는지
- 30초마다 레벨이 오르고 속도가 빨라지는지

## 6. 이후 업데이트 방법

모노레포 안에서 평소처럼 `src/exercise/jangwonbok/day02/tetris/` 파일을 수정하고 커밋한 뒤, 같은 subtree push 명령을 다시 실행하면 된다.

```bash
git add src/exercise/jangwonbok/day02/tetris
git commit -m "Update tetris game"
git subtree push --prefix=src/exercise/jangwonbok/day02/tetris tetris main
```

만약 `tetris` 저장소를 GitHub 웹에서 직접 수정한 적이 있어 원격에 반영 안 된 변경사항이 있다면, push 전에 먼저 받아와 모노레포 쪽에 합친다. **rebase 대신 merge를 사용한다** (이 프로젝트의 `AGENT.md` 규칙과 동일한 기준 — `git subtree pull`은 내부적으로 merge를 사용한다).

```bash
git subtree pull --prefix=src/exercise/jangwonbok/day02/tetris tetris main
git subtree push --prefix=src/exercise/jangwonbok/day02/tetris tetris main
```

push가 완료되면 GitHub Pages가 자동으로 다시 빌드·배포한다 (수 초~수 분 소요).

## 참고

- 커스텀 도메인을 쓰려면 Settings → Pages → Custom domain에 도메인을 입력하고, DNS에 CNAME 레코드를 추가한다.
