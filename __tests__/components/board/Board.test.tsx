import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Board from '@/client/components/board/Board';
import { BoardData, TicketWithOverdue } from '@/shared/types';

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children ?? null}</>,
  closestCorners: jest.fn(),
  useDroppable: () => ({ setNodeRef: jest.fn(), isOver: false }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

const makeTicket = (id: number, title: string, status: TicketWithOverdue['status'] = 'BACKLOG'): TicketWithOverdue => ({
  id,
  title,
  description: null,
  status,
  priority: 'MEDIUM',
  position: id * 1024,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
  isOverdue: false,
});

const mockBoard: BoardData = {
  board: {
    BACKLOG: [makeTicket(1, '백로그 티켓', 'BACKLOG')],
    TODO: [makeTicket(2, '할일 티켓', 'TODO')],
    IN_PROGRESS: [makeTicket(3, '진행중 티켓', 'IN_PROGRESS')],
    DONE: [makeTicket(4, '완료 티켓', 'DONE')],
  },
  total: 4,
};

const defaultProps = {
  board: mockBoard,
  onTicketClick: jest.fn(),
  onDragEnd: jest.fn(),
  activeTicket: null,
};

describe('Board — TC-COMP-003', () => {

  describe('C003-1: 4칼럼 렌더링', () => {
    it('Backlog / Todo / In Progress / Done 헤더가 모두 표시된다', () => {
      render(<Board {...defaultProps} />);
      expect(screen.getByText('Backlog')).toBeInTheDocument();
      expect(screen.getByText('Todo')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('각 칼럼에 해당 티켓이 표시된다', () => {
      render(<Board {...defaultProps} />);
      expect(screen.getByText('백로그 티켓')).toBeInTheDocument();
      expect(screen.getByText('할일 티켓')).toBeInTheDocument();
      expect(screen.getByText('진행중 티켓')).toBeInTheDocument();
      expect(screen.getByText('완료 티켓')).toBeInTheDocument();
    });
  });

  describe('C003-2: Backlog 사이드바 레이아웃', () => {
    it('BACKLOG 칼럼이 .board-sidebar 안에 렌더링된다', () => {
      render(<Board {...defaultProps} />);
      const sidebar = document.querySelector('.board-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveTextContent('Backlog');
    });

    it('TODO / IN_PROGRESS / DONE 칼럼이 .board-columns 안에 렌더링된다', () => {
      render(<Board {...defaultProps} />);
      const columns = document.querySelector('.board-columns');
      expect(columns).toHaveTextContent('Todo');
      expect(columns).toHaveTextContent('In Progress');
      expect(columns).toHaveTextContent('Done');
    });

    it('.board-sidebar는 .board-columns를 포함하지 않는다', () => {
      render(<Board {...defaultProps} />);
      const sidebar = document.querySelector('.board-sidebar');
      expect(sidebar?.querySelector('.board-columns')).toBeNull();
    });

    it('BACKLOG 티켓은 .board-sidebar 안에, .board-columns 밖에 위치한다', () => {
      render(<Board {...defaultProps} />);
      const sidebar = document.querySelector('.board-sidebar');
      const columns = document.querySelector('.board-columns');
      expect(sidebar).toHaveTextContent('백로그 티켓');
      expect(columns).not.toHaveTextContent('백로그 티켓');
    });
  });

  describe('DragOverlay', () => {
    it('activeTicket=null → 카드 제목이 중복 렌더링되지 않는다', () => {
      render(<Board {...defaultProps} activeTicket={null} />);
      expect(screen.getAllByText('백로그 티켓')).toHaveLength(1);
    });

    it('activeTicket 있을 때 → 해당 티켓 카드가 DragOverlay에 복제 렌더링된다', () => {
      const activeTicket = mockBoard.board.BACKLOG[0];
      render(<Board {...defaultProps} activeTicket={activeTicket} />);
      expect(screen.getAllByText('백로그 티켓')).toHaveLength(2);
    });
  });

  describe('이벤트 전달', () => {
    it('TicketCard 클릭 → onTicketClick 호출', async () => {
      const onTicketClick = jest.fn();
      render(<Board {...defaultProps} onTicketClick={onTicketClick} />);
      const ticket = mockBoard.board.BACKLOG[0];
      await userEvent.click(screen.getByRole('button', { name: `티켓: ${ticket.title}` }));
      expect(onTicketClick).toHaveBeenCalledWith(ticket);
    });
  });

});
