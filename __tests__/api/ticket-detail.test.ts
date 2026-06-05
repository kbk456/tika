/**
 * @jest-environment node
 */
// TC-API-003: GET /api/tickets/:id — 티켓 단건 조회

import { GET } from '../../app/api/tickets/[id]/route';
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const createdIds: number[] = [];

async function createTicket(title = '테스트 티켓'): Promise<number> {
  const req = new Request('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const res = await POST(req);
  const body = await res.json();
  createdIds.push(body.id);
  return body.id;
}

afterEach(async () => {
  for (const id of createdIds) {
    await sql`DELETE FROM tickets WHERE id = ${id}`;
  }
  createdIds.length = 0;
});

afterAll(async () => {
  await sql.end();
});

describe('TC-API-003: GET /api/tickets/:id — 티켓 단건 조회', () => {
  it('003-1: 존재하는 티켓 조회 — 200 + 티켓 반환', async () => {
    const id = await createTicket('조회 테스트');

    const res = await GET(
      new Request(`http://localhost/api/tickets/${id}`),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(id);
    expect(body.title).toBe('조회 테스트');
    expect(typeof body.isOverdue).toBe('boolean');
  });

  it('003-2: 존재하지 않는 티켓 조회 — 404 TICKET_NOT_FOUND', async () => {
    const res = await GET(
      new Request('http://localhost/api/tickets/999999'),
      { params: Promise.resolve({ id: '999999' }) }
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('TICKET_NOT_FOUND');
    expect(body.error.message).toBe('티켓을 찾을 수 없습니다');
  });

  it('003-3: 유효하지 않은 ID — 400 VALIDATION_ERROR', async () => {
    const res = await GET(
      new Request('http://localhost/api/tickets/abc'),
      { params: Promise.resolve({ id: 'abc' }) }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('003-4: 응답에 isOverdue 필드 포함', async () => {
    const id = await createTicket('isOverdue 확인');

    const res = await GET(
      new Request(`http://localhost/api/tickets/${id}`),
      { params: Promise.resolve({ id: String(id) }) }
    );

    const body = await res.json();
    expect('isOverdue' in body).toBe(true);
    expect(typeof body.isOverdue).toBe('boolean');
  });
});
