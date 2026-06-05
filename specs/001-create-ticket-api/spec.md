# Feature Specification: 티켓 생성 (POST /api/tickets)

**Feature Branch**: `001-create-ticket-api`

**Created**: 2026-06-05

**Status**: Draft

**Input**: API_SPEC.md의 POST /api/tickets 명세를 확인하고, 구현에 필요한 요구사항을 정리해줘.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 기본 티켓 생성 (Priority: P1)

사용자는 제목만 입력하여 최소 정보로 새 티켓을 생성할 수 있다.
새 티켓은 Backlog 칼럼의 맨 위에 자동 배치된다.

**Why this priority**: 티켓 생성은 칸반 보드의 핵심 기능이며, 모든 워크플로우의 시작점이다.

**Independent Test**: 제목만 담은 POST 요청 전송 → 201 응답 + Backlog 최상단 배치 확인만으로 독립적으로 검증 가능하다.

**Acceptance Scenarios**:

1. **Given** 유효한 제목(1-200자)이 포함된 요청, **When** POST /api/tickets 호출, **Then** 201 Created + 전체 티켓 데이터 반환 (status=BACKLOG, priority=MEDIUM 기본값)
2. **Given** 제목만 포함된 요청(선택 필드 없음), **When** POST /api/tickets 호출, **Then** description=null, plannedStartDate=null, dueDate=null, startedAt=null, completedAt=null
3. **Given** BACKLOG 칼럼에 기존 티켓이 있는 경우, **When** POST /api/tickets 호출, **Then** 새 티켓의 position이 기존 최솟값 - 1024

---

### User Story 2 - 선택 필드 포함 티켓 생성 (Priority: P2)

사용자는 설명, 우선순위, 시작예정일, 종료예정일을 선택적으로 지정하여 티켓을 생성할 수 있다.

**Why this priority**: 상세 정보가 있는 티켓은 팀 협업과 일정 관리에 필요하다.

**Independent Test**: 모든 선택 필드 포함 POST 요청 → 입력값 그대로 응답에 반영 확인

**Acceptance Scenarios**:

1. **Given** priority=HIGH, dueDate=오늘 이후, **When** POST /api/tickets 호출, **Then** 응답의 priority=HIGH, dueDate 일치
2. **Given** plannedStartDate와 dueDate 모두 포함, **When** POST /api/tickets 호출, **Then** 두 날짜 모두 응답에 반영
3. **Given** description 포함, **When** POST /api/tickets 호출, **Then** 응답의 description이 입력값과 일치

---

### User Story 3 - 유효성 검증 실패 처리 (Priority: P3)

잘못된 입력값에 대해 명확한 에러 메시지를 반환받을 수 있다.

**Why this priority**: 사용자가 잘못된 데이터를 입력할 때 정확한 안내가 필요하다.

**Independent Test**: 각 검증 실패 케이스별 요청 → 400 + 명세에 정의된 정확한 에러 메시지 확인

**Acceptance Scenarios**:

1. **Given** 제목 없는 요청, **When** POST /api/tickets 호출, **Then** 400 + `{ "error": { "code": "VALIDATION_ERROR", "message": "제목을 입력해주세요" } }`
2. **Given** 201자 제목, **When** POST /api/tickets 호출, **Then** 400 + `{ "error": { "code": "VALIDATION_ERROR", "message": "제목은 200자 이내로 입력해주세요" } }`
3. **Given** 공백만 있는 제목(" "), **When** POST /api/tickets 호출, **Then** 400 + `{ "error": { "code": "VALIDATION_ERROR", "message": "제목을 입력해주세요" } }`
4. **Given** 1001자 설명, **When** POST /api/tickets 호출, **Then** 400 + `{ "error": { "code": "VALIDATION_ERROR", "message": "설명은 1000자 이내로 입력해주세요" } }`
5. **Given** priority="URGENT", **When** POST /api/tickets 호출, **Then** 400 + `{ "error": { "code": "VALIDATION_ERROR", "message": "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" } }`
6. **Given** dueDate=어제 날짜(YYYY-MM-DD), **When** POST /api/tickets 호출, **Then** 400 + `{ "error": { "code": "VALIDATION_ERROR", "message": "종료예정일은 오늘 이후 날짜를 선택해주세요" } }`

---

### Edge Cases

- 제목이 정확히 200자인 경우 → 허용 (경계값 포함)
- 제목이 정확히 201자인 경우 → 거부
- dueDate가 오늘 날짜인 경우 → 허용 (오늘 포함)
- priority 미입력 시 → MEDIUM 기본값 적용
- BACKLOG 칼럼이 비어있는 경우 → position = -1024 (0 - 1024)
- description이 정확히 1000자인 경우 → 허용

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 POST /api/tickets 엔드포인트로 새 티켓 생성 요청을 수락해야 한다
- **FR-002**: 시스템은 생성된 티켓의 status를 항상 BACKLOG로 설정해야 한다
- **FR-003**: 시스템은 생성된 티켓의 position을 BACKLOG 칼럼 기존 최솟값 - 1024로 설정해야 한다 (BACKLOG가 비어있으면 -1024)
- **FR-004**: 시스템은 createdAt과 updatedAt을 현재 시각으로 자동 설정해야 한다
- **FR-005**: 시스템은 title이 없거나 공백만인 경우 요청을 거부해야 한다
- **FR-006**: 시스템은 title이 200자를 초과하면 요청을 거부해야 한다
- **FR-007**: 시스템은 description이 1000자를 초과하면 요청을 거부해야 한다
- **FR-008**: 시스템은 priority가 LOW/MEDIUM/HIGH 이외의 값이면 요청을 거부해야 한다
- **FR-009**: 시스템은 priority 미입력 시 MEDIUM을 기본값으로 적용해야 한다
- **FR-010**: 시스템은 dueDate가 오늘 이전 날짜이면 요청을 거부해야 한다
- **FR-011**: 시스템은 성공 시 HTTP 201과 함께 생성된 티켓 전체 데이터를 반환해야 한다
- **FR-012**: 시스템은 검증 실패 시 HTTP 400과 함께 `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }` 형식으로 반환해야 한다

### Key Entities

- **Ticket**: id, title, description, status, priority, position, plannedStartDate, dueDate, startedAt, completedAt, createdAt, updatedAt
- **ValidationError**: code ("VALIDATION_ERROR"), message (사람이 읽을 수 있는 한국어 에러 메시지)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 유효한 요청 시 티켓이 1초 이내에 생성되어 Backlog에 표시된다
- **SC-002**: 생성된 티켓이 Backlog 칼럼의 맨 위(가장 작은 position)에 배치된다
- **SC-003**: 6가지 검증 오류 케이스 모두에서 명세에 정의된 정확한 에러 메시지가 반환된다
- **SC-004**: 선택 필드를 생략한 경우 응답에서 해당 필드가 null로 반환된다
- **SC-005**: priority 미입력 시 응답의 priority가 MEDIUM이다

## Assumptions

- 인증 없음 (MVP - 단일 사용자 환경)
- plannedStartDate와 dueDate 간 순서 검증(시작일 < 종료일)은 이 엔드포인트 범위 밖 (API_SPEC.md에 명시 없음)
- 검증 스키마(CreateTicketInput)는 src/shared/validations/ticket.ts에서 백엔드와 프론트엔드가 공유
- position 계산 시 동시성(race condition) 방지를 위해 DB 트랜잭션 처리 필요
- startedAt, completedAt은 생성 시 항상 null (상태 변경 시 별도 API에서 처리)
