# Tika - 프런트엔드 구현 계획 (FRONTEND_TASKS.md)

> 기반 문서: COMPONENT_SPEC.md, TEST_CASES.md, REQUIREMENTS.md
> 구현 순서: Bottom-up (말단 → 컨테이너)
> 테스트: Jest + React Testing Library (TDD)

---

## 의존성 그래프

```
app/(board)/page.tsx  ←  app/(board)/layout.tsx
        │
        ▼
BoardContainer.tsx
  ├── useTickets.ts  ←  ticketApi.ts
  ├── BoardHeader.tsx  ←  Button.tsx
  ├── FilterBar.tsx    ←  (filter-tab CSS)
  ├── Board.tsx  (@dnd-kit/core + DragOverlay)
  │     ├── Column.tsx  (@dnd-kit/sortable · useDroppable)
  │     │     └── TicketCard.tsx
  │     │           └── Badge.tsx
  │     └── TicketCard.tsx  (DragOverlay 복제본)
  └── TicketModal.tsx
        ├── Modal.tsx
        ├── TicketForm.tsx  ←  Button.tsx
        │                  ←  Zod (src/shared/validations/ticket.ts)
        └── ConfirmDialog.tsx
              ├── Modal.tsx
              └── Button.tsx
```

---

## Phase 구성 요약

| Phase | 내용 | 파일 수 |
|-------|------|---------|
| Phase 1 | 기본 컴포넌트 (Badge · Button · Modal) | 3 |
| Phase 2 | 폼 & 다이얼로그 (TicketForm · ConfirmDialog) | 2 |
| Phase 3 | 카드 (TicketCard) | 1 |
| Phase 4 | 데이터 레이어 (ticketApi · useTickets) | 2 |
| Phase 5 | Column · TicketModal · BoardHeader · FilterBar | 4 |
| Phase 6 | Board · BoardContainer | 2 |
| Phase 7 | 페이지 통합 (page · layout) | 2 |

---

## Phase 1 — 기본 컴포넌트

### `src/client/components/ui/Badge.tsx`

**Props**:
```typescript
type BadgeVariant = 'low' | 'medium' | 'high' | 'due' | 'overdue';
interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/ui/Badge.test.tsx`
> TC 참조: TC-COMP-001 (C001-7)

- [ ] `variant="low"` → `.badge--low` 클래스 + 회색 텍스트 색상
- [ ] `variant="medium"` → `.badge--medium` 클래스 + 파란색
- [ ] `variant="high"` → `.badge--high` 클래스 + 빨간색
- [ ] `variant="due"` → `.badge--due` 클래스 (종료예정일용)
- [ ] `variant="overdue"` → `.badge--overdue` 클래스 (강조 빨간)
- [ ] children 텍스트 렌더링

---

### `src/client/components/ui/Button.tsx`

**Props**:
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;   // 기본: 'primary'
  size?: ButtonSize;         // 기본: 'md'
  isLoading?: boolean;
  children: React.ReactNode;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/ui/Button.test.tsx`

- [ ] `variant="primary"` → `.btn--primary` 클래스 적용
- [ ] `variant="secondary"` → `.btn--secondary` 클래스 적용
- [ ] `variant="danger"` → `.btn--danger` 클래스 적용
- [ ] `variant="ghost"` → `.btn--ghost` 클래스 적용
- [ ] `size="sm/md/lg"` → 각각 `.btn--sm/md/lg` 클래스 적용
- [ ] `isLoading=true` → disabled 속성 + 스피너 렌더링
- [ ] `disabled` → 버튼 비활성화 + 클릭 이벤트 차단
- [ ] `onClick` 핸들러 정상 호출

---

### `src/client/components/ui/Modal.tsx`

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/ui/Modal.test.tsx`
> TC 참조: TC-COMP-005 (C005-1, C005-4, C005-5)

