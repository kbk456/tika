'use client';

import { TicketWithOverdue, TicketStatus } from '@/shared/types';

interface TicketDetailViewProps {
  ticket: TicketWithOverdue;
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return date.toISOString().split('T')[0];
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="form-field">
      <span className="form-label">{label}</span>
      <span className="form-readonly">{value}</span>
    </div>
  );
}

export default function TicketDetailView({ ticket }: TicketDetailViewProps) {
  return (
    <div>
      <ReadonlyField label="상태" value={STATUS_LABEL[ticket.status]} />
      <ReadonlyField label="시작일" value={formatDate(ticket.startedAt)} />
      <ReadonlyField label="종료일" value={formatDate(ticket.completedAt)} />
      <ReadonlyField label="생성일" value={formatDate(ticket.createdAt)} />
    </div>
  );
}
