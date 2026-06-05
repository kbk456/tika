# Implementation Plan: POST /api/tickets 티켓 생성

**Branch**: `001-create-ticket-api` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: POST api/tickets 를 구현할 계획을 세워줘. Zod 검증, Router Handler, Service 레이어 분리를 고려해

## Summary

POST /api/tickets 엔드포인트의 골격 구현은 이미 존재한다. 명세와 대조한 결과 position 버그 1건, Route Handler 에러 처리 누락, 테스트 미완성 항목이 발견되었다. 3개 파일 수정으로 TC-API-001의 모든 케이스를 통과시키는 것이 목표다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 15 App Router, Drizzle ORM 0.38, Zod 3.x, postgres.js 3.x

**Storage**: PostgreSQL (로컬: `DATABASE_URL`, 배포: Vercel Postgres)

**Testing**: Jest 29 + @testing-library/jest-dom

**Target Platform**: Next.js API Route Handler (Node.js runtime)

**Project Type**: Web service (Next.js App Router fullstack)

**Performance Goals**: 티켓 생성 1초 이내 (단일 사용자 MVP)

**Constraints**: TypeScript strict, any 금지, raw SQL 금지

**Scale/Scope**: MVP 단일 사용자

## Constitution Check

- [x] **I. TypeScript Strict**: 수정 대상 3개 파일 모두 strict 모드 유지, any 미사용
- [x] **II. API Contract**: position 버그 수정으로 `"position": -1024` 명세 준수
- [x] **III. Error Format**: `{ error: { code, message } }` 이미 사용 중, 500 응답에도 동일 형식 적용
- [x] **IV. Zod Validation**: `createTicketSchema.safeParse()` 이미 사용 중
- [x] **V. Service Layer**: Route Handler는 파싱+응답만, 비즈니스 로직은 `ticketService`에 유지

## Project Structure

### Documentation (this feature)

```text
specs/001-create-ticket-api/
├── plan.md              ← 이 파일
├── spec.md              ← 요구사항 명세
├── research.md          ← 현황 분석 결과
├── data-model.md        ← Ticket 엔티티 + 유효성 규칙
├── quickstart.md        ← 검증 시나리오
├── contracts/
│   └── post-tickets.md  ← API 계약
└── checklists/
    └── requirements.md  ← 품질 체크리스트
```

### Source Code

```text
app/api/tickets/
└── route.ts             ← [수정] JSON parse 오류 + 500 에러 처리 추가

src/server/services/
└── ticketService.ts     ← [수정] position 버그: 0 → -1024

__tests__/api/
└── tickets.test.ts      ← [수정] 누락 테스트 케이스 + afterEach 정리 추가
```

**수정 불필요 (완료)**:
```text
src/shared/types/index.ts          ← Ticket, TICKET_STATUS, TICKET_PRIORITY
src/shared/validations/ticket.ts   ← createTicketSchema (명세 일치)
src/server/db/schema.ts            ← tickets 테이블
src/server/db/index.ts             ← DB 연결
```

---

## 구현 상세

### 수정 1: `src/server/services/ticketService.ts`

**버그**: BACKLOG 칼럼이 비어있을 때 `position = 0` → `position = -1024` 로 수정

```typescript
// 현재 (버그)
const position = row?.minPos != null ? row.minPos - 1024 : 0;

// 수정 후
const position = row?.minPos != null ? row.minPos - 1024 : -1024;
```

---

### 수정 2: `app/api/tickets/route.ts`

**추가**: JSON parse 실패 → 400, 서비스 오류 → 500

```typescript
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 형식이 올바르지 않습니다' } },
      { status: 400 }
    );
  }

  const result = createTicketSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: firstError.message } },
      { status: 400 }
    );
  }

  try {
    const ticket = await ticketService.create(result.data);
    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
```

---

### 수정 3: `__tests__/api/tickets.test.ts`

**추가 테스트 케이스** (TC-API-001 기준):

| 추가 케이스 | 대응 TC |
|-----------|---------|
| 공백만 있는 제목 → 400 | 001-5 |
| 설명 1000자 초과 → 400 | 001-7 |
| 두 번째 티켓 position < 첫 번째 | 001-10 |

**afterEach 정리**: 각 테스트에서 생성된 티켓 ID를 추적하여 DELETE 처리

---

## Complexity Tracking

Constitution Check 위반 없음 — 모두 통과.

---

## 검증

```bash
# 1. 타입 체크
npx tsc --noEmit

# 2. 테스트 실행
npm test -- --testPathPattern="tickets"

# 3. 수동 검증 (quickstart.md 참조)
npm run dev
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "테스트 할일"}'
# 기대: 201, position=-1024, priority=MEDIUM
```

**통과 기준**: TC-API-001의 001-1 ~ 001-11 전체 통과