- [ ] `isOpen=false` → 렌더링 없음 (null 반환)
- [ ] `isOpen=true` → `.modal-overlay` + `.modal-container` 렌더링
- [ ] 오버레이 클릭 → `onClose` 호출
- [ ] 컨테이너 내부 클릭 → `onClose` 미호출 (이벤트 버블 차단)
- [ ] ESC 키 입력 → `onClose` 호출
- [ ] `isOpen=true` 시 `document.body` 스크롤 잠금 (`overflow: hidden`)
- [ ] 언마운트 시 스크롤 잠금 해제

---

## Phase 2 — 폼 & 다이얼로그

### `src/client/components/ui/ConfirmDialog.tsx`

**Props**:
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/ui/ConfirmDialog.test.tsx`
> TC 참조: TC-COMP-006 (C006-1, C006-2)

- [ ] `isOpen=false` → 렌더링 없음
- [ ] `isOpen=true` → message 텍스트 표시
- [ ] 확인 버튼 클릭 → `onConfirm` 호출
- [ ] 취소 버튼 클릭 → `onCancel` 호출
- [ ] 확인 버튼 → `.btn--danger` 스타일 (빨간색)
- [ ] `isLoading=true` → 확인 버튼 비활성화

---

### `src/client/components/ticket/TicketForm.tsx`

**Props**:
```typescript
interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/ticket/TicketForm.test.tsx`
> TC 참조: TC-COMP-004 (C004-1 ~ C004-7)

- [ ] `mode="create"` → 빈 폼, 우선순위 MEDIUM 기본 선택
- [ ] `mode="edit"` + `initialData` → 각 필드에 기존 값 반영
- [ ] 필드 목록 렌더링: title, description, priority(select), plannedStartDate, dueDate
- [ ] 빈 제목으로 제출 → "제목을 입력해주세요" 에러 인라인 표시
- [ ] 공백만인 제목으로 제출 → "제목을 입력해주세요" 에러
- [ ] 200자 초과 제목 → "제목은 200자 이내로 입력해주세요"
- [ ] 1000자 초과 설명 → "설명은 1000자 이내로 입력해주세요"
- [ ] 과거 종료예정일 → "종료예정일은 오늘 이후 날짜를 선택해주세요"
- [ ] 유효한 데이터 제출 → `onSubmit` 호출 + 올바른 데이터 전달
- [ ] `isLoading=true` → 제출 버튼 비활성화 + 스피너
- [ ] 취소 버튼 클릭 → `onCancel` 호출

---

## Phase 3 — 카드

### `src/client/components/board/TicketCard.tsx`

**Props**:
```typescript
interface TicketCardProps {
  ticket: TicketWithOverdue;
  onClick: () => void;
  isDragging?: boolean;  // DragOverlay에서 사용
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/board/TicketCard.test.tsx`
> TC 참조: TC-COMP-001 (C001-1 ~ C001-7)

- [ ] 제목 렌더링
- [ ] 설명이 있을 때 설명 렌더링
- [ ] 우선순위 뱃지 렌더링 (Badge 컴포넌트 사용)
- [ ] `priority="LOW"` → Badge `variant="low"`
- [ ] `priority="MEDIUM"` → Badge `variant="medium"`
- [ ] `priority="HIGH"` → Badge `variant="high"`
- [ ] `dueDate` 있을 때 종료예정일 표시 (Badge `variant="due"`)
- [ ] `dueDate=null` → 종료예정일 미표시
- [ ] `isOverdue=true` → `.ticket-card--overdue` 클래스 + Badge `variant="overdue"`
- [ ] `isOverdue=false` → 오버듀 스타일 없음
- [ ] 카드 클릭 → `onClick` 호출
- [ ] `aria-label="티켓: {title}"` 접근성 속성
- [ ] `role="button"` 접근성 속성
- [ ] `isDragging=true` → `.ticket-card--dragging` 클래스 적용

---

## Phase 4 — 데이터 레이어

### `src/client/api/ticketApi.ts`

**역할**: 모든 API fetch 호출을 캡슐화. 컴포넌트에서 직접 fetch 금지.

**구현 함수**:
```
fetchBoard()          → GET  /api/tickets
createTicket(data)    → POST /api/tickets
getTicket(id)         → GET  /api/tickets/:id
updateTicket(id,data) → PATCH /api/tickets/:id
deleteTicket(id)      → DELETE /api/tickets/:id
completeTicket(id)    → PATCH /api/tickets/:id/complete
reorderTicket(data)   → PATCH /api/tickets/reorder
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/api/ticketApi.test.ts` (global fetch mock 사용)

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

**인터페이스** (COMPONENT_SPEC.md §4):
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

**TDD 체크리스트**:
> 테스트 파일: `__tests__/hooks/useTickets.test.ts`
> ticketApi 전체를 jest.mock으로 대체

- [ ] `initialData`로 초기 board 상태 설정
- [ ] `create` 호출 → 낙관적 업데이트로 BACKLOG 맨 앞에 추가
- [ ] `create` 성공 → board 최신 서버 데이터로 확정
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

## Phase 5 — Column · TicketModal · BoardHeader · FilterBar

### `src/client/components/board/Column.tsx`

**Props**:
```typescript
interface ColumnProps {
  status: TicketStatus;
  tickets: TicketWithOverdue[];
  onTicketClick: (ticket: TicketWithOverdue) => void;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/board/Column.test.tsx`
> TC 참조: TC-COMP-002 (C002-1 ~ C002-3)

- [ ] 칼럼 헤더에 칼럼명 표시 (BACKLOG→"Backlog", TODO→"Todo" 등)
- [ ] 칼럼 헤더에 티켓 수 뱃지 표시
- [ ] tickets 배열만큼 TicketCard 렌더링
- [ ] `tickets=[]` → "이 칼럼에 티켓이 없습니다" 안내 표시
- [ ] TicketCard 클릭 → `onTicketClick(ticket)` 호출

---

### `src/client/components/ticket/TicketModal.tsx`

**Props**:
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

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/ticket/TicketModal.test.tsx`
> TC 참조: TC-COMP-005 (C005-1 ~ C005-6)

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

### `src/client/components/board/BoardHeader.tsx`

**Props**:
```typescript
interface BoardHeaderProps {
  onCreateClick: () => void;
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/board/BoardHeader.test.tsx`

- [ ] "새 업무" 버튼 렌더링
- [ ] "새 업무" 버튼 클릭 → `onCreateClick` 호출
- [ ] Search 플레이스홀더 렌더링 (disabled 상태)
- [ ] Search 입력 비활성화 (`cursor-not-allowed`)

---

### `src/client/components/board/FilterBar.tsx`

**Props**:
```typescript
type ActiveFilter = 'all' | 'thisWeek' | 'overdue';
interface FilterBarProps {
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
  counts: { thisWeek: number; overdue: number };
}
```

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/board/FilterBar.test.tsx`

- [ ] "이번주 업무" 탭 렌더링 + thisWeek 카운트 뱃지
- [ ] "일정 초과" 탭 렌더링 + overdue 카운트 뱃지
- [ ] `activeFilter="thisWeek"` → 이번주 탭에 `.filter-tab--active`
- [ ] `activeFilter="overdue"` → 일정초과 탭에 `.filter-tab--active`
- [ ] `activeFilter="all"` → 두 탭 모두 비활성
- [ ] 활성 필터 탭 재클릭 → `onFilterChange("all")` 호출 (토글 해제)
- [ ] 비활성 탭 클릭 → `onFilterChange(해당값)` 호출
- [ ] `counts.thisWeek=0` → 카운트 뱃지 미표시

---

## Phase 6 — Board · BoardContainer

### `src/client/components/board/Board.tsx`

**Props**:
```typescript
interface BoardProps {
  board: BoardData;
  onTicketClick: (ticket: TicketWithOverdue) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeTicket: TicketWithOverdue | null;
}
```

**역할**: DndContext + DragOverlay 제공, Backlog 사이드바 + 3칼럼 그리드 배치

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/board/Board.test.tsx`
> TC 참조: TC-COMP-003 (C003-1 ~ C003-2), TC-INT-001
> DndContext는 `@dnd-kit/core` mock 처리

- [ ] BACKLOG Column이 사이드바(`.board-sidebar`)에 렌더링
- [ ] TODO / IN_PROGRESS / DONE Column이 메인 그리드(`.board-columns`)에 렌더링
- [ ] 4개 Column 모두 존재
- [ ] 각 Column에 올바른 `status` prop 전달
- [ ] `activeTicket` 있을 때 DragOverlay에 TicketCard 복제본 표시
- [ ] `onTicketClick` 이벤트 Column을 통해 전달

---

### `src/client/components/board/BoardContainer.tsx`

**Props**:
```typescript
interface BoardContainerProps {
  initialData: BoardData;
}
```

**역할**: `useTickets` Hook 연결, DnD 이벤트 핸들링, 필터 로직, 모달 상태 관리

**TDD 체크리스트**:
> 테스트 파일: `__tests__/components/board/BoardContainer.test.tsx`
> `useTickets` mock, `ticketApi` mock

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
- [ ] API 실패 시 에러 표시 (롤백은 Hook 책임)

---

## Phase 7 — 페이지 통합

### `app/(board)/layout.tsx`

```typescript
// 보드 레이아웃 — .app-layout 클래스 적용
export default function BoardLayout({ children }: { children: React.ReactNode })
```

**체크리스트**:
- [ ] `.app-layout` 클래스 적용 (height: 100vh, overflow: hidden)
- [ ] children 렌더링

---

### `app/(board)/page.tsx`

```typescript
// 서버 컴포넌트 — 초기 보드 데이터 SSR 로드
export default async function BoardPage()
```

**체크리스트**:
- [ ] 서버에서 `fetchBoard()` 호출 → BoardData 가져오기
- [ ] API 실패 시 에러 표시 또는 빈 보드로 폴백
- [ ] `BoardContainer`에 `initialData` prop 전달
- [ ] 페이지 `<title>` 설정 ("Tika")

---

## 구현 순서 요약

```
Phase 1  │ ticketApi.ts
         ↓
Phase 2  │ Badge → Button → Modal
         ↓
Phase 3  │ ConfirmDialog   TicketForm
         ↓
Phase 4  │ TicketCard      useTickets
         ↓
Phase 5  │ Column   TicketModal   BoardHeader   FilterBar
         ↓
Phase 6  │ Board → BoardContainer
         ↓
Phase 7  │ layout.tsx → page.tsx
```

---

## 테스트 파일 목록

```
__tests__/
├── api/
│   └── ticketApi.test.ts            (Phase 1)
├── components/
│   ├── ui/
│   │   ├── Badge.test.tsx           (Phase 2)
│   │   ├── Button.test.tsx          (Phase 2)
│   │   ├── Modal.test.tsx           (Phase 2)
│   │   └── ConfirmDialog.test.tsx   (Phase 3)
│   ├── ticket/
│   │   ├── TicketForm.test.tsx      (Phase 3)
│   │   └── TicketModal.test.tsx     (Phase 5)
│   └── board/
│       ├── TicketCard.test.tsx      (Phase 4)
│       ├── Column.test.tsx          (Phase 5)
│       ├── BoardHeader.test.tsx     (Phase 5)
│       ├── FilterBar.test.tsx       (Phase 5)
│       ├── Board.test.tsx           (Phase 6)
│       └── BoardContainer.test.tsx  (Phase 6)
└── hooks/
    └── useTickets.test.ts           (Phase 4)
```

---

## 주요 구현 규칙 (CLAUDE.md 기반)

- `src/client/`에서 `src/server/` import 금지 — API는 반드시 `ticketApi.ts` 경유
- `any` 타입 금지 — `TicketWithOverdue`, `BoardData` 등 `@/shared/types` 사용
- CSS 클래스는 `globals.css`에 정의된 BEM-like 클래스 사용 (`ticket-card`, `column`, `badge--high` 등)
- DnD 관련 로직은 `BoardContainer`에만 집중 — Column/TicketCard는 DnD-agnostic Props 수신
