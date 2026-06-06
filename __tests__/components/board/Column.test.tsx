import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Column from '@/client/components/board/Column';
import { TicketWithOverdue } from '@/shared/types';

jest.mock('@dnd-kit/core', () => ({
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

const makeTicket = (id: number, title: string): TicketWithOverdue => ({
  id,
  title,
  description: null,
  status: 'BACKLOG',
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

const t1 = makeTicket(1, '첫 번째 티켓');
const t2 = makeTicket(2, '두 번째 티켓');

describe('Column — TC-COMP-002', () => {

  describe('C002-1: 티켓 있는 칼럼', () => {
    it('tickets 배열만큼 TicketCard(role=button)가 렌더링된다', () => {
      render(<Column status="BACKLOG" tickets={[t1, t2]} onTicketClick={jest.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('각 티켓 제목이 표시된다', () => {
      render(<Column status="BACKLOG" tickets={[t1, t2]} onTicketClick={jest.fn()} />);
      expect(screen.getByText('첫 번째 티켓')).toBeInTheDocument();
      expect(screen.getByText('두 번째 티켓')).toBeInTheDocument();
    });
  });

  describe('C002-2: 빈 칼럼', () => {
    it('tickets=[] → "이 칼럼에 티켓이 없습니다" 표시', () => {
      render(<Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />);
      expect(screen.getByText('이 칼럼에 티켓이 없습니다')).toBeInTheDocument();
    });

    it('tickets=[] → TicketCard가 없다', () => {
      render(<Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('C002-3: 칼럼 헤더', () => {
    it.each([
      ['BACKLOG', 'Backlog'],
      ['TODO', 'Todo'],
      ['IN_PROGRESS', 'In Progress'],
      ['DONE', 'Done'],
    ] as const)('status=%s → 헤더에 "%s" 표시', (status, expected) => {
      render(<Column status={status} tickets={[]} onTicketClick={jest.fn()} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('티켓 수 뱃지에 tickets.length 표시', () => {
      render(<Column status="BACKLOG" tickets={[t1, t2]} onTicketClick={jest.fn()} />);
      expect(document.querySelector('.column-count')).toHaveTextContent('2');
    });

    it('빈 칼럼에서도 헤더 티켓 수는 0 표시', () => {
      render(<Column status="DONE" tickets={[]} onTicketClick={jest.fn()} />);
      expect(document.querySelector('.column-count')).toHaveTextContent('0');
    });
  });

  describe('클릭 이벤트', () => {
    it('TicketCard 클릭 → onTicketClick(ticket) 호출', async () => {
      const onTicketClick = jest.fn();
      render(<Column status="BACKLOG" tickets={[t1]} onTicketClick={onTicketClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(onTicketClick).toHaveBeenCalledWith(t1);
    });

    it('여러 카드 중 두 번째 클릭 → 두 번째 티켓 전달', async () => {
      const onTicketClick = jest.fn();
      render(<Column status="BACKLOG" tickets={[t1, t2]} onTicketClick={onTicketClick} />);
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[1]);
      expect(onTicketClick).toHaveBeenCalledWith(t2);
    });
  });

});
