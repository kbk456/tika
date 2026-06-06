'use client';

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { BoardData, TicketWithOverdue } from '@/shared/types';
import Column from './Column';
import TicketCard from '@/client/components/ticket/TicketCard';

const MAIN_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

interface BoardProps {
  board: BoardData;
  onTicketClick: (ticket: TicketWithOverdue) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeTicket: TicketWithOverdue | null;
}

export default function Board({ board, onTicketClick, onDragEnd, activeTicket }: BoardProps) {
  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="board-body">
        <aside className="board-sidebar">
          <Column
            status="BACKLOG"
            tickets={board.board.BACKLOG}
            onTicketClick={onTicketClick}
          />
        </aside>

        <div className="board-main">
          <div className="board-columns">
            {MAIN_STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tickets={board.board[status]}
                onTicketClick={onTicketClick}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTicket && (
          <TicketCard ticket={activeTicket} onClick={() => {}} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  );
}
