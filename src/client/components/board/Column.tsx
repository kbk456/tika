'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TicketStatus, TicketWithOverdue } from '@/shared/types';
import ColumnHeader from './ColumnHeader';
import TicketCard from '@/client/components/ticket/TicketCard';

const COLUMN_TITLE: Record<TicketStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

interface ColumnProps {
  status: TicketStatus;
  tickets: TicketWithOverdue[];
  onTicketClick: (ticket: TicketWithOverdue) => void;
}

export default function Column({ status, tickets, onTicketClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`column${isOver ? ' column--drag-over' : ''}`}>
      <ColumnHeader title={COLUMN_TITLE[status]} count={tickets.length} />
      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="column-cards">
          {tickets.length === 0 ? (
            <p className="column-empty">이 칼럼에 티켓이 없습니다</p>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick(ticket)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
