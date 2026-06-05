<!--
동기화 영향 보고서 (Sync Impact Report)
========================================
버전 변경: 1.0.0 → 1.1.0
변경 유형: MINOR (새 원칙 추가)

수정된 원칙:
- 없음 (기존 원칙 내용 변경 없음)
- 섹션 제목 한국어 번역 적용 (원칙 VII 준수)

추가된 섹션:
- VII. 한국어 문서화 (Korean Documentation)
- 버전/날짜 헤더 추가

제거된 섹션:
- 없음

템플릿 업데이트 현황:
- ✅ .specify/memory/constitution.md — 본 파일 (버전 1.1.0)
- ✅ .specify/templates/plan-template.md — Constitution Check 항목 VII 추가

검토 완료 (변경 불필요):
- ✅ .specify/templates/spec-template.md — 원칙과 충돌 없음
- ✅ .specify/templates/tasks-template.md — 원칙과 충돌 없음

후속 조치 (Follow-up TODOs):
- 기존 specs/001-create-ticket-api/ 산출물은 이미 한국어로 작성되어 원칙 VII 준수 상태
- 향후 생성되는 모든 .md 파일은 한국어 작성 원칙 적용 필요
-->

# Tika Constitution

**버전**: 1.1.0
**최초 채택일**: 2026-06-05
**최종 수정일**: 2026-06-05

## 핵심 원칙 (Core Principles)

### I. 명세 주도 개발 (Specification-Driven Development)

모든 구현은 명세를 기반으로 하며, 명세는 구현보다 우선한다.
- **Why**: 명세 없는 구현은 불확실성을 야기하고 팀 간 혼선을 초래한다.
- **원칙**: 명세와 구현이 불일치하면 명세를 먼저 수정한 후 구현을 변경한다.

### II. 타입 안전성 (Type Safety) — NON-NEGOTIABLE

타입 안전성은 협상 불가능한 필수 요구사항이다.
- **Why**: 런타임 에러의 대부분은 타입 문제에서 발생한다. 컴파일 시점에 잡는 것이 비용이 가장 적다.
- **원칙**: TypeScript strict 모드, `any` 타입 절대 금지, 타입 체크 통과 없이는 커밋 불가.

### III. 계약 우선 API 설계 (Contract-First API Design)

API는 명확한 계약을 기반으로 설계되고 구현된다.
- **Why**: 프론트엔드-백엔드 간 인터페이스 불일치는 통합 단계에서 큰 비용을 발생시킨다.
- **원칙**: `docs/API_SPEC.md`에 정의된 요청/응답 형식을 정확히 준수한다.

### IV. 검증된 입력, 안전한 출력 (Validated Inputs, Safe Outputs)

모든 외부 입력은 검증되고, 모든 출력은 안전해야 한다.
- **Why**: 신뢰할 수 없는 입력은 보안 취약점과 런타임 에러의 주요 원인이다.
- **원칙**: Zod를 통한 입력 검증, `safeParse()` 사용, 타입 안전한 출력 보장.

### V. 관심사 분리 (Separation of Concerns)

각 계층은 명확한 책임을 갖고, 계층 간 경계를 넘지 않는다.
- **Why**: 책임이 혼재된 코드는 테스트, 유지보수, 확장이 어렵다.
- **원칙**: 비즈니스 로직은 서비스 레이어에, 프레젠테이션 로직은 UI 레이어에 집중.

### VI. 테스트 주도 개발 (Test-Driven Development)

테스트는 구현 이후가 아닌 이전에 작성된다.
- **Why**: 사후 테스트는 구현에 맞춰 작성되어 실제 요구사항 검증에 실패한다.
- **원칙**: Red-Green-Refactor 사이클을 엄격히 준수한다.

### VII. 한국어 문서화 (Korean Documentation)

모든 `.md` 파일은 한국어로 작성되어야 한다.
- **Why**: 팀의 주요 언어가 한국어이므로 문서의 일관성과 접근성을 보장하며, 팀원 모두가 문서를 정확히 이해할 수 있어야 한다.
- **원칙**: spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/\*.md, README.md 등 프로젝트 내 모든 마크다운 파일을 한국어로 작성한다. 코드 내 주석은 이 원칙의 적용 대상이 아니다.

## 🚨 가드레일 (Guardrails) — 절대 준수 사항

AI 코딩 에이전트가 실수로 위험한 작업을 수행하지 않도록 명시적으로 금지하는 규칙들이다.
**이 규칙들은 어떤 상황에서도 위반할 수 없다.**

### 데이터베이스 금지 명령어

