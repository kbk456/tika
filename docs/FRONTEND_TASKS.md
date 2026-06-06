# Tika - 프런트엔드 구현 계획 (FRONTEND_TASKS.md)

> 기반 문서: COMPONENT_SPEC.md, TEST_CASES.md, REQUIREMENTS.md
> 구현 순서: Bottom-up (말단 → 컨테이너)
> 테스트: Jest + React Testing Library (TDD)

---

## 의존성 그래프

```
Button ────────────────────────────────────┐
Badge ─────────────────────────────────────┤
Modal ──────┬──────────────────────────────┤
            ├── ConfirmDialog ─────────────┤
            │                              │
TicketCard ─┤                              │
ColumnHeader┼── Column ── Board ───────────┤
            │                              │
TicketDetailView                           │
TicketForm ─┼── TicketModal ───────────────┤
            │                              │
ticketApi ── useTickets ───────────────────┤
                                           │
BoardHeader ┤                              │
FilterBar ──┼── BoardContainer ──── page.tsx
```

---

## Phase 구성 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | UI 기본 컴포넌트 (Button · Badge · Modal · ConfirmDialog) | ✅ |
| Phase 2 | Board 컴포넌트 (TicketCard · ColumnHeader · Column · Board) | 🔲 |
| Phase 3 | Ticket 컴포넌트 (TicketDetailView · TicketForm · TicketModal) | 🔲 |
| Phase 4 | 데이터 레이어 (ticketApi · useTickets) | 🔲 |
| Phase 5 | 컨테이너 (BoardHeader · FilterBar · BoardContainer · page.tsx) | 🔲 |

---

## Phase 1 — UI 기본 컴포넌트 ✅

### `src/client/components/ui/Button.tsx` ✅

**TDD 체크리스트**:
- [x] `variant="primary/secondary/danger/ghost"` → 각 `.btn--*` 클래스
- [x] `size="sm/md/lg"` → 각 `.btn--*` 클래스
- [x] 기본값 `variant=primary`, `size=md`
- [x] `onClick` 핸들러 호출
- [x] `isLoading=true` → disabled + "처리중.." 표시
- [x] `isLoading=true` 시 클릭 무시
- [x] children 렌더링

---

### `src/client/components/ui/Badge.tsx` ✅

**TDD 체크리스트**:
- [x] `variant="low/medium/high/due/overdue"` → 각 `.badge--*` 클래스
- [x] children 텍스트 렌더링

---

### `src/client/components/ui/Modal.tsx` ✅

**TDD 체크리스트**:
- [x] `isOpen=false` → 렌더링 없음
- [x] `isOpen=true` → `.modal-overlay` + `.modal-container` 렌더링
- [x] ESC 키 → `onClose` 호출
- [x] 오버레이 클릭 → `onClose` 호출
- [x] 컨텐츠 영역 클릭 → `onClose` 미호출

---

### `src/client/components/ui/ConfirmDialog.tsx` ✅

**Props**: `isOpen`, `message`, `onConfirm`, `onCancel`, `isLoading?`
**의존**: Modal, Button

**TDD 체크리스트**:
- [x] `isOpen=false` → 렌더링 없음
- [x] `isOpen=true` → message 텍스트 표시
- [x] 확인 클릭 → `onConfirm` 호출
- [x] 취소 클릭 → `onCancel` 호출
- [x] 확인 버튼 `.btn--danger` 스타일
- [x] `isLoading=true` → 확인 버튼 비활성화

---

## Phase 2 — Board 컴포넌트

### `src/client/components/ticket/TicketCard.tsx`

```typescript
interface TicketCardProps {
  ticket: TicketWithOverdue;
  onClick: () => void;
  isDragging?: boolean;  // DragOverlay에서 사용
}
```

**의존**: Badge
**테스트 파일**: `__tests__/components/ticket/TicketCard.test.tsx`
**TC 참조**: TC-COMP-001 (C001-1 ~ C001-7)

**TDD 체크리스트**:
- [ ] 제목 렌더링
- [ ] 우선순위 뱃지 렌더링 (Badge 컴포넌트 사용)
- [ ] `priority="LOW"` → Badge `variant="low"`
- [ ] `priority="MEDIUM"` → Badge `variant="medium"`
- [ ] `priority="HIGH"` → Badge `variant="high"`
- [ ] `dueDate` 있을 때 종료예정일 표시 (Badge `variant="due"`)
- [ ] `dueDate=null` → 종료예정일 미표시
- [ ] `isOverdue=true` → `.ticket-card--overdue` 클래스 + Badge `variant="overdue"`
- [ ] `isOverdue=false` → 오버듀 스타일 없음
- [ ] 카드 클릭 → `onClick` 호출
- [ ] `isDragging=true` → `.ticket-card--dragging` 클래스 적용

