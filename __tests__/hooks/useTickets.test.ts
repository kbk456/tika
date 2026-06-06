import { renderHook, act } from '@testing-library/react';
import { useTickets } from '@/client/hooks/useTickets';
import {
  fetchBoard,
  createTicket,
  updateTicket,
  deleteTicket,
  reorderTicket,
  completeTicket,
} from '@/client/api/ticketApi';
import type { BoardData } from '@/shared/types';
import type { CreateTicketInput, UpdateTicketInput } from '@/shared/validations/ticket';

// ─── ticketApi 전체 mock ─────────────────────────────────────────
jest.mock('@/client/api/ticketApi', () => ({
  fetchBoard: jest.fn(),
  createTicket: jest.fn(),
  updateTicket: jest.fn(),
  deleteTicket: jest.fn(),
  reorderTicket: jest.fn(),
  completeTicket: jest.fn(),
}));

const mockFetchBoard = fetchBoard as jest.Mock;
const mockCreateTicket = createTicket as jest.Mock;
const mockUpdateTicket = updateTicket as jest.Mock;
const mockDeleteTicket = deleteTicket as jest.Mock;
const mockReorderTicket = reorderTicket as jest.Mock;
const mockCompleteTicket = completeTicket as jest.Mock;

// ─── Mock 데이터 ─────────────────────────────────────────────────
const mockTicket = {
  id: 1,
  title: '테스트 티켓',
  description: null,
  status: 'BACKLOG' as const,
  priority: 'MEDIUM' as const,
  position: 1024,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: '2026-06-01T09:00:00.000Z',
  updatedAt: '2026-06-01T09:00:00.000Z',
};

const initialBoard: BoardData = {
  board: {
    BACKLOG: [{ ...mockTicket, isOverdue: false }],
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  },
  total: 1,
};

const refreshedBoard: BoardData = {
  board: {
    BACKLOG: [
      { ...mockTicket, isOverdue: false },
      { ...mockTicket, id: 2, title: '새로 추가된 티켓', isOverdue: false },
    ],
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  },
  total: 2,
};

