'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TicketWithOverdue } from '@/shared/types';
import { PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';

interface TicketCardProps {
  ticket: TicketWithOverdue;
  onClick: () => void;
  isDragging?: boolean;
}

export default function TicketCard({ ticket, onClick, isDragging = false }: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const className = [
    'ticket-card',
    ticket.isOverdue && 'ticket-card--overdue',
    ticket.status === 'DONE' && 'ticket-card--done',
    isDragging && 'ticket-card--dragging',
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
      role="button"
      aria-label={`티켓: ${ticket.title}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <p className="ticket-card-title">{ticket.title}</p>
      {ticket.description && (
        <p className="ticket-card-desc">{ticket.description}</p>
      )}
      <div className="ticket-card-meta">
        <PriorityBadge priority={ticket.priority} />
        {ticket.dueDate && (
          <DueDateBadge dueDate={ticket.dueDate} isOverdue={ticket.isOverdue} />
        )}
      </div>
    </div>
  );
}
