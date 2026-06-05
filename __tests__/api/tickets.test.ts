/**
 * @jest-environment node
 */
// TC-API-001: POST /api/tickets — 티켓 생성
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const createdIds: number[] = [];

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

afterAll(async () => {
  await sql.end();
});

afterEach(async () => {
  for (const id of createdIds) {
    await sql`DELETE FROM tickets WHERE id = ${id}`;
  }
  createdIds.length = 0;
});

describe('TC-API-001: POST /api/tickets — 티켓 생성', () => {
  describe('201 Created', () => {
    it('001-1: 필수 필드만으로 생성 — status=BACKLOG, priority=MEDIUM', async () => {
      const res = await POST(makePostRequest({ title: '테스트 할일' }));
      const body = await res.json();
      createdIds.push(body.id);

      expect(res.status).toBe(201);
      expect(body.status).toBe('BACKLOG');
      expect(body.priority).toBe('MEDIUM');
    });

    it('001-2: 전체 필드로 생성 — 모든 필드 반영', async () => {
      const res = await POST(
        makePostRequest({
          title: 'API 설계 문서 작성',
          description: 'REST API 엔드포인트와 요청/응답 형식을 정의한다',
          priority: 'HIGH',
          plannedStartDate: '2026-06-10',
          dueDate: '2026-06-20',
        })
      );
      const body = await res.json();
      createdIds.push(body.id);

      expect(res.status).toBe(201);
      expect(body.title).toBe('API 설계 문서 작성');
      expect(body.description).toBe('REST API 엔드포인트와 요청/응답 형식을 정의한다');
      expect(body.status).toBe('BACKLOG');
      expect(body.priority).toBe('HIGH');
      expect(body.plannedStartDate).toBe('2026-06-10');
      expect(body.dueDate).toBe('2026-06-20');
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('001-10: position 자동 할당 — 나중에 생성된 티켓이 더 작은 position', async () => {
      const res1 = await POST(makePostRequest({ title: '첫 번째 티켓' }));
      const body1 = await res1.json();
      createdIds.push(body1.id);

      const res2 = await POST(makePostRequest({ title: '두 번째 티켓' }));
      const body2 = await res2.json();
      createdIds.push(body2.id);

      expect(res2.status).toBe(201);
      expect(body2.position).toBeLessThan(body1.position);
    });

    it('001-11: startedAt / completedAt 초기값 — null', async () => {
      const res = await POST(makePostRequest({ title: '초기값 확인' }));
      const body = await res.json();
      createdIds.push(body.id);

      expect(res.status).toBe(201);
      expect(body.startedAt).toBeNull();
      expect(body.completedAt).toBeNull();
    });
  });

  describe('400 Bad Request', () => {
    it('001-3: 제목 누락 → 400 + "제목을 입력해주세요"', async () => {
      const res = await POST(makePostRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });

    it('001-4: 빈 제목 → 400 + "제목을 입력해주세요"', async () => {
      const res = await POST(makePostRequest({ title: '' }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });

    it('001-5: 공백만 있는 제목 → 400 + "제목을 입력해주세요"', async () => {
      const res = await POST(makePostRequest({ title: '   ' }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });

    it('001-6: 제목 200자 초과 → 400 + "제목은 200자 이내로 입력해주세요"', async () => {
      const res = await POST(makePostRequest({ title: 'a'.repeat(201) }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목은 200자 이내로 입력해주세요');
    });

    it('001-7: 설명 1000자 초과 → 400 + "설명은 1000자 이내로 입력해주세요"', async () => {
      const res = await POST(makePostRequest({ title: '유효한 제목', description: 'a'.repeat(1001) }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('설명은 1000자 이내로 입력해주세요');
    });

    it('001-8: 잘못된 우선순위 → 400 + "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"', async () => {
      const res = await POST(makePostRequest({ title: '유효한 제목', priority: 'URGENT' }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요');
    });

    it('001-9: 과거 종료예정일 → 400 + "종료예정일은 오늘 이후 날짜를 선택해주세요"', async () => {
      const res = await POST(makePostRequest({ title: '유효한 제목', dueDate: '2020-01-01' }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('종료예정일은 오늘 이후 날짜를 선택해주세요');
    });
  });
});
