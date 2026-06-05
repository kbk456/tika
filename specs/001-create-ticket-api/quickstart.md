# Quickstart: POST /api/tickets 검증 가이드

## 전제 조건

```bash
# 환경 변수 설정 (.env.local)
DATABASE_URL=postgresql://localhost:5432/tika_dev

# DB 마이그레이션 적용
npm run db:migrate

# 개발 서버 시작 (수동 검증 시)
npm run dev
```

---

## 자동화 테스트 실행

```bash
# 전체 테스트
npm test

# POST /api/tickets 테스트만
npm test -- --testPathPattern="tickets"

# 커버리지 포함
npm run test:coverage
```

**기대 결과**: `__tests__/api/tickets.test.ts` 의 모든 케이스 통과

---

## 수동 검증 시나리오

### 시나리오 1: 최소 생성 (제목만)

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "테스트 할일"}'
```

**기대 응답** (201):
```json
{
  "status": "BACKLOG",
  "priority": "MEDIUM",
  "position": -1024,
  "startedAt": null,
  "completedAt": null
}
```

---

### 시나리오 2: 전체 필드 생성

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API 설계 문서 작성",
    "description": "설명",
    "priority": "HIGH",
    "plannedStartDate": "2026-06-10",
    "dueDate": "2026-06-20"
  }'
```

**기대 응답** (201): 입력값 그대로 반영

---

### 시나리오 3: position 누적 검증

두 번 연속 생성 후 position 확인:
1. 첫 번째 생성 → `position = -1024`
2. 두 번째 생성 → `position = -2048` (항상 더 작은 값)

---

### 시나리오 4: 검증 오류 (400)

```bash
# 제목 누락
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{}'
# → 400: "제목을 입력해주세요"

# 과거 날짜
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "ok", "dueDate": "2020-01-01"}'
# → 400: "종료예정일은 오늘 이후 날짜를 선택해주세요"
```

---

## 검증 체크리스트

- [x] 201 응답 + 전체 필드 반환 (id, position, createdAt, updatedAt 포함)
- [x] BACKLOG 빈 상태에서 첫 티켓 position = -1024
- [x] 두 번째 티켓 position < 첫 번째 티켓 position
- [x] priority 미입력 시 MEDIUM
- [x] startedAt, completedAt = null
- [x] 6가지 검증 오류 모두 400 + 정확한 에러 메시지
- [x] TypeScript 타입 체크: `npx tsc --noEmit`
