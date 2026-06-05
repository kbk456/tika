# API Contract: POST /api/tickets

## 엔드포인트

```
POST /api/tickets
Content-Type: application/json
```

---

## Request Body

```typescript
// src/shared/validations/ticket.ts → CreateTicketInput
{
  title: string;               // 필수. 1~200자, 공백만 불가
  description?: string;        // 선택. 최대 1000자
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';  // 선택. 기본값 MEDIUM
  plannedStartDate?: string;   // 선택. YYYY-MM-DD
  dueDate?: string;            // 선택. YYYY-MM-DD, 오늘 이후
}
```

**예시**:
```json
{
  "title": "API 설계 문서 작성",
  "description": "REST API 엔드포인트와 요청/응답 형식을 정의한다",
  "priority": "HIGH",
  "plannedStartDate": "2026-06-10",
  "dueDate": "2026-06-20"
}
```

---

## Response 201 Created

```typescript
{
  id: number;
  title: string;
  description: string | null;
  status: 'BACKLOG';           // 생성 시 항상 BACKLOG
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  position: number;            // BACKLOG 칼럼 최솟값 - 1024 (빈 칼럼이면 -1024)
  plannedStartDate: string | null;  // YYYY-MM-DD
  dueDate: string | null;           // YYYY-MM-DD
  startedAt: null;             // 생성 시 항상 null
  completedAt: null;           // 생성 시 항상 null
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
}
```

**예시**:
```json
{
  "id": 1,
  "title": "API 설계 문서 작성",
  "description": "REST API 엔드포인트와 요청/응답 형식을 정의한다",
  "status": "BACKLOG",
  "priority": "HIGH",
  "position": -1024,
  "plannedStartDate": "2026-06-10",
  "dueDate": "2026-06-20",
  "startedAt": null,
  "completedAt": null,
  "createdAt": "2026-06-05T09:00:00.000Z",
  "updatedAt": "2026-06-05T09:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request — VALIDATION_ERROR

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "<에러 메시지>"
  }
}
```

| 조건 | message |
|------|---------|
| 제목 누락 | "제목을 입력해주세요" |
| 제목 공백만 | "제목을 입력해주세요" |
| 제목 200자 초과 | "제목은 200자 이내로 입력해주세요" |
| 설명 1000자 초과 | "설명은 1000자 이내로 입력해주세요" |
| 잘못된 priority | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| 과거 dueDate | "종료예정일은 오늘 이후 날짜를 선택해주세요" |

### 500 Internal Server Error — INTERNAL_ERROR

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 오류가 발생했습니다"
  }
}
```

---

## 처리 흐름

```
1. Request 수신 (app/api/tickets/route.ts)
2. request.json() 파싱 — 실패 시 400 반환
3. createTicketSchema.safeParse(body) — 실패 시 첫 번째 에러 메시지로 400 반환
4. ticketService.create(validatedData) 호출
   a. SELECT min(position) FROM tickets WHERE status = 'BACKLOG'
   b. position = minPos != null ? minPos - 1024 : -1024
   c. INSERT INTO tickets (...) RETURNING *
5. 201 + 생성된 티켓 반환
6. 서비스 오류 시 500 반환
```
