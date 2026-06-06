'use client';

import { useState } from 'react';
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

type ReorderableStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS';

export function useTickets(initialData: BoardData) {
  const [board, setBoard] = useState<BoardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = async (fn: () => Promise<unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      await fn();
      const fresh = await fetchBoard();
      setBoard(fresh);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const create = (data: CreateTicketInput) =>
    withLoading(() => createTicket(data));

  const update = (id: number, data: UpdateTicketInput) =>
    withLoading(() => updateTicket(id, data));

  const remove = (id: number) =>
    withLoading(() => deleteTicket(id));

  const reorder = (ticketId: number, status: ReorderableStatus, position: number) =>
    withLoading(() => reorderTicket({ ticketId, status, position }));

  const complete = (id: number) =>
    withLoading(() => completeTicket(id));

  return { board, isLoading, error, create, update, remove, reorder, complete };
}
