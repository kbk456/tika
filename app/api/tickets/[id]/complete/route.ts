import { NextResponse } from 'next/server';
import { ticketService } from '@/server/services/ticketService';
import { TicketNotFoundError } from '@/server/services/ticketNotFoundError';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params): Promise<NextResponse> {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 ID입니다' } },
      { status: 400 }
    );
  }

  try {
    const ticket = await ticketService.complete(id);
    return NextResponse.json(ticket);
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
