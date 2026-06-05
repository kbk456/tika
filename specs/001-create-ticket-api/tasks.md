# 태스크: POST /api/tickets 티켓 생성

**입력**: `/specs/001-create-ticket-api/` 의 설계 문서

**전제 조건**: plan.md (필수), spec.md (사용자 시나리오), research.md, data-model.md, contracts/

**테스트**: TDD 원칙(원칙 VI) 적용 — 누락 테스트 먼저 작성, 구현 후 통과 확인

**구성**: 사용자 스토리별 그룹화 → 독립적 구현 및 검증 가능

## 형식: `[ID] [P?] [Story?] 설명 파일경로`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 해당 사용자 스토리 (US1, US2, US3)
- 설명에 정확한 파일 경로 포함

---

## Phase 1: 셋업

**목적**: 프로젝트 초기화 및 기본 구조 설정

> DB 스키마, 공유 타입, Zod 스키마, 서비스 골격, Route Handler 골격이 이미 완성되어
> 별도 셋업 태스크 없음. Phase 2 기반 수정부터 시작.

---

## Phase 2: 기반 수정 (모든 사용자 스토리 의존)

**목적**: 명세와 불일치하는 버그 수정 및 누락 에러 처리 추가

**⚠️ 중요**: 이 Phase 완료 전까지 US1/US2 성공 케이스 테스트가 실패함

- [ ] T001 `src/server/services/ticketService.ts` 14번째 줄 position 버그 수정 — BACKLOG 빈 경우 반환값 `0` → `-1024`
- [ ] T002 `app/api/tickets/route.ts` JSON parse 오류 처리 추가 — `request.json()` try/catch로 감싸고 실패 시 400 VALIDATION_ERROR 반환
- [ ] T003 `app/api/tickets/route.ts` 서비스 오류 처리 추가 — `ticketService.create()` try/catch로 감싸고 실패 시 500 INTERNAL_ERROR 반환

**체크포인트**: T001~T003 완료 후 기존 테스트 실행 — `npm test` 로 통과 확인

---

## Phase 3: 사용자 스토리 1 — 기본 티켓 생성 (P1) 🎯 MVP

**목표**: 제목만으로 티켓을 생성하면 BACKLOG 맨 위에 배치된다

**독립 검증**: `npm test -- --testNamePattern="201 Created"` 실행 후 status=BACKLOG, priority=MEDIUM, position=-1024 확인

### US1 테스트 (TDD — 구현 전 작성)

- [ ] T004 [US1] `__tests__/api/tickets.test.ts` afterEach 정리 로직 구현 — `createdIds` 배열로 생성된 티켓 ID 추적 후 `DELETE FROM tickets WHERE id = ANY(...)` 실행
- [ ] T005 [US1] `__tests__/api/tickets.test.ts` position 순서 검증 케이스 추가 (TC-001-10) — 연속 2개 생성 후 두 번째 position < 첫 번째 position 단언

### US1 구현 검증

- [ ] T006 [US1] `npm test -- --testNamePattern="201 Created"` 실행 — 모든 US1 케이스 통과 확인 (Phase 2 수정 결과 반영)

**체크포인트**: T004~T006 완료 — US1 독립적으로 테스트 가능하고 통과됨

---

## Phase 4: 사용자 스토리 2 — 선택 필드 포함 티켓 생성 (P2)

**목표**: description, priority, plannedStartDate, dueDate를 포함한 티켓 생성이 응답에 정확히 반영된다

**독립 검증**: `npm test -- --testNamePattern="모든 필드를 포함한 정상 생성"` 실행 — 전체 필드 반영 확인

### US2 구현 검증

- [ ] T007 [US2] `npm test -- --testNamePattern="모든 필드를 포함한 정상 생성"` 실행 — priority=HIGH, plannedStartDate, dueDate 응답 반영 확인 (Phase 2 수정으로 통과되어야 함)

**체크포인트**: T007 완료 — US2 테스트 통과 (기존 테스트가 모든 선택 필드 시나리오 커버)

---

## Phase 5: 사용자 스토리 3 — 유효성 검증 실패 처리 (P3)

**목표**: 6가지 잘못된 입력 모두에서 명세의 정확한 에러 메시지가 반환된다

