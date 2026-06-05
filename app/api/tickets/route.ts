import { NextResponse } from 'next/server';
import { createTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services/ticketService';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  const result = createTicketSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: firstError.message } },
      { status: 400 }
    );
  }

  const ticket = await ticketService.create(result.data);

  return NextResponse.json(ticket, { status: 201 });
}
