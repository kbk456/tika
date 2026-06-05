import { NextResponse } from 'next/server';
import { updateTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services/ticketService';
import { TicketNotFoundError } from '@/server/services/ticketNotFoundError';

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return isNaN(id) ? null : id;
}

const NOT_FOUND_RESPONSE = NextResponse.json(
  { error: { code: 'TICKET_NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
  { status: 404 }
);

const INTERNAL_ERROR_RESPONSE = NextResponse.json(
  { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
  { status: 500 }
);

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 ID입니다' } },
      { status: 400 }
    );
  }

  try {
    const ticket = await ticketService.getById(id);
    return NextResponse.json(ticket);
  } catch (err) {
    if (err instanceof TicketNotFoundError) return NOT_FOUND_RESPONSE;
    return INTERNAL_ERROR_RESPONSE;
  }
}

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 ID입니다' } },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 형식이 올바르지 않습니다' } },
      { status: 400 }
    );
  }

  const result = updateTicketSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: firstError.message } },
      { status: 400 }
    );
  }

  try {
    const ticket = await ticketService.update(id, result.data);
    return NextResponse.json(ticket);
  } catch (err) {
    if (err instanceof TicketNotFoundError) return NOT_FOUND_RESPONSE;
    return INTERNAL_ERROR_RESPONSE;
  }
}

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 ID입니다' } },
      { status: 400 }
    );
  }

  try {
    await ticketService.deleteById(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof TicketNotFoundError) return NOT_FOUND_RESPONSE;
    return INTERNAL_ERROR_RESPONSE;
  }
}