- `DROP TABLE`, `DROP DATABASE` — 절대 금지
- `TRUNCATE` — 절대 금지
- `DELETE FROM` (WHERE 절 없이) — 절대 금지
- `ALTER TABLE DROP COLUMN` — 사용자 명시적 허가 필요

### 데이터베이스 안전 규칙

- 삭제/리셋 작업 시 반드시 사용자 승인 요청
- 삭제 전 백업 또는 복구 방법 안내
- 테스트 데이터 존재 시 DB 리셋 대신 SQL로 해결
- 운영 DB 자동 변경 절대 금지

### Git 금지 명령어

- `git push --force` — 절대 금지
- `git reset --hard` — 절대 금지
- `git clean -fd` — 사용자 확인 필요
- `git branch -D` (main/master) — 절대 금지

### 패키지 관리 금지 명령어

- `npm audit fix --force` — 절대 금지
- `rm -rf node_modules && npm install` — 사용자 확인 필요
- 메이저 버전 자동 업그레이드 — 절대 금지

### 파일 시스템 금지 명령어

- `rm -rf /` 또는 루트 경로 삭제 — 절대 금지
- 프로젝트 외부 파일 수정 — 절대 금지
- `.env` 파일 삭제 — 사용자 확인 필요
- `src/` 디렉토리 전체 삭제 — 절대 금지

### 안전 작업 원칙

- 파괴적 작업(삭제, 초기화) 전 반드시 사용자 확인
- 복구 불가능한 작업은 백업 방법 먼저 안내
- 자동화된 스크립트의 파괴적 명령 실행 금지
- 의심스러운 작업은 실행 전 사용자에게 설명 및 확인

## 아키텍처 제약 (Architecture Constraints)

### 불변 경계 (Immutable Boundaries)

시스템 경계는 명확하고 불변이다.
- Frontend (`src/client/`) ↔ Backend (`src/server/`) 직접 참조 금지
- Shared (`src/shared/`)만 양방향 참조 가능
- 경계를 넘는 모든 통신은 명세된 API를 통해서만

### 단일 진실 원천 (Single Source of Truth)

각 관심사는 단 하나의 정의 위치를 갖는다.
- 타입: `src/shared/types/`
- 검증 스키마: `src/shared/validations/`
- 비즈니스 로직: `src/server/services/`
- DB 스키마: `src/server/db/schema.ts`

### 프론트엔드 DB 직접 접근 금지 (No Direct Database Access from Frontend)

프론트엔드는 데이터베이스에 직접 접근할 수 없다.
- **Why**: 보안, 비즈니스 로직 중복, 트랜잭션 관리 문제
- **원칙**: 모든 데이터 접근은 API를 통해서만

## 품질 기준 (Quality Standards)

### 협상 불가능한 품질 게이트 (Non-Negotiable Quality Gates)

다음 검증을 통과하지 못하면 커밋할 수 없다.

1. TypeScript 타입 체크 통과
2. 모든 테스트 통과
3. 빌드 성공
4. 명세 문서와 일치

### 보안 요구사항 (Security Requirements)

- 환경 변수에 민감 정보 저장, 코드에 하드코딩 금지
- SQL Injection 방지: ORM 파라미터 바인딩만 사용
- XSS 방지: 모든 입력 검증 + React 자동 이스케이핑
- 에러 메시지에 내부 구현 상세 노출 금지

## 거버넌스 (Governance)

### Constitution 권위

이 Constitution은 모든 다른 개발 관행, 가이드, 제안보다 우선한다.

### 수정 절차 (Amendment Process)

Constitution 수정은 다음 절차를 따른다:

1. 변경 제안 (이유, 영향 범위, 대안 분석 포함)
2. 팀 전체 검토 및 논의
3. 합의 도출
4. 영향받는 코드의 마이그레이션 계획 수립
5. 문서화 및 승인
6. 버전 업데이트

### 버전 관리 정책 (Versioning Policy)

- MAJOR: 원칙 제거 또는 거버넌스 구조 변경 등 하위 호환성이 깨지는 변경
- MINOR: 새 원칙 추가 또는 내용의 실질적 확장
- PATCH: 오탈자 수정, 표현 개선 등 의미 변화가 없는 수정

### 준수 검토 (Enforcement)

- 모든 PR은 Constitution 준수 여부 검증 필수
- 위반 사항 발견 시 즉시 수정
- 예외 허용 시 문서화 및 제한적 범위 명시

### 살아있는 문서 (Living Document)

- Constitution은 프로젝트 진화에 따라 성장한다
- 하지만 핵심 원칙(Core Principles)은 신중히 변경한다
- 실무 세부사항은 CLAUDE.md에 위임

**실무 개발 가이드는 CLAUDE.md 참조**
