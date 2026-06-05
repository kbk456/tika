---
name: changelog
description: 작업 이력을 CHANGELOG.md에 기록하고 CLAUDE.md 최근 변경사항 섹션을 갱신한다
argument-hint: "사용자가 입력한 프롬프트 내용 (예: /changelog API 엔드포인트 6개 구현)"
user-invocable: true
---

## User Input

```text
$ARGUMENTS
```

사용자가 입력한 프롬프트 텍스트다. 비어 있으면 "(프롬프트 없음)"으로 기록한다.

---

## 실행 순서

### Step 1: git 정보 수집

다음 명령을 순서대로 실행한다.

```bash
git branch --show-current
```
→ 브랜치명 저장

```bash
TZ=Asia/Seoul date '+%Y-%m-%d %H:%M'
```
→ 작업 일시 저장 (KST)

```bash
git log -1 --pretty="%s"
```
→ 최신 커밋 메시지 저장

```bash
git diff --stat HEAD~1 HEAD
```
→ 변경 파일 목록과 라인수 저장.
출력 라인마다 아래 규칙으로 구분을 결정한다:
- `git show --name-status HEAD` 의 `A` → 추가
- `M` → 수정
- `D` → 삭제
실제로는 `git show --name-status HEAD --format=""` 을 실행해 파일별 상태(A/M/D)와 경로를 얻고,
`git diff --stat HEAD~1 HEAD` 에서 +/- 라인수를 매핑한다.

### Step 2: 테스트 결과 수집

```bash
npm test 2>&1 | tail -8
```

출력에서 다음 정보를 파싱한다:
- `Tests: N passed` → passed 수
- `Tests: N failed` → failed 수 (없으면 0)
- `Test Suites: N passed` → 스위트 수
- 전체 통과이면 ✅, 실패가 하나라도 있으면 ❌

테스트 실행 자체가 불가능하면 "테스트 미실행"으로 기록한다.

### Step 3: CHANGELOG.md 항목 구성

아래 형식으로 새 항목을 작성한다. 프로젝트 루트는 `/Users/kimbokyun/project/Claude-Code-Expert/todo-app/` 이다.

```
## [브랜치명] YYYY-MM-DD HH:MM

**프롬프트**: 사용자가 입력한 요청 내용

**커밋**: 최신 커밋 메시지

**변경 파일**
| 구분 | 파일 경로 | +추가 | -삭제 |
|------|----------|-------|-------|
| 추가 | 파일경로 | N | N |
| 수정 | 파일경로 | N | N |

**테스트**: ✅ N passed, 0 failed (N suites)

---
```

### Step 4: CHANGELOG.md 업데이트

`CHANGELOG.md` 파일이 존재하는지 확인한다.

**없으면** 아래 헤더와 함께 새로 생성한다:
```
# CHANGELOG

프롬프트별 작업 이력. `/changelog` 스킬로 자동 기록된다.

---

(새 항목 내용)
```

**있으면** 기존 내용 앞에 새 항목을 prepend한다:
- Read 도구로 현재 내용을 읽는다
- 헤더 블록(`# CHANGELOG\n\n...\n\n---\n\n`) 바로 뒤에 새 항목을 삽입한다
- Write 도구로 전체 파일을 덮어쓴다

### Step 5: CLAUDE.md "최근 변경사항" 섹션 갱신

1. `CHANGELOG.md`에서 최근 14일 이내 항목(`## [브랜치명] YYYY-MM-DD` 헤더 기준)을 추출한다.
2. 각 항목에서 날짜, 브랜치명, 커밋 메시지 한 줄을 읽어 요약 목록을 만든다.
3. `CLAUDE.md`를 Read 도구로 읽는다.
4. `## 최근 변경사항` 섹션이 **있으면** 해당 섹션 전체(다음 `##` 섹션 직전까지)를 교체한다.
   **없으면** 파일 맨 끝에 추가한다.

섹션 형식:
```
## 최근 변경사항
> 최근 2주 이력 (상세 내용은 CHANGELOG.md 참조)

- YYYY-MM-DD `브랜치` — 커밋 메시지
- YYYY-MM-DD `브랜치` — 커밋 메시지
```

### Step 6: 완료 보고

다음 내용을 출력한다:
- CHANGELOG.md 항목 추가 확인
- CLAUDE.md "최근 변경사항" 섹션 갱신 확인
- 기록된 변경 파일 수, 테스트 결과 요약
