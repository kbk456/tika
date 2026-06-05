# Data Model: POST /api/tickets

## Ticket 엔티티

### DB 스키마 (`src/server/db/schema.ts`)

| 컬럼 | Drizzle 타입 | Nullable | 기본값 | 설명 |
|------|------------|----------|--------|------|
| id | serial (PK) | NO | auto | 티켓 ID |
| title | varchar(200) | NO | — | 제목 |
| description | text | YES | NULL | 상세 설명 |
| status | varchar(20) | NO | 'BACKLOG' | 칼럼 상태 |
| priority | varchar(10) | NO | 'MEDIUM' | 우선순위 |
| position | integer | NO | 1 | 칼럼 내 정렬 순서 |
| planned_start_date | date (string mode) | YES | NULL | 시작예정일 |
| due_date | date (string mode) | YES | NULL | 종료예정일 |
| started_at | timestamp (date mode) | YES | NULL | 실제 시작일 |
| completed_at | timestamp (date mode) | YES | NULL | 완료일 |
| created_at | timestamp (date mode) | NO | NOW() | 생성 시각 |
| updated_at | timestamp (date mode) | NO | NOW() | 수정 시각 ($onUpdate) |

### 인덱스

- `idx_tickets_status_position` — (status, position) 복합 인덱스: 칼럼별 정렬 쿼리 최적화
- `idx_tickets_due_date` — due_date: 오버듀 계산 최적화
- `idx_tickets_completed_at` — completed_at: DONE 칼럼 24시간 필터 최적화

---

## POST /api/tickets 입력 → 저장 매핑

| 입력 필드 | 저장 값 | 처리 규칙 |
|----------|---------|---------|
| title | title | 그대로 저장 |
| description | description | 미제공 시 NULL |
| priority | priority | 미제공 시 'MEDIUM' |
| plannedStartDate | planned_start_date | 미제공 시 NULL |
| dueDate | due_date | 미제공 시 NULL |
| (자동) status | status | 항상 'BACKLOG' |
| (자동) position | position | min(BACKLOG position) - 1024, 빈 칼럼이면 -1024 |
| (자동) started_at | started_at | NULL (생성 시 항상) |
| (자동) completed_at | completed_at | NULL (생성 시 항상) |
| (자동) created_at | created_at | DB 기본값 NOW() |
| (자동) updated_at | updated_at | DB 기본값 NOW() |

---

## 상태 전이

POST /api/tickets는 초기 상태만 설정 (BACKLOG). 상태 변경은 별도 API 담당:

```
생성 → BACKLOG
BACKLOG → TODO        (PATCH /api/tickets/reorder)
TODO → IN_PROGRESS    (PATCH /api/tickets/reorder)
any → DONE            (PATCH /api/tickets/:id/complete)
DONE → any            (PATCH /api/tickets/reorder)
```

---

## 유효성 검사 규칙 (`src/shared/validations/ticket.ts`)

| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| title | required | "제목을 입력해주세요" |
| title | min(1), trim 후 length > 0 | "제목을 입력해주세요" |
| title | max(200) | "제목은 200자 이내로 입력해주세요" |
| description | max(1000) | "설명은 1000자 이내로 입력해주세요" |
| priority | enum(LOW, MEDIUM, HIGH) | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| dueDate | >= 오늘(YYYY-MM-DD) | "종료예정일은 오늘 이후 날짜를 선택해주세요" |
