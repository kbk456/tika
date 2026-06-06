import {
  fetchBoard,
  createTicket,
  updateTicket,
  deleteTicket,
  reorderTicket,
  completeTicket,
} from '@/client/api/ticketApi';
import type { CreateTicketInput, UpdateTicketInput } from '@/shared/validations/ticket';

// ─── Mock 헬퍼 ─────────────────────────────────────────────────────
function setupOk(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValueOnce(body),
  });
}

function setupError(status: number, message: string) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: jest.fn().mockResolvedValueOnce({
      error: { code: 'ERROR_CODE', message },
    }),
  });
}

// ─── Mock 데이터 ───────────────────────────────────────────────────
const mockTicket = {
  id: 1,
  title: '새 티켓',
  description: null,
  status: 'BACKLOG',
  priority: 'MEDIUM',
  position: 1024,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: '2026-06-01T09:00:00.000Z',
  updatedAt: '2026-06-01T09:00:00.000Z',
};

const mockBoardData = {
  board: {
    BACKLOG: [{ ...mockTicket, isOverdue: false }],
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  },
  total: 1,
};

// ─── 테스트 ────────────────────────────────────────────────────────
describe('ticketApi', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────
  // fetchBoard — GET /api/tickets
  // ─────────────────────────────────────────────────────────────────
  describe('fetchBoard', () => {
    it('GET /api/tickets 로 fetch 호출한다', async () => {
      setupOk(200, mockBoardData);
      await fetchBoard();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('/api/tickets');
    });

    it('method가 GET (또는 생략)으로 호출한다', async () => {
      setupOk(200, mockBoardData);
      await fetchBoard();
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      const method = (options?.method ?? 'GET').toUpperCase();
      expect(method).toBe('GET');
    });

    it('200 응답 시 BoardData를 반환한다', async () => {
      setupOk(200, mockBoardData);
      const result = await fetchBoard();
      expect(result).toEqual(mockBoardData);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      setupError(500, '서버 내부 오류');
      await expect(fetchBoard()).rejects.toThrow('서버 내부 오류');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // createTicket — POST /api/tickets
  // ─────────────────────────────────────────────────────────────────
  describe('createTicket', () => {
    const input: CreateTicketInput = { title: '새 티켓', priority: 'HIGH' };

    it('POST /api/tickets 로 fetch 호출한다', async () => {
      setupOk(201, mockTicket);
      await createTicket(input);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tickets',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('요청 body가 JSON.stringify(input)으로 전송된다', async () => {
      setupOk(201, mockTicket);
      await createTicket(input);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tickets',
        expect.objectContaining({ body: JSON.stringify(input) })
      );
    });

    it('Content-Type: application/json 헤더가 포함된다', async () => {
      setupOk(201, mockTicket);
      await createTicket(input);
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
    });

    it('201 응답 시 Ticket을 반환한다', async () => {
      setupOk(201, mockTicket);
      const result = await createTicket(input);
      expect(result).toEqual(mockTicket);
    });

    it('400 에러 응답 시 error.message를 throw한다', async () => {
      setupError(400, '제목을 입력해주세요');
      await expect(createTicket({ title: '' })).rejects.toThrow('제목을 입력해주세요');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // updateTicket — PATCH /api/tickets/:id
  // ─────────────────────────────────────────────────────────────────
  describe('updateTicket', () => {
    const id = 1;
    const input: UpdateTicketInput = { title: '수정된 제목', priority: 'LOW' };
    const updated = { ...mockTicket, title: '수정된 제목', priority: 'LOW' };

    it('PATCH /api/tickets/:id 로 fetch 호출한다', async () => {
      setupOk(200, updated);
      await updateTicket(id, input);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/tickets/${id}`,
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('요청 body가 JSON.stringify(input)으로 전송된다', async () => {
      setupOk(200, updated);
      await updateTicket(id, input);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/tickets/${id}`,
        expect.objectContaining({ body: JSON.stringify(input) })
      );
    });

    it('Content-Type: application/json 헤더가 포함된다', async () => {
      setupOk(200, updated);
      await updateTicket(id, input);
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
    });

    it('200 응답 시 수정된 Ticket을 반환한다', async () => {
      setupOk(200, updated);
      const result = await updateTicket(id, input);
      expect(result).toEqual(updated);
    });

    it('404 에러 응답 시 error.message를 throw한다', async () => {
      setupError(404, '티켓을 찾을 수 없습니다');
      await expect(updateTicket(999, input)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });

    it('400 에러 응답 시 error.message를 throw한다', async () => {
      setupError(400, '제목은 200자 이내로 입력해주세요');
      await expect(updateTicket(id, { title: 'A'.repeat(201) })).rejects.toThrow(
        '제목은 200자 이내로 입력해주세요'
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // deleteTicket — DELETE /api/tickets/:id
  // ─────────────────────────────────────────────────────────────────
  describe('deleteTicket', () => {
    it('DELETE /api/tickets/:id 로 fetch 호출한다', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });
      await deleteTicket(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tickets/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('204 응답 시 void(undefined)를 반환한다', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });
      await expect(deleteTicket(1)).resolves.toBeUndefined();
    });

    it('요청 body 없이 호출된다', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });
      await deleteTicket(1);
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.body).toBeUndefined();
    });

    it('404 에러 응답 시 error.message를 throw한다', async () => {
      setupError(404, '티켓을 찾을 수 없습니다');
      await expect(deleteTicket(999)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // reorderTicket — PATCH /api/tickets/reorder
  // ─────────────────────────────────────────────────────────────────
  describe('reorderTicket', () => {
    const input = { ticketId: 1, status: 'IN_PROGRESS' as const, position: 512 };
    const mockReorderResponse = {
      ticket: { ...mockTicket, status: 'IN_PROGRESS', position: 512 },
      affected: [{ id: 2, position: 1024 }],
    };

    it('PATCH /api/tickets/reorder 로 fetch 호출한다', async () => {
      setupOk(200, mockReorderResponse);
      await reorderTicket(input);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tickets/reorder',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('요청 body가 JSON.stringify(input)으로 전송된다', async () => {
      setupOk(200, mockReorderResponse);
      await reorderTicket(input);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tickets/reorder',
        expect.objectContaining({ body: JSON.stringify(input) })
      );
    });

    it('Content-Type: application/json 헤더가 포함된다', async () => {
      setupOk(200, mockReorderResponse);
      await reorderTicket(input);
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
    });

    it('200 응답 시 { ticket, affected }를 반환한다', async () => {
      setupOk(200, mockReorderResponse);
      const result = await reorderTicket(input);
      expect(result).toEqual(mockReorderResponse);
    });

    it('에러 응답 시 error.message를 throw한다', async () => {
      setupError(400, '요청 형식이 올바르지 않습니다');
      await expect(reorderTicket(input)).rejects.toThrow('요청 형식이 올바르지 않습니다');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // completeTicket — PATCH /api/tickets/:id/complete
  // ─────────────────────────────────────────────────────────────────
  describe('completeTicket', () => {
    const mockCompleted = {
      ...mockTicket,
      status: 'DONE',
      completedAt: '2026-06-01T15:30:00.000Z',
    };

    it('PATCH /api/tickets/:id/complete 로 fetch 호출한다', async () => {
      setupOk(200, mockCompleted);
      await completeTicket(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tickets/1/complete',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('요청 body 없이 호출된다', async () => {
      setupOk(200, mockCompleted);
      await completeTicket(1);
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.body).toBeUndefined();
    });

    it('200 응답 시 완료된 Ticket을 반환한다', async () => {
      setupOk(200, mockCompleted);
      const result = await completeTicket(1);
      expect(result).toEqual(mockCompleted);
    });

    it('404 에러 응답 시 error.message를 throw한다', async () => {
      setupError(404, '티켓을 찾을 수 없습니다');
      await expect(completeTicket(999)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });
});
