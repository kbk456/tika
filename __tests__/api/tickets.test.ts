/**
 * @jest-environment node
 */
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

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
  // TODO: Green 단계에서 테스트 데이터 정리
});

describe('POST /api/tickets', () => {
  describe('201 Created', () => {
    it('모든 필드를 포함한 정상 생성', async () => {
      const req = makePostRequest({
        title: 'API 설계 문서 작성',
        description: 'REST API 엔드포인트와 요청/응답 형식을 정의한다',
        priority: 'HIGH',
        plannedStartDate: '2026-06-10',
        dueDate: '2026-06-20',
      });

      const res = await POST(req);

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.title).toBe('API 설계 문서 작성');
      expect(body.description).toBe('REST API 엔드포인트와 요청/응답 형식을 정의한다');
      expect(body.status).toBe('BACKLOG');
      expect(body.priority).toBe('HIGH');
      expect(body.plannedStartDate).toBe('2026-06-10');
      expect(body.dueDate).toBe('2026-06-20');
      expect(body.startedAt).toBeNull();
      expect(body.completedAt).toBeNull();
      expect(body.id).toBeDefined();
      expect(body.position).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('제목만으로 최소 생성 — priority 기본값 MEDIUM', async () => {
      const req = makePostRequest({ title: '테스트 할일' });

      const res = await POST(req);

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.status).toBe('BACKLOG');
      expect(body.priority).toBe('MEDIUM');
      expect(body.description).toBeNull();
      expect(body.startedAt).toBeNull();
      expect(body.completedAt).toBeNull();
    });
  });

  describe('400 Bad Request', () => {
    it('제목 누락 → 400', async () => {
      const req = makePostRequest({});

      const res = await POST(req);

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });

    it('제목 200자 초과 → 400', async () => {
      const req = makePostRequest({ title: 'a'.repeat(201) });

      const res = await POST(req);

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목은 200자 이내로 입력해주세요');
    });

    it('과거 마감일 → 400', async () => {
      const req = makePostRequest({ title: '유효한 제목', dueDate: '2020-01-01' });

      const res = await POST(req);

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('종료예정일은 오늘 이후 날짜를 선택해주세요');
    });

    it('잘못된 우선순위 값 → 400', async () => {
      const req = makePostRequest({ title: '유효한 제목', priority: 'URGENT' });

      const res = await POST(req);

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요');
    });
  });
});
