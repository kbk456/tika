import { NextResponse } from 'next/server';
import { reorderTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services/ticketService';
import { TicketNotFoundError } from '@/server/services/ticketNotFoundError';

export async function PATCH(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 형식이 올바르지 않습니다' } },
      { status: 400 }
    );
  }

  const result = reorderTicketSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: firstError.message } },
      { status: 400 }
    );
  }

  try {
    const data = await ticketService.reorder(result.data);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof TicketNotFoundError) {
      return NextResponse.json(
        { error: { code: 'TICKET_NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
