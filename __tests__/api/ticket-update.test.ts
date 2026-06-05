/**
 * @jest-environment node
 */
// TC-API-004: PATCH /api/tickets/:id — 티켓 수정

import { GET, PATCH } from '../../app/api/tickets/[id]/route';
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const createdIds: number[] = [];

async function createTicket(overrides: Record<string, unknown> = {}): Promise<number> {
  const req = new Request('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '수정 테스트', ...overrides }),
  });
  const res = await POST(req);
  const body = await res.json();
  createdIds.push(body.id);
  return body.id;
}

function patchRequest(id: number, body: unknown): Request {
  return new Request(`http://localhost/api/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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

describe('TC-API-004: PATCH /api/tickets/:id — 티켓 수정', () => {
  it('004-1: 제목 수정 — 200 + 변경된 title 반환', async () => {
    const id = await createTicket();

    const res = await PATCH(
      patchRequest(id, { title: '수정된 제목' }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('수정된 제목');
  });

  it('004-2: 우선순위 수정 — HIGH로 변경 확인', async () => {
    const id = await createTicket();

    const res = await PATCH(
      patchRequest(id, { priority: 'HIGH' }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.priority).toBe('HIGH');
  });

  it('004-3: description 수정 — null 허용', async () => {
    const id = await createTicket();

    const res = await PATCH(
      patchRequest(id, { description: null }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.description).toBeNull();
  });

  it('004-4: dueDate 수정 — null 허용', async () => {
    const id = await createTicket({ dueDate: '2026-12-31' });

    const res = await PATCH(
      patchRequest(id, { dueDate: null }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dueDate).toBeNull();
  });

  it('004-5: 존재하지 않는 티켓 수정 — 404 TICKET_NOT_FOUND', async () => {
    const res = await PATCH(
      patchRequest(999999, { title: '없는 티켓' }),
      { params: Promise.resolve({ id: '999999' }) }
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('TICKET_NOT_FOUND');
  });

  it('004-6: 유효하지 않은 ID — 400 VALIDATION_ERROR', async () => {
    const res = await PATCH(
      patchRequest(0, { title: '제목' }),
      { params: Promise.resolve({ id: 'invalid' }) }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('004-7: 잘못된 priority 값 — 400 VALIDATION_ERROR', async () => {
    const id = await createTicket();

    const res = await PATCH(
      patchRequest(id, { priority: 'SUPER_HIGH' }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('004-8: 빈 객체 수정 — 200, 기존 값 유지', async () => {
    const id = await createTicket();
    const getRes = await GET(
      new Request(`http://localhost/api/tickets/${id}`),
      { params: Promise.resolve({ id: String(id) }) }
    );
    const before = await getRes.json();

    const res = await PATCH(
      patchRequest(id, {}),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(200);
    const after = await res.json();
    expect(after.title).toBe(before.title);
    expect(after.priority).toBe(before.priority);
  });

  it('004-9: 잘못된 JSON 바디 — 400 VALIDATION_ERROR', async () => {
    const id = await createTicket();

    const res = await PATCH(
      new Request(`http://localhost/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
      { params: Promise.resolve({ id: String(id) }) }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
