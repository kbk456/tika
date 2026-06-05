export class TicketNotFoundError extends Error {
  constructor() {
    super('티켓을 찾을 수 없습니다');
    this.name = 'TicketNotFoundError';
  }
}
