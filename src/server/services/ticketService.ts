import { eq, min, ne, or, gte, asc } from 'drizzle-orm';
import { db } from '../db';
import { tickets } from '../db/schema';
import { TICKET_STATUS, TICKET_PRIORITY } from '@/shared/types';
import type { Ticket, BoardData, TicketWithOverdue } from '@/shared/types';
import type { CreateTicketInput, UpdateTicketInput, ReorderTicketInput } from '@/shared/validations/ticket';
import { TicketNotFoundError } from './ticketNotFoundError';

type DrizzleTicket = typeof tickets.$inferSelect;

function toTicket(row: DrizzleTicket): Ticket {
  return row as unknown as Ticket;
}

function withOverdue(row: DrizzleTicket): TicketWithOverdue {
  const today = new Date().toISOString().split('T')[0];
  return {
    ...toTicket(row),
    isOverdue: !!(row.dueDate && row.status !== TICKET_STATUS.DONE && row.dueDate < today),
  };
}

export const ticketService = {
  async create(input: CreateTicketInput) {
    const [row] = await db
      .select({ minPos: min(tickets.position) })
      .from(tickets)
      .where(eq(tickets.status, TICKET_STATUS.BACKLOG));

    const position = row?.minPos != null ? row.minPos - 1024 : -1024;

    const [ticket] = await db
      .insert(tickets)
      .values({
        title: input.title,
        description: input.description ?? null,
        status: TICKET_STATUS.BACKLOG,
        priority: input.priority ?? TICKET_PRIORITY.MEDIUM,
        position,
        plannedStartDate: input.plannedStartDate ?? null,
        dueDate: input.dueDate ?? null,
      })
      .returning();

    return ticket;
  },

  async getBoard(): Promise<BoardData> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rows = await db
      .select()
      .from(tickets)
      .where(
        or(
          ne(tickets.status, TICKET_STATUS.DONE),
          gte(tickets.completedAt, twentyFourHoursAgo)
        )
      )
      .orderBy(asc(tickets.position));

    const mapped = rows.map(withOverdue);

    const board: BoardData['board'] = {
      BACKLOG: mapped.filter((t) => t.status === TICKET_STATUS.BACKLOG),
      TODO: mapped.filter((t) => t.status === TICKET_STATUS.TODO),
      IN_PROGRESS: mapped.filter((t) => t.status === TICKET_STATUS.IN_PROGRESS),
      DONE: mapped.filter((t) => t.status === TICKET_STATUS.DONE),
    };

    return { board, total: mapped.length };
  },

  async getById(id: number): Promise<TicketWithOverdue> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (!ticket) throw new TicketNotFoundError();
    return withOverdue(ticket);
  },

  async update(id: number, input: UpdateTicketInput): Promise<TicketWithOverdue> {
    const [updated] = await db
      .update(tickets)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();

    if (!updated) throw new TicketNotFoundError();
    return withOverdue(updated);
  },

  async complete(id: number): Promise<Ticket> {
    const [existing] = await db.select({ id: tickets.id }).from(tickets).where(eq(tickets.id, id));
    if (!existing) throw new TicketNotFoundError();

    const [row] = await db
      .select({ minPos: min(tickets.position) })
      .from(tickets)
      .where(eq(tickets.status, TICKET_STATUS.DONE));

    const position = row?.minPos != null ? row.minPos - 1024 : -1024;
    const now = new Date();

    const [updated] = await db
      .update(tickets)
      .set({ status: TICKET_STATUS.DONE, completedAt: now, position, updatedAt: now })
      .where(eq(tickets.id, id))
      .returning();

    return toTicket(updated);
  },

  async deleteById(id: number): Promise<void> {
    const [deleted] = await db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning({ id: tickets.id });

    if (!deleted) throw new TicketNotFoundError();
  },

  async reorder(input: ReorderTicketInput): Promise<{ ticket: Ticket; affected: { id: number; position: number }[] }> {
    const { ticketId, status: newStatus, position: newPosition } = input;

    const [existing] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
    if (!existing) throw new TicketNotFoundError();

    return db.transaction(async (tx) => {
      const now = new Date();

      const setValues: {
        status: string;
        position: number;
        updatedAt: Date;
        startedAt?: Date | null;
        completedAt?: Date | null;
      } = { status: newStatus, position: newPosition, updatedAt: now };

      if (newStatus === TICKET_STATUS.TODO) {
        setValues.startedAt = now;
      } else if (newStatus === TICKET_STATUS.BACKLOG) {
        setValues.startedAt = null;
      }

      if (existing.status === TICKET_STATUS.DONE) {
        setValues.completedAt = null;
      }

      const [movedRow] = await tx
        .update(tickets)
        .set(setValues)
        .where(eq(tickets.id, ticketId))
        .returning();

      // 대상 칼럼 전체 position 확인 (이동된 티켓 포함)
      const columnTickets = await tx
        .select({ id: tickets.id, position: tickets.position })
        .from(tickets)
        .where(eq(tickets.status, newStatus))
        .orderBy(asc(tickets.position));

      const affected: { id: number; position: number }[] = [];
      let finalRow = movedRow;

      // 인접 gap < 1 이면 칼럼 전체 1024 간격으로 재정렬
      const needsReorder = columnTickets.some(
        (t, i) => i > 0 && t.position - columnTickets[i - 1].position < 1
      );

      if (needsReorder) {
        for (let i = 0; i < columnTickets.length; i++) {
          const redistributedPos = (i + 1) * 1024;
          const t = columnTickets[i];
          if (t.position !== redistributedPos) {
            await tx
              .update(tickets)
              .set({ position: redistributedPos })
              .where(eq(tickets.id, t.id));

            if (t.id === ticketId) {
              finalRow = { ...finalRow, position: redistributedPos };
            } else {
              affected.push({ id: t.id, position: redistributedPos });
            }
          }
        }
      }

      return { ticket: toTicket(finalRow), affected };
    });
  },
};
