import type { CreateTicketInput, UpdateTicketInput, ReorderTicketInput } from '@/shared/validations/ticket';
import type { BoardData, Ticket } from '@/shared/types';

export interface ReorderResponse {
  ticket: Ticket;
  affected: Array<{ id: number; position: number }>;
}

async function parseError(res: Response): Promise<never> {
  const { error } = await res.json();
  throw new Error(error.message);
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

// GET /api/tickets
export async function fetchBoard(): Promise<BoardData> {
  const res = await fetch('/api/tickets');
  if (!res.ok) return parseError(res);
  return res.json() as Promise<BoardData>;
}

// POST /api/tickets
export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<Ticket>;
}

// PATCH /api/tickets/:id
export async function updateTicket(id: number, data: UpdateTicketInput): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<Ticket>;
}

// DELETE /api/tickets/:id
export async function deleteTicket(id: number): Promise<void> {
  const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
  if (!res.ok) return parseError(res);
}

// PATCH /api/tickets/reorder
export async function reorderTicket(data: ReorderTicketInput): Promise<ReorderResponse> {
  const res = await fetch('/api/tickets/reorder', {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<ReorderResponse>;
}

// PATCH /api/tickets/:id/complete
export async function completeTicket(id: number): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}/complete`, { method: 'PATCH' });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<Ticket>;
}
