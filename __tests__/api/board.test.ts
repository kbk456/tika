/**
 * @jest-environment node
 */
// TC-API-002: GET /api/tickets — 보드 조회
// TC-API-008: isOverdue 필드 계산

import { GET } from '../../app/api/tickets/route';
import { sql } from '../../src/server/db';

const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const TODAY = new Date().toISOString().split('T')[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const createdIds: number[] = [];

async function insertTicket(params: {
  title: string;
  status?: string;
  priority?: string;
  position?: number;
  dueDate?: string | null;
  completedAt?: Date | null;
  startedAt?: Date | null;
}): Promise<number> {
  const { title, status = 'BACKLOG', priority = 'MEDIUM', position = 0 } = params;
  const completedAt = params.completedAt ? params.completedAt.toISOString() : null;
  const startedAt = params.startedAt ? params.startedAt.toISOString() : null;
  const [row] = await sql`
    INSERT INTO tickets (title, status, priority, position, due_date, completed_at, started_at, updated_at, created_at)
    VALUES (
      ${title}, ${status}, ${priority}, ${position},
      ${params.dueDate ?? null},
      ${completedAt},
      ${startedAt},
      NOW(), NOW()
    )
    RETURNING id
  `;
  createdIds.push(row.id);
  return row.id;
}

beforeAll(async () => {
  await sql`DELETE FROM tickets`;
});

afterEach(async () => {
  for (const id of createdIds) {
    await sql`DELETE FROM tickets WHERE id = ${id}`;
  }
  createdIds.length = 0;
});

afterAll(async () => {
  await sql`DELETE FROM tickets`;
  await sql.end();
});

describe('TC-API-002: GET /api/tickets — 보드 조회', () => {
  it('002-1: 빈 보드 조회 — 4개 빈 배열, total=0', async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.board.BACKLOG).toEqual([]);
    expect(body.board.TODO).toEqual([]);
    expect(body.board.IN_PROGRESS).toEqual([]);
    expect(body.board.DONE).toEqual([]);
    expect(body.total).toBe(0);
  });

  it('002-2: 데이터 있는 보드 — 상태별 그룹화', async () => {
    await insertTicket({ title: 'BACKLOG 티켓', status: 'BACKLOG', position: 1 });
    await insertTicket({ title: 'TODO 티켓', status: 'TODO', position: 2 });
    await insertTicket({ title: 'IN_PROGRESS 티켓', status: 'IN_PROGRESS', position: 3 });

    const res = await GET();
    const body = await res.json();

    expect(body.board.BACKLOG).toHaveLength(1);
    expect(body.board.TODO).toHaveLength(1);
    expect(body.board.IN_PROGRESS).toHaveLength(1);
    expect(body.board.BACKLOG[0].title).toBe('BACKLOG 티켓');
    expect(body.board.TODO[0].title).toBe('TODO 티켓');
  });

  it('002-3: 칼럼 내 정렬 — position 오름차순', async () => {
    await insertTicket({ title: '티켓 C', status: 'BACKLOG', position: 3072 });
    await insertTicket({ title: '티켓 A', status: 'BACKLOG', position: 1024 });
    await insertTicket({ title: '티켓 B', status: 'BACKLOG', position: 2048 });

    const res = await GET();
    const body = await res.json();
    const positions: number[] = body.board.BACKLOG.map((t: { position: number }) => t.position);

    expect(positions).toEqual([1024, 2048, 3072]);
  });

  it('002-4: total 필드 — 표시되는 전체 티켓 수', async () => {
    await insertTicket({ title: '티켓 1', status: 'BACKLOG', position: 1 });
    await insertTicket({ title: '티켓 2', status: 'TODO', position: 2 });
    await insertTicket({ title: '티켓 3', status: 'IN_PROGRESS', position: 3 });

    const res = await GET();
    const body = await res.json();

    expect(body.total).toBe(3);
  });

  it('002-5: Done 24시간 이내 티켓 — Done 칼럼에 포함', async () => {
    const id = await insertTicket({
      title: '최근 완료',
      status: 'DONE',
      position: 1,
      completedAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
    });

    const res = await GET();
    const body = await res.json();
    const doneIds: number[] = body.board.DONE.map((t: { id: number }) => t.id);

    expect(doneIds).toContain(id);
  });

  it('002-6: Done 24시간 초과 티켓 — Done 칼럼에서 제외', async () => {
    const id = await insertTicket({
      title: '오래된 완료',
      status: 'DONE',
      position: 2,
      completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25시간 전
    });

    const res = await GET();
    const body = await res.json();
    const doneIds: number[] = body.board.DONE.map((t: { id: number }) => t.id);

    expect(doneIds).not.toContain(id);
  });

  it('002-7: isOverdue 파생 필드 — boolean 타입', async () => {
    await insertTicket({ title: '마감 없는 티켓', status: 'TODO', position: 1 });

    const res = await GET();
    const body = await res.json();

    expect(typeof body.board.TODO[0].isOverdue).toBe('boolean');
  });

  it('002-8: 모든 날짜 필드 포함', async () => {
    await insertTicket({
      title: '날짜 테스트',
      status: 'TODO',
      position: 1,
      dueDate: TOMORROW,
    });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.TODO[0];

    expect('plannedStartDate' in ticket).toBe(true);
    expect('dueDate' in ticket).toBe(true);
    expect('startedAt' in ticket).toBe(true);
    expect('completedAt' in ticket).toBe(true);
  });
});

describe('TC-API-008: isOverdue 필드 계산', () => {
  it('008-1: dueDate < 오늘 + status=TODO → isOverdue=true', async () => {
    const id = await insertTicket({ title: 'TODO 기한 초과', status: 'TODO', position: 1, dueDate: YESTERDAY });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.TODO.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(true);
  });

  it('008-2: dueDate < 오늘 + status=DONE → isOverdue=false', async () => {
    const id = await insertTicket({
      title: 'DONE 기한 초과',
      status: 'DONE',
      position: 1,
      dueDate: YESTERDAY,
      completedAt: new Date(Date.now() - 60 * 60 * 1000),
    });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.DONE.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(false);
  });

  it('008-3: dueDate=null → isOverdue=false', async () => {
    const id = await insertTicket({ title: 'dueDate 없음', status: 'TODO', position: 1 });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.TODO.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(false);
  });

  it('008-4: dueDate > 오늘 → isOverdue=false', async () => {
    const id = await insertTicket({ title: '미래 마감', status: 'TODO', position: 1, dueDate: TOMORROW });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.TODO.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(false);
  });

  it('008-5: dueDate=오늘 → isOverdue=false (오늘은 초과 아님)', async () => {
    const id = await insertTicket({ title: '오늘 마감', status: 'TODO', position: 1, dueDate: TODAY });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.TODO.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(false);
  });

  it('008-6: dueDate < 오늘 + status=BACKLOG → isOverdue=true', async () => {
    const id = await insertTicket({ title: 'BACKLOG 기한 초과', status: 'BACKLOG', position: 1, dueDate: YESTERDAY });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.BACKLOG.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(true);
  });

  it('008-7: dueDate < 오늘 + status=IN_PROGRESS → isOverdue=true', async () => {
    const id = await insertTicket({ title: 'IN_PROGRESS 기한 초과', status: 'IN_PROGRESS', position: 1, dueDate: YESTERDAY });

    const res = await GET();
    const body = await res.json();
    const ticket = body.board.IN_PROGRESS.find((t: { id: number }) => t.id === id);

    expect(ticket.isOverdue).toBe(true);
  });
});