---

### `src/client/components/board/ColumnHeader.tsx`

```typescript
interface ColumnHeaderProps {
  title: string;
  count: number;
}
```

**테스트 파일**: `__tests__/components/board/ColumnHeader.test.tsx`

**TDD 체크리스트**:
- [ ] 칼럼명(title) 텍스트 표시
- [ ] 티켓 수(count) 뱃지 표시
- [ ] `count=0` → 뱃지에 "0" 표시

---

### `src/client/components/board/Column.tsx`

```typescript
interface ColumnProps {
  status: TicketStatus;
  tickets: TicketWithOverdue[];
  onTicketClick: (ticket: TicketWithOverdue) => void;
}
```

**의존**: ColumnHeader, TicketCard
**테스트 파일**: `__tests__/components/board/Column.test.tsx`
**TC 참조**: TC-COMP-002 (C002-1 ~ C002-3)

**TDD 체크리스트**:
- [ ] 칼럼 헤더에 칼럼명 표시 (BACKLOG→"Backlog", TODO→"Todo", IN_PROGRESS→"In Progress", DONE→"Done")
- [ ] 칼럼 헤더에 티켓 수 뱃지 표시
- [ ] tickets 배열만큼 TicketCard 렌더링
- [ ] `tickets=[]` → "이 칼럼에 티켓이 없습니다" 안내 표시
- [ ] TicketCard 클릭 → `onTicketClick(ticket)` 호출

---

### `src/client/components/board/Board.tsx`

```typescript
interface BoardProps {
  board: BoardData;
  onTicketClick: (ticket: TicketWithOverdue) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeTicket: TicketWithOverdue | null;
}
```

**의존**: Column, @dnd-kit/core
**테스트 파일**: `__tests__/components/board/Board.test.tsx`
**TC 참조**: TC-COMP-003 (C003-1 ~ C003-2)
> DndContext는 `@dnd-kit/core` mock 처리

**TDD 체크리스트**:
- [ ] BACKLOG Column이 사이드바(`.board-sidebar`)에 렌더링
- [ ] TODO / IN_PROGRESS / DONE Column이 메인 그리드(`.board-columns`)에 렌더링
- [ ] 4개 Column 모두 존재
- [ ] 각 Column에 올바른 `status` prop 전달
- [ ] `activeTicket` 있을 때 DragOverlay에 TicketCard 복제본 표시
- [ ] `onTicketClick` 이벤트 Column을 통해 전달

---

## Phase 3 — Ticket 컴포넌트

### `src/client/components/ticket/TicketDetailView.tsx`

```typescript
interface TicketDetailViewProps {
  ticket: TicketWithOverdue;
}
```

**테스트 파일**: `__tests__/components/ticket/TicketDetailView.test.tsx`
**TC 참조**: TC-COMP-005 C005-2

**TDD 체크리스트**:
- [ ] status, startedAt, completedAt, createdAt 읽기 전용 표시
- [ ] 값 없는 필드 → "-" 표시
- [ ] `.form-readonly` 클래스 적용

---

### `src/client/components/ticket/TicketForm.tsx`

```typescript
interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}
```

**의존**: Button, Zod (`src/shared/validations/ticket.ts`)
**테스트 파일**: `__tests__/components/ticket/TicketForm.test.tsx`
**TC 참조**: TC-COMP-004 (C004-1 ~ C004-7)

**TDD 체크리스트**:
- [ ] `mode="create"` → 빈 폼, 우선순위 MEDIUM 기본 선택
- [ ] `mode="edit"` + `initialData` → 각 필드에 기존 값 반영
- [ ] 필드 렌더링: title, description, priority(select), plannedStartDate, dueDate
- [ ] 빈 제목 제출 → "제목을 입력해주세요" 인라인 에러
- [ ] 200자 초과 제목 → "제목은 200자 이내로 입력해주세요"
- [ ] 1000자 초과 설명 → "설명은 1000자 이내로 입력해주세요"
- [ ] 과거 종료예정일 → "종료예정일은 오늘 이후 날짜를 선택해주세요"
- [ ] 유효한 데이터 제출 → `onSubmit` 호출 + 올바른 데이터 전달
- [ ] `isLoading=true` → 제출 버튼 비활성화 + 스피너
- [ ] 취소 클릭 → `onCancel` 호출