// ─── 테스트 ──────────────────────────────────────────────────────
describe('useTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── 초기 상태 ─────────────────────────────────────────────────
  describe('초기 상태', () => {
    it('board가 initialData로 초기화된다', () => {
      const { result } = renderHook(() => useTickets(initialBoard));
      expect(result.current.board).toEqual(initialBoard);
    });

    it('isLoading이 false로 초기화된다', () => {
      const { result } = renderHook(() => useTickets(initialBoard));
      expect(result.current.isLoading).toBe(false);
    });

    it('error가 null로 초기화된다', () => {
      const { result } = renderHook(() => useTickets(initialBoard));
      expect(result.current.error).toBeNull();
    });
  });

  // ─── create ────────────────────────────────────────────────────
  describe('create', () => {
    const input: CreateTicketInput = { title: '새 티켓', priority: 'HIGH' };

    it('createTicket을 data와 함께 호출한다', async () => {
      mockCreateTicket.mockResolvedValueOnce(mockTicket);
      mockFetchBoard.mockResolvedValueOnce(initialBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.create(input); });

      expect(mockCreateTicket).toHaveBeenCalledWith(input);
    });

    it('createTicket 성공 후 fetchBoard를 호출한다', async () => {
      mockCreateTicket.mockResolvedValueOnce(mockTicket);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.create(input); });

      expect(mockFetchBoard).toHaveBeenCalledTimes(1);
    });

    it('fetchBoard 결과로 board 상태를 업데이트한다', async () => {
      mockCreateTicket.mockResolvedValueOnce(mockTicket);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.create(input); });

      expect(result.current.board).toEqual(refreshedBoard);
    });

    it('실패 시 error를 메시지로 설정한다', async () => {
      mockCreateTicket.mockRejectedValueOnce(new Error('제목을 입력해주세요'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.create(input); });

      expect(result.current.error).toBe('제목을 입력해주세요');
    });

    it('실패 시 fetchBoard를 호출하지 않는다', async () => {
      mockCreateTicket.mockRejectedValueOnce(new Error('서버 오류'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.create(input); });

      expect(mockFetchBoard).not.toHaveBeenCalled();
    });
  });

  // ─── update ────────────────────────────────────────────────────
  describe('update', () => {
    const id = 1;
    const input: UpdateTicketInput = { title: '수정된 제목' };

    it('updateTicket을 id, data와 함께 호출한다', async () => {
      mockUpdateTicket.mockResolvedValueOnce({ ...mockTicket, ...input });
      mockFetchBoard.mockResolvedValueOnce(initialBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.update(id, input); });

      expect(mockUpdateTicket).toHaveBeenCalledWith(id, input);
    });

    it('updateTicket 성공 후 fetchBoard를 호출한다', async () => {
      mockUpdateTicket.mockResolvedValueOnce(mockTicket);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.update(id, input); });

      expect(mockFetchBoard).toHaveBeenCalledTimes(1);
    });

    it('fetchBoard 결과로 board 상태를 업데이트한다', async () => {
      mockUpdateTicket.mockResolvedValueOnce(mockTicket);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.update(id, input); });

      expect(result.current.board).toEqual(refreshedBoard);
    });

    it('실패 시 error를 메시지로 설정한다', async () => {
      mockUpdateTicket.mockRejectedValueOnce(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.update(id, input); });

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  // ─── remove ────────────────────────────────────────────────────
  describe('remove', () => {
    const id = 1;

    it('deleteTicket을 id와 함께 호출한다', async () => {
      mockDeleteTicket.mockResolvedValueOnce(undefined);
      mockFetchBoard.mockResolvedValueOnce(initialBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.remove(id); });

      expect(mockDeleteTicket).toHaveBeenCalledWith(id);
    });

    it('deleteTicket 성공 후 fetchBoard를 호출한다', async () => {
      mockDeleteTicket.mockResolvedValueOnce(undefined);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.remove(id); });

      expect(mockFetchBoard).toHaveBeenCalledTimes(1);
    });

    it('fetchBoard 결과로 board 상태를 업데이트한다', async () => {
      const emptyBoard: BoardData = { board: { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [] }, total: 0 };
      mockDeleteTicket.mockResolvedValueOnce(undefined);
      mockFetchBoard.mockResolvedValueOnce(emptyBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.remove(id); });

      expect(result.current.board).toEqual(emptyBoard);
    });

    it('실패 시 error를 메시지로 설정한다', async () => {
      mockDeleteTicket.mockRejectedValueOnce(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.remove(id); });

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  // ─── reorder ───────────────────────────────────────────────────
  describe('reorder', () => {
    const ticketId = 1;
    const status = 'IN_PROGRESS' as const;
    const position = 512;

    it('reorderTicket을 { ticketId, status, position }으로 호출한다', async () => {
      mockReorderTicket.mockResolvedValueOnce({
        ticket: { ...mockTicket, status, position },
        affected: [],
      });
      mockFetchBoard.mockResolvedValueOnce(initialBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.reorder(ticketId, status, position); });

      expect(mockReorderTicket).toHaveBeenCalledWith({ ticketId, status, position });
    });

    it('reorderTicket 성공 후 fetchBoard를 호출한다', async () => {
      mockReorderTicket.mockResolvedValueOnce({ ticket: mockTicket, affected: [] });
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.reorder(ticketId, status, position); });

      expect(mockFetchBoard).toHaveBeenCalledTimes(1);
    });

    it('fetchBoard 결과로 board 상태를 업데이트한다', async () => {
      mockReorderTicket.mockResolvedValueOnce({ ticket: mockTicket, affected: [] });
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.reorder(ticketId, status, position); });

      expect(result.current.board).toEqual(refreshedBoard);
    });

    it('실패 시 error를 메시지로 설정한다', async () => {
      mockReorderTicket.mockRejectedValueOnce(new Error('요청 형식이 올바르지 않습니다'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.reorder(ticketId, status, position); });

      expect(result.current.error).toBe('요청 형식이 올바르지 않습니다');
    });
  });

  // ─── complete ──────────────────────────────────────────────────
  describe('complete', () => {
    const id = 1;
    const completedTicket = { ...mockTicket, status: 'DONE' as const, completedAt: '2026-06-01T15:00:00.000Z' };

    it('completeTicket을 id와 함께 호출한다', async () => {
      mockCompleteTicket.mockResolvedValueOnce(completedTicket);
      mockFetchBoard.mockResolvedValueOnce(initialBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.complete(id); });

      expect(mockCompleteTicket).toHaveBeenCalledWith(id);
    });

    it('completeTicket 성공 후 fetchBoard를 호출한다', async () => {
      mockCompleteTicket.mockResolvedValueOnce(completedTicket);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.complete(id); });

      expect(mockFetchBoard).toHaveBeenCalledTimes(1);
    });

    it('fetchBoard 결과로 board 상태를 업데이트한다', async () => {
      mockCompleteTicket.mockResolvedValueOnce(completedTicket);
      mockFetchBoard.mockResolvedValueOnce(refreshedBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.complete(id); });

      expect(result.current.board).toEqual(refreshedBoard);
    });

    it('실패 시 error를 메시지로 설정한다', async () => {
      mockCompleteTicket.mockRejectedValueOnce(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.complete(id); });

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  // ─── isLoading 상태 ────────────────────────────────────────────
  describe('isLoading 상태', () => {
    it('api 호출 중 isLoading=true, 완료 후 false', async () => {
      let resolve!: (v: typeof mockTicket) => void;
      mockCreateTicket.mockReturnValueOnce(
        new Promise<typeof mockTicket>(r => { resolve = r; })
      );
      mockFetchBoard.mockResolvedValue(initialBoard);

      const { result } = renderHook(() => useTickets(initialBoard));
      expect(result.current.isLoading).toBe(false);

      // 동기 부분(setIsLoading(true)) 실행 후 첫 await에서 중단
      act(() => { result.current.create({ title: '새 티켓' }); });
      expect(result.current.isLoading).toBe(true);

      // Promise resolve → 완료
      await act(async () => { resolve(mockTicket); });
      expect(result.current.isLoading).toBe(false);
    });

    it('실패 후에도 isLoading=false가 된다', async () => {
      mockCreateTicket.mockRejectedValueOnce(new Error('서버 오류'));

      const { result } = renderHook(() => useTickets(initialBoard));
      await act(async () => { await result.current.create({ title: '새 티켓' }); });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
