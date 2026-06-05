import { NextResponse } from 'next/server';
import { createTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services/ticketService';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 형식이 올바르지 않습니다' } },
      { status: 400 }
    );
  }

  const result = createTicketSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: firstError.message } },
      { status: 400 }
    );
  }

  try {
    const ticket = await ticketService.create(result.data);
    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
