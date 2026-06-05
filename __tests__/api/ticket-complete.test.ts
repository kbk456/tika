/**
 * @jest-environment node
 */
// TC-API-005: PATCH /api/tickets/:id/complete — 티켓 완료 처리

import { PATCH } from '../../app/api/tickets/[id]/complete/route';
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const createdIds: number[] = [];

async function createTicket(overrides: Record<string, unknown> = {}): Promise<number> {
  const req = new Request('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '완료 테스트', ...overrides }),
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

describe('TC-API-005: PATCH /api/tickets/:id/complete — 티켓 완료 처리', () => {
  it('005-1: 티켓 완료 — 200 + status=DONE', async () => {
    const id = await createTicket();

    const res = await PATCH(
      new Request(`http://localhost/api/tickets/${id}/complete`, { method: 'PATCH' }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('DONE');
  });

  it('005-2: completedAt 설정 — 현재 시각으로 설정됨', async () => {
    const id = await createTicket();
    const before = new Date();

    const res = await PATCH(
      new Request(`http://localhost/api/tickets/${id}/complete`, { method: 'PATCH' }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    const body = await res.json();
    const completedAt = new Date(body.completedAt);
    expect(completedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(completedAt.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('005-3: 존재하지 않는 티켓 완료 — 404 TICKET_NOT_FOUND', async () => {
    const res = await PATCH(
      new Request('http://localhost/api/tickets/999999/complete', { method: 'PATCH' }),
      { params: Promise.resolve({ id: '999999' }) }
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('TICKET_NOT_FOUND');
    expect(body.error.message).toBe('티켓을 찾을 수 없습니다');
  });

  it('005-4: 유효하지 않은 ID — 400 VALIDATION_ERROR', async () => {
    const res = await PATCH(
      new Request('http://localhost/api/tickets/abc/complete', { method: 'PATCH' }),
      { params: Promise.resolve({ id: 'abc' }) }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('005-5: DONE 칼럼 내 가장 상단에 배치 — position < 기존 DONE 최소 position', async () => {
    const firstId = await createTicket();
    await PATCH(
      new Request(`http://localhost/api/tickets/${firstId}/complete`, { method: 'PATCH' }),
      { params: Promise.resolve({ id: String(firstId) }) }
    );
    const firstRes = await PATCH(
      new Request(`http://localhost/api/tickets/${firstId}/complete`, { method: 'PATCH' }),
      { params: Promise.resolve({ id: String(firstId) }) }
    );
    const firstPos = (await firstRes.json()).position;

    const secondId = await createTicket();
    const secondRes = await PATCH(
      new Request(`http://localhost/api/tickets/${secondId}/complete`, { method: 'PATCH' }),
      { params: Promise.resolve({ id: String(secondId) }) }
    );
    const secondPos = (await secondRes.json()).position;

    expect(secondPos).toBeLessThan(firstPos);
  });
});
