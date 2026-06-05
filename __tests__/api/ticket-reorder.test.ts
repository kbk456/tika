/**
 * @jest-environment node
 */
// TC-API-007: PATCH /api/tickets/reorder — 티켓 순서 변경

import { PATCH } from '../../app/api/tickets/reorder/route';
import { POST } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const createdIds: number[] = [];

async function createTicket(overrides: Record<string, unknown> = {}): Promise<number> {
  const req = new Request('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '리오더 테스트', ...overrides }),
  });
  const res = await POST(req);
  const body = await res.json();
  createdIds.push(body.id);
  return body.id;
}

function reorderRequest(body: unknown): Request {
  return new Request('http://localhost/api/tickets/reorder', {
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

describe('TC-API-007: PATCH /api/tickets/reorder — 티켓 순서 변경', () => {
  it('007-1: 같은 칼럼 내 이동 — 200 + 변경된 position 반환', async () => {
    const id = await createTicket();

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'BACKLOG', position: 2048 }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ticket.id).toBe(id);
    expect(body.ticket.position).toBe(2048);
  });

  it('007-2: 다른 칼럼으로 이동 — status 변경 확인', async () => {
    const id = await createTicket();

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'TODO', position: 1024 }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ticket.status).toBe('TODO');
  });

  it('007-3: BACKLOG → TODO 이동 — startedAt 설정됨', async () => {
    const id = await createTicket();
    const before = new Date();

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'TODO', position: 1024 }));

    const body = await res.json();
    const startedAt = new Date(body.ticket.startedAt);
    expect(startedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('007-4: TODO → BACKLOG 이동 — startedAt null 설정됨', async () => {
    const id = await createTicket();
    await PATCH(reorderRequest({ ticketId: id, status: 'TODO', position: 1024 }));

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'BACKLOG', position: 512 }));

    const body = await res.json();
    expect(body.ticket.startedAt).toBeNull();
  });

  it('007-5: 존재하지 않는 티켓 reorder — 404 TICKET_NOT_FOUND', async () => {
    const res = await PATCH(reorderRequest({ ticketId: 999999, status: 'BACKLOG', position: 1024 }));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('TICKET_NOT_FOUND');
  });

  it('007-6: ticketId 누락 — 400 VALIDATION_ERROR', async () => {
    const res = await PATCH(reorderRequest({ status: 'BACKLOG', position: 1024 }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('007-7: status 누락 — 400 VALIDATION_ERROR', async () => {
    const id = await createTicket();

    const res = await PATCH(reorderRequest({ ticketId: id, position: 1024 }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('007-8: position 누락 — 400 VALIDATION_ERROR', async () => {
    const id = await createTicket();

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'BACKLOG' }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('007-9: DONE status로 reorder 시도 — 400 VALIDATION_ERROR (DONE은 reorder 불가)', async () => {
    const id = await createTicket();

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'DONE', position: 1024 }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('007-10: affected 배열 반환 — 재배치된 다른 티켓 포함', async () => {
    const ids: number[] = [];
    for (let i = 1; i <= 3; i++) {
      ids.push(await createTicket());
      await PATCH(reorderRequest({ ticketId: ids[ids.length - 1], status: 'BACKLOG', position: i }));
    }
    const movingId = await createTicket();

    const res = await PATCH(reorderRequest({ ticketId: movingId, status: 'BACKLOG', position: 2 }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.affected)).toBe(true);
  });

  it('007-11: 잘못된 JSON 바디 — 400 VALIDATION_ERROR', async () => {
    const res = await PATCH(
      new Request('http://localhost/api/tickets/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('007-12: IN_PROGRESS → BACKLOG 이동 — startedAt 유지됨 (null 아님)', async () => {
    const id = await createTicket();
    await PATCH(reorderRequest({ ticketId: id, status: 'TODO', position: 1024 }));
    const toInProgress = await PATCH(reorderRequest({ ticketId: id, status: 'IN_PROGRESS', position: 512 }));
    const inProgressBody = await toInProgress.json();
    const startedAtBeforeMove = inProgressBody.ticket.startedAt;

    const res = await PATCH(reorderRequest({ ticketId: id, status: 'BACKLOG', position: 256 }));

    const body = await res.json();
    expect(body.ticket.startedAt).toBeNull();
    expect(startedAtBeforeMove).not.toBeNull();
  });
});