---

### `src/client/components/ticket/TicketModal.tsx`

```typescript
interface TicketModalProps {
  ticket: TicketWithOverdue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTicketInput) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}
```

**의존**: Modal, TicketDetailView, TicketForm, ConfirmDialog
**테스트 파일**: `__tests__/components/ticket/TicketModal.test.tsx`
**TC 참조**: TC-COMP-005 (C005-1 ~ C005-6)

**TDD 체크리스트**:
- [ ] `isOpen=false` → 렌더링 없음
- [ ] `isOpen=true` → 티켓 정보 표시
- [ ] 읽기 전용 필드 표시: status, startedAt, completedAt, createdAt
- [ ] 값 없는 읽기 전용 필드 → "-" 표시
- [ ] 편집 가능 필드: title, description, priority, plannedStartDate, dueDate
- [ ] 수정 제출 → `onUpdate(id, data)` 호출
- [ ] ESC 키 → `onClose` 호출 (Modal 위임)
- [ ] 오버레이 클릭 → `onClose` 호출 (Modal 위임)
- [ ] 삭제 버튼 클릭 → ConfirmDialog 열림
- [ ] ConfirmDialog 확인 → `onDelete(id)` 호출
- [ ] ConfirmDialog 취소 → ConfirmDialog 닫힘, `onDelete` 미호출
- [ ] `isLoading=true` → 수정/삭제 버튼 비활성화

---

## Phase 4 — 데이터 레이어

### `src/client/api/ticketApi.ts`

```
fetchBoard()          → GET  /api/tickets
createTicket(data)    → POST /api/tickets
getTicket(id)         → GET  /api/tickets/:id
updateTicket(id,data) → PATCH /api/tickets/:id
deleteTicket(id)      → DELETE /api/tickets/:id
completeTicket(id)    → PATCH /api/tickets/:id/complete
reorderTicket(data)   → PATCH /api/tickets/reorder
```

**테스트 파일**: `__tests__/api/ticketApi.test.ts` (global fetch mock)

**TDD 체크리스트**:
- [ ] `fetchBoard` — 200 응답 시 BoardData 반환
- [ ] `fetchBoard` — 네트워크 에러 시 throw
- [ ] `createTicket` — 201 응답 시 Ticket 반환
- [ ] `createTicket` — 400 응답 시 에러 메시지 throw
- [ ] `updateTicket` — 200 응답 시 Ticket 반환
- [ ] `updateTicket` — 404 응답 시 에러 throw
- [ ] `deleteTicket` — 204 응답 시 정상 반환
- [ ] `completeTicket` — 200 응답 시 Ticket 반환
- [ ] `reorderTicket` — 200 응답 시 응답 데이터 반환

---

### `src/client/hooks/useTickets.ts`

```typescript
function useTickets(initialData: BoardData): {
  board: BoardData;
  isLoading: boolean;
  error: string | null;
  create: (data: CreateTicketInput) => Promise<void>;
  update: (id: number, data: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (ticketId: number, status: ReorderableStatus, position: number) => Promise<void>;
  complete: (id: number) => Promise<void>;
}
```

**테스트 파일**: `__tests__/hooks/useTickets.test.ts` (ticketApi 전체 jest.mock)

**TDD 체크리스트**:
- [ ] `initialData`로 초기 board 상태 설정
- [ ] `create` 호출 → 낙관적 업데이트로 BACKLOG 맨 앞에 추가
- [ ] `create` 성공 → board 서버 데이터로 확정
- [ ] `create` 실패 → 이전 board 상태로 롤백 + error 설정
- [ ] `update` 호출 → 해당 티켓 낙관적 업데이트
- [ ] `update` 실패 → 롤백 + error 설정
- [ ] `remove` 호출 → 해당 티켓 board에서 즉시 제거
- [ ] `remove` 실패 → 롤백 + error 설정
- [ ] `reorder` 호출 → 대상 칼럼/위치로 티켓 낙관적 이동
- [ ] `reorder` 실패 → 롤백 + error 설정
- [ ] `complete` 호출 → 티켓 DONE 칼럼으로 낙관적 이동
- [ ] `complete` 실패 → 롤백 + error 설정
- [ ] 작업 중 `isLoading=true`, 완료 후 `false`

---

## Phase 5 — 컨테이너

### `src/client/components/board/BoardHeader.tsx`

```typescript
interface BoardHeaderProps {
  onCreateClick: () => void;
}
```

**의존**: Button
**테스트 파일**: `__tests__/components/board/BoardHeader.test.tsx`

