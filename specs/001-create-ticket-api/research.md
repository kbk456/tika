# Research: POST /api/tickets 구현 현황 분석

## 1. 기존 구현 현황

### 완료된 파일

| 파일 | 상태 | 비고 |
|------|------|------|
| `src/shared/types/index.ts` | ✅ 완료 | `Ticket`, `TICKET_STATUS`, `TICKET_PRIORITY` 정의 |
| `src/shared/validations/ticket.ts` | ✅ 완료 | `createTicketSchema`, 에러 메시지 명세 일치 |
| `src/server/db/schema.ts` | ✅ 완료 | `tickets` 테이블, 인덱스 포함 |
| `src/server/db/index.ts` | ✅ 완료 | postgres.js + Drizzle ORM 연결 |

### 버그가 있는 파일

| 파일 | 문제 | 명세 기대값 |
|------|------|-----------|
| `src/server/services/ticketService.ts:14` | BACKLOG 빈 경우 `position = 0` | `position = -1024` |

**근거**: API_SPEC.md 응답 예시 `"position": -1024` + 처리 규칙 "min(position) - 1024", 빈 칼럼이면 개념상 `0 - 1024 = -1024`

### 미완성 파일

| 파일 | 누락 항목 |
|------|---------|
| `app/api/tickets/route.ts` | JSON parse 오류 → 400 처리, 서비스 오류 → 500 처리 |
| `__tests__/api/tickets.test.ts` | 공백 제목, 설명 초과, position 순서 검증, `afterEach` 정리 |

---

## 2. 레이어 분리 구조 (현행 확인)

```
요청
  └─ app/api/tickets/route.ts        (Route Handler — 파싱 + 응답만)
       └─ src/server/services/ticketService.ts   (비즈니스 로직)
            └─ src/server/db/index.ts            (DB 연결)
                 └─ src/server/db/schema.ts       (Drizzle 스키마)
```

공유:
```
src/shared/validations/ticket.ts    → createTicketSchema (Route Handler에서 사용)
src/shared/types/index.ts           → Ticket, TICKET_STATUS 등
```

SDD 원칙 준수: 레이어 경계 올바르게 설정되어 있음.

---

## 3. 결정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| position 버그 수정 | `0` → `-1024` | API_SPEC.md 명세 |
| JSON parse 오류 처리 | try/catch → 400 VALIDATION_ERROR | 표준 API 패턴 |
| 서비스 오류 처리 | try/catch → 500 INTERNAL_ERROR | API_SPEC.md 에러 코드 |
| 테스트 정리 | `afterEach`에서 해당 테스트가 삽입한 행 삭제 | TDD + 테스트 격리 원칙 |
| 새 파일 추가 불필요 | 기존 구조 유지 | 명세 범위 내 수정만 필요 |
