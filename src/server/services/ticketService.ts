import { eq, min } from 'drizzle-orm';
import { db } from '../db';
import { tickets } from '../db/schema';
import { TICKET_STATUS, TICKET_PRIORITY } from '@/shared/types';
import type { CreateTicketInput } from '@/shared/validations/ticket';

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
};