**TDD 체크리스트**:
- [ ] "새 업무" 버튼 렌더링
- [ ] "새 업무" 버튼 클릭 → `onCreateClick` 호출
- [ ] Search 플레이스홀더 렌더링 (disabled 상태)
- [ ] Search 입력 비활성화 (`cursor-not-allowed`)

---

### `src/client/components/board/FilterBar.tsx`

```typescript
type ActiveFilter = 'all' | 'thisWeek' | 'overdue';
interface FilterBarProps {
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
  counts: { thisWeek: number; overdue: number };
}
```

**테스트 파일**: `__tests__/components/board/FilterBar.test.tsx`

**TDD 체크리스트**:
- [ ] "이번주 업무" 탭 렌더링 + thisWeek 카운트 뱃지
- [ ] "일정 초과" 탭 렌더링 + overdue 카운트 뱃지
- [ ] `activeFilter="thisWeek"` → 이번주 탭에 `.filter-tab--active`
- [ ] `activeFilter="overdue"` → 일정초과 탭에 `.filter-tab--active`
- [ ] `activeFilter="all"` → 두 탭 모두 비활성
- [ ] 활성 필터 탭 재클릭 → `onFilterChange("all")` 호출 (토글 해제)
- [ ] 비활성 탭 클릭 → `onFilterChange(해당값)` 호출
- [ ] `counts.thisWeek=0` → 카운트 뱃지 미표시

---

### `src/client/components/board/BoardContainer.tsx`

```typescript
interface BoardContainerProps {
  initialData: BoardData;
}
```

**의존**: Board, BoardHeader, FilterBar, TicketModal, useTickets
**역할**: 필터 상태, 모달 제어, CRUD + DnD 핸들링
**테스트 파일**: `__tests__/components/board/BoardContainer.test.tsx`

**TDD 체크리스트**:
- [ ] 초기 보드 데이터로 Board 렌더링
- [ ] "새 업무" 클릭 → TicketForm 생성 모달 열림
- [ ] TicketForm 제출 → `useTickets.create` 호출
- [ ] TicketForm 취소 → 모달 닫힘
- [ ] 카드 클릭 → TicketModal 열림 (해당 티켓 전달)
- [ ] `activeFilter="thisWeek"` → TODO/IN_PROGRESS에서 이번주 dueDate 티켓만 표시
- [ ] `activeFilter="overdue"` → `isOverdue=true` 티켓만 표시 (Backlog 제외)
- [ ] `activeFilter="all"` → 전체 표시
- [ ] 이번주 필터 — Backlog는 필터 무관 항상 전체 표시
- [ ] DnD → Done 칼럼으로 → `useTickets.complete` 호출
- [ ] DnD → Done 외 칼럼으로 → `useTickets.reorder` 호출
- [ ] API 실패 시 에러 표시

---

### `app/(board)/page.tsx`

```typescript
// 서버 컴포넌트 — 초기 보드 데이터 SSR 로드
export default async function BoardPage()
```

**체크리스트**:
- [ ] 서버에서 `ticketService.getBoard()` 호출 → BoardData
- [ ] API 실패 시 에러 표시 또는 빈 보드로 폴백
- [ ] `BoardContainer`에 `initialData` prop 전달
- [ ] 페이지 `<title>` 설정 ("Tika")

---

## 테스트 파일 목록

```
__tests__/
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx           ✅ Phase 1
│   │   ├── Badge.test.tsx            ✅ Phase 1
│   │   ├── Modal.test.tsx            ✅ Phase 1
│   │   └── ConfirmDialog.test.tsx    ✅ Phase 1
│   ├── ticket/
│   │   ├── TicketCard.test.tsx       🔲 Phase 2
│   │   ├── TicketDetailView.test.tsx 🔲 Phase 3
│   │   ├── TicketForm.test.tsx       🔲 Phase 3
│   │   └── TicketModal.test.tsx      🔲 Phase 3
│   └── board/
│       ├── ColumnHeader.test.tsx     🔲 Phase 2
│       ├── Column.test.tsx           🔲 Phase 2
│       ├── Board.test.tsx            🔲 Phase 2
│       ├── BoardHeader.test.tsx      🔲 Phase 5
│       ├── FilterBar.test.tsx        🔲 Phase 5
│       └── BoardContainer.test.tsx   🔲 Phase 5
├── api/
│   └── ticketApi.test.ts             🔲 Phase 4
└── hooks/
    └── useTickets.test.ts            🔲 Phase 4
```
