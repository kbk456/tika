# 구현 계획: [FEATURE]

**브랜치**: `[###-feature-name]` | **날짜**: [DATE] | **명세**: [link]

**입력**: `/specs/[###-feature-name]/spec.md` 의 기능 명세

**참고**: 이 템플릿은 `/speckit-plan` 명령어가 채워줍니다. 실행 워크플로우는 `.specify/templates/plan-template.md` 참조.

## 요약

[기능 명세에서 추출: 핵심 요구사항 + 리서치에서 도출한 기술 접근 방식]

## 기술 컨텍스트

<!--
  작성 필요: 이 섹션의 내용을 프로젝트의 실제 기술 세부사항으로 교체하세요.
  아래 구조는 반복 프로세스를 안내하기 위한 참고용입니다.
-->

**언어/버전**: [예: Python 3.11, TypeScript 5.x, Rust 1.75 또는 명확화 필요]

**주요 의존성**: [예: FastAPI, Next.js, LLVM 또는 명확화 필요]

**저장소**: [해당 시: PostgreSQL, CoreData, 파일 등 또는 해당 없음]

**테스트**: [예: pytest, Jest, cargo test 또는 명확화 필요]

**타깃 플랫폼**: [예: Linux 서버, iOS 15+, WASM 또는 명확화 필요]

**프로젝트 유형**: [예: 라이브러리/CLI/웹서비스/모바일앱/컴파일러/데스크탑앱 또는 명확화 필요]

**성능 목표**: [도메인별: 예: 1000 req/s, 10k 라인/초, 60 fps 또는 명확화 필요]

**제약 조건**: [도메인별: 예: p95 200ms 이하, 메모리 100MB 이하, 오프라인 지원 또는 명확화 필요]

**규모/범위**: [도메인별: 예: 사용자 1만 명, 코드 100만 줄, 화면 50개 또는 명확화 필요]

## 헌법 체크 (Constitution Check)

*게이트: Phase 0 리서치 전 통과 필수. Phase 1 설계 후 재검토.*

- [ ] **I. TypeScript Strict**: 새 파일 모두 strict 모드 사용; `any` 및 근거 없는 `@ts-ignore` 금지
- [ ] **II. API 계약**: 응답 형태가 `docs/API_SPEC.md`와 정확히 일치; 상태 코드 200/201/204/400/404/500
- [ ] **III. 에러 형식**: 모든 에러 응답은 `{ "error": { "code": string, "message": string } }` 사용
- [ ] **IV. Zod 검증**: 외부 입력 모두 `src/shared/validations/`에서 `safeParse()`로 검증
- [ ] **V. 서비스 레이어**: 비즈니스 로직은 `src/server/services/`에; Route Handler에 비즈니스 로직 없음
- [ ] **VII. 한국어 문서화**: 이 피처에서 생성/수정하는 모든 `.md` 파일은 한국어로 작성

## 프로젝트 구조

### 문서 (이 피처)

```text
specs/[###-feature]/
├── plan.md              # 이 파일 (/speckit-plan 명령어 출력)
├── research.md          # Phase 0 출력 (/speckit-plan 명령어)
├── data-model.md        # Phase 1 출력 (/speckit-plan 명령어)
├── quickstart.md        # Phase 1 출력 (/speckit-plan 명령어)
├── contracts/           # Phase 1 출력 (/speckit-plan 명령어)
└── tasks.md             # Phase 2 출력 (/speckit-tasks 명령어 — /speckit-plan에서 생성하지 않음)
```

### 소스 코드 (저장소 루트)

<!--
  작성 필요: 아래 플레이스홀더 트리를 이 피처의 실제 레이아웃으로 교체하세요.
  사용하지 않는 옵션은 삭제하고, 실제 경로로 구조를 확장하세요.
  완성된 plan에는 Option 레이블이 남아 있으면 안 됩니다.
-->

```text
# [사용하지 않으면 삭제] 옵션 1: 단일 프로젝트 (기본값)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [사용하지 않으면 삭제] 옵션 2: 웹 애플리케이션 (프론트엔드 + 백엔드 감지 시)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [사용하지 않으면 삭제] 옵션 3: 모바일 + API (iOS/Android 감지 시)
api/
└── [위의 backend와 동일]

ios/ 또는 android/
└── [플랫폼별 구조: 피처 모듈, UI 흐름, 플랫폼 테스트]
```

**구조 결정**: [선택한 구조와 위에서 파악한 실제 경로를 기록]

## 복잡도 추적 (Complexity Tracking)

> **헌법 체크 위반 항목이 있을 때만 작성**

| 위반 항목 | 필요한 이유 | 더 단순한 대안을 거부한 이유 |
|----------|------------|--------------------------|
| [예: 4번째 프로젝트] | [현재 필요성] | [3개 프로젝트로 부족한 이유] |
| [예: Repository 패턴] | [특정 문제] | [직접 DB 접근으로 부족한 이유] |
