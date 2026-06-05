/**
 * @jest-environment node
 */
// TC-API-006: DELETE /api/tickets/:id — 티켓 삭제

import { DELETE, GET } from '../../app/api/tickets/[id]/route';
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const createdIds: number[] = [];

async function createTicket(): Promise<number> {
  const req = new Request('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '삭제 테스트' }),
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

describe('TC-API-006: DELETE /api/tickets/:id — 티켓 삭제', () => {
  it('006-1: 티켓 삭제 — 204 No Content', async () => {
    const id = await createTicket();

    const res = await DELETE(
      new Request(`http://localhost/api/tickets/${id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(204);

    const getRes = await GET(
      new Request(`http://localhost/api/tickets/${id}`),
      { params: Promise.resolve({ id: String(id) }) }
    );
    expect(getRes.status).toBe(404);

    createdIds.pop();
  });

  it('006-2: 존재하지 않는 티켓 삭제 — 404 TICKET_NOT_FOUND', async () => {
    const res = await DELETE(
      new Request('http://localhost/api/tickets/999999', { method: 'DELETE' }),
      { params: Promise.resolve({ id: '999999' }) }
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('TICKET_NOT_FOUND');
    expect(body.error.message).toBe('티켓을 찾을 수 없습니다');
  });
});