**독립 검증**: `npm test -- --testNamePattern="400 Bad Request"` 실행 — 6개 케이스 전부 통과 확인

### US3 테스트 (TDD — 구현 전 작성)

- [ ] T008 [P] [US3] `__tests__/api/tickets.test.ts` 공백만 있는 제목 검증 케이스 추가 (TC-001-5) — `{ title: "   " }` → 400 + "제목을 입력해주세요"
- [ ] T009 [P] [US3] `__tests__/api/tickets.test.ts` 설명 1000자 초과 검증 케이스 추가 (TC-001-7) — `{ title: "ok", description: "a".repeat(1001) }` → 400 + "설명은 1000자 이내로 입력해주세요"

### US3 구현 검증

- [ ] T010 [US3] `npm test -- --testNamePattern="400 Bad Request"` 실행 — 6가지 에러 케이스 전부 통과 확인

**체크포인트**: T008~T010 완료 — US3 독립적으로 테스트 가능하고 통과됨

---

## Phase 6: 마무리 및 품질 검증

**목적**: 전체 스위트 통과 및 타입 안전성 확인

- [ ] T011 `npx tsc --noEmit` 실행 — TypeScript 타입 체크 통과 확인 (원칙 II)
- [ ] T012 `npm test` 전체 실행 — TC-API-001 (001-1 ~ 001-11) 모든 케이스 통과 확인
- [ ] T013 [P] `quickstart.md` 수동 검증 시나리오 실행 — `curl`로 201 응답 + position=-1024 직접 확인

---

## 의존성 및 실행 순서

### Phase 의존성

- **Phase 2 (기반 수정)**: 의존성 없음 — 즉시 시작 가능, 모든 US Phase 블록
- **Phase 3 (US1)**: Phase 2 완료 필요
- **Phase 4 (US2)**: Phase 2 완료 필요 (US1과 병렬 가능)
- **Phase 5 (US3)**: Phase 2 완료 필요 (US1/US2와 병렬 가능)
- **Phase 6 (마무리)**: 모든 US Phase 완료 후 실행

### 사용자 스토리 의존성

- **US1 (P1)**: Phase 2 완료 후 시작 가능 — 다른 스토리와 독립
- **US2 (P2)**: Phase 2 완료 후 시작 가능 — US1과 독립 (같은 파일 수정 없음)
- **US3 (P3)**: Phase 2 완료 후 시작 가능 — US1/US2와 독립 (`tickets.test.ts` 수정은 서로 다른 describe 블록)

### 태스크 내부 순서

- T004 (afterEach) → T005 (position 테스트) → T006 (US1 검증)
- T008, T009는 [P] — 동시에 작성 가능 (같은 `describe('400')` 블록 내 다른 it)

### 병렬 실행 기회

```bash
# Phase 2 내 T002, T003은 같은 파일이므로 순차 실행
T001 → 완료 후 T002 → T003

# Phase 3, 4, 5는 Phase 2 완료 후 병렬 가능
Phase 3 (US1): T004, T005, T006
Phase 4 (US2): T007          ← Phase 3와 병렬 가능
Phase 5 (US3): T008 [P], T009 [P], T010  ← Phase 3/4와 병렬 가능
```

---

## 구현 전략

### MVP 우선 (US1만)

1. Phase 2 완료 (T001~T003)
2. Phase 3 완료 (T004~T006)
3. **멈추고 검증**: `npm test -- --testNamePattern="201 Created"` 통과 확인
4. 필요 시 배포/데모

### 점진적 완성

1. Phase 2 → 기반 준비
2. Phase 3 (US1) → 검증 → MVP
3. Phase 4 (US2) → 검증
4. Phase 5 (US3) → 검증
5. Phase 6 → 최종 품질 확인

---

## 비고

- `[P]` 태스크 = 다른 파일 또는 독립적인 코드 블록, 의존성 없음
- `[US*]` 레이블은 태스크를 사용자 스토리에 매핑하여 추적 가능성 제공
- 테스트 실패 확인 후 구현 (Red → Green → Refactor)
- 각 Phase 체크포인트에서 스토리 독립 검증 수행
