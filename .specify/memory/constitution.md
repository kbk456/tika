<!--
동기화 영향 보고서
버전 변경: N/A (최초 작성) → 1.0.0
추가된 섹션: 핵심 원칙 (5개), 거버넌스
업데이트된 템플릿:
  ✅ .specify/templates/plan-template.md — Constitution Check 게이트 반영
  ✅ .specify/templates/spec-template.md — 변경 없음
  ✅ .specify/templates/tasks-template.md — 변경 없음
-->

# Tika 헌법

## 핵심 원칙

### I. TypeScript strict 모드 (비협상 원칙)

모든 소스 파일에서 TypeScript strict 모드를 반드시 활성화해야 한다. `tsconfig.json`의 `strict: true`는 비활성화할 수 없다.

- `any` 타입은 금지한다. `unknown` + 타입 가드를 사용한다
- `@ts-ignore`는 명시적인 사유 주석 없이 사용할 수 없다
- 컴파일 에러는 머지 전에 반드시 해결해야 한다

### II. API 명세 준수

모든 API 응답은 `docs/API_SPEC.md`에 정의된 형식을 정확히 따라야 한다.

- HTTP 상태 코드는 명세에 따른다: 200, 201, 204, 400, 404, 500
- 응답 필드 이름과 타입은 명세 예시와 동일해야 한다
- 명세와 구현이 다를 경우, 반드시 명세를 먼저 수정한 후 구현을 변경한다

### III. 에러 응답 형식 통일

모든 에러 응답은 반드시 `{ "error": { "code": string, "message": string } }` 형식을 사용해야 한다.

- `code`는 SCREAMING_SNAKE_CASE 문자열이어야 한다 (예: `VALIDATION_ERROR`, `TICKET_NOT_FOUND`)
- `message`는 `docs/API_SPEC.md`에 정의된 메시지와 일치해야 한다
- 다른 에러 형식은 허용하지 않는다

### IV. Zod 요청 검증

외부 입력(API 요청 본문, 쿼리 파라미터)은 사용 전 반드시 Zod 스키마로 검증해야 한다.

- Zod 스키마는 `src/shared/validations/`에 정의하고 프론트엔드와 백엔드가 공유한다
- `parse()` 대신 `safeParse()`를 사용한다
- 검증 실패 시 HTTP 400과 원칙 III의 에러 형식으로 응답해야 한다

### V. 서비스 계층 분리

모든 비즈니스 로직은 `src/server/services/`에 위치해야 한다. Route Handler(`app/api/`)는 요청 파싱 → 서비스 호출 → 응답 반환만 담당한다.

- `src/client/`는 `src/server/`를 import할 수 없다
- `src/server/`는 `src/client/`를 import할 수 없다
- 계층 간 데이터는 반드시 `src/shared/`를 통해서만 흐른다

## VI. 임의 작업 금지

명세에 정의되지 않은 기능, 필드, 동작을 임의로 추가하거나 구현하지 않는다.

- 요청받지 않은 기능, 리팩터링, 추상화를 도입하지 않는다
- 명세에 없는 필드나 엔드포인트를 임의로 추가하지 않는다
- 작업 범위를 벗어난 코드(관련 없는 파일, 계층)를 수정하지 않는다
- 추가 작업이 필요하다고 판단될 경우, 구현 전에 반드시 사용자에게 확인한다

## 거버넌스

이 헌법은 모든 다른 관행과 컨벤션에 우선한다. 개정 시 아래 절차를 따른다:

1. 변경 사유를 문서화한다
2. 시맨틱 버저닝에 따라 버전을 올린다 (MAJOR: 원칙 제거/재정의, MINOR: 원칙 추가, PATCH: 문구 수정)
3. 의존 템플릿을 함께 업데이트한다
4. 런타임 개발 가이드는 `CLAUDE.md`를 참조한다

**버전**: 1.0.0 | **제정일**: 2026-06-05 | **최종 개정일**: 2026-06-05
