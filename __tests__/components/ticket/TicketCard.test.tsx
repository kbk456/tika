import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketCard from '@/client/components/ticket/TicketCard';
import { TicketWithOverdue } from '@/shared/types';

jest.mock('@dnd-kit/sortable', () => ({
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
  CSS: {
    Transform: { toString: () => '' },
  },
}));

const baseTicket: TicketWithOverdue = {
  id: 1,
  title: '로그인 페이지 UI 구현',
  description: '이메일/비밀번호 폼 구현',
  status: 'BACKLOG',
  priority: 'MEDIUM',
  position: 1024,
  plannedStartDate: null,
  dueDate: '2026-06-20',
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
  isOverdue: false,
};

describe('TicketCard — TC-COMP-001', () => {

  describe('C001-1: 기본 렌더링', () => {
    it('제목을 표시한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByText('로그인 페이지 UI 구현')).toBeInTheDocument();
    });

    it('우선순위 뱃지를 표시한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(document.querySelector('.badge--medium')).toBeInTheDocument();
    });

    it('dueDate가 있으면 종료예정일 뱃지를 표시한다', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(screen.getByText('2026-06-20')).toBeInTheDocument();
    });
  });

  describe('C001-2: 오버듀 표시', () => {
    it('isOverdue=true → .ticket-card--overdue 클래스 적용', () => {
      render(<TicketCard ticket={{ ...baseTicket, isOverdue: true }} onClick={jest.fn()} />);
      expect(document.querySelector('.ticket-card--overdue')).toBeInTheDocument();
    });

    it('isOverdue=true → dueDate 뱃지가 overdue variant로 표시된다', () => {
      render(<TicketCard ticket={{ ...baseTicket, isOverdue: true }} onClick={jest.fn()} />);
      expect(document.querySelector('.badge--overdue')).toBeInTheDocument();
    });

    it('isOverdue=false → .ticket-card--overdue 클래스 없음', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(document.querySelector('.ticket-card--overdue')).not.toBeInTheDocument();
    });
  });

  describe('C001-3: 완료 상태', () => {
    it('status=DONE → .ticket-card--done 클래스 적용', () => {
      render(<TicketCard ticket={{ ...baseTicket, status: 'DONE' }} onClick={jest.fn()} />);
      expect(document.querySelector('.ticket-card--done')).toBeInTheDocument();
    });

    it('status=DONE이 아니면 .ticket-card--done 클래스 없음', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(document.querySelector('.ticket-card--done')).not.toBeInTheDocument();
    });
  });

  describe('C001-4: 종료예정일 없는 티켓', () => {
    it('dueDate=null → 종료예정일 뱃지 미표시', () => {
      render(<TicketCard ticket={{ ...baseTicket, dueDate: null }} onClick={jest.fn()} />);
      expect(document.querySelector('.badge--due')).not.toBeInTheDocument();
      expect(document.querySelector('.badge--overdue')).not.toBeInTheDocument();
    });
  });

  describe('C001-5: 클릭 이벤트', () => {
    it('카드 클릭 → onClick 핸들러 호출', async () => {
      const onClick = jest.fn();
      render(<TicketCard ticket={baseTicket} onClick={onClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('onClick은 정확히 1회만 호출된다', async () => {
      const onClick = jest.fn();
      render(<TicketCard ticket={baseTicket} onClick={onClick} />);
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('C001-6: 긴 제목 말줄임 처리', () => {
    it('200자 제목 → 제목 요소가 .ticket-card__title 클래스를 가진다', () => {
      const longTitle = '제'.repeat(200);
      render(<TicketCard ticket={{ ...baseTicket, title: longTitle }} onClick={jest.fn()} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(document.querySelector('.ticket-card-title')).toBeInTheDocument();
    });
  });

  describe('C001-7: 우선순위 뱃지 색상', () => {
    it('priority=LOW → .badge--low 클래스 (회색)', () => {
      render(<TicketCard ticket={{ ...baseTicket, priority: 'LOW' }} onClick={jest.fn()} />);
      expect(document.querySelector('.badge--low')).toBeInTheDocument();
    });

    it('priority=MEDIUM → .badge--medium 클래스 (파란색)', () => {
      render(<TicketCard ticket={{ ...baseTicket, priority: 'MEDIUM' }} onClick={jest.fn()} />);
      expect(document.querySelector('.badge--medium')).toBeInTheDocument();
    });

    it('priority=HIGH → .badge--high 클래스 (빨간색)', () => {
      render(<TicketCard ticket={{ ...baseTicket, priority: 'HIGH' }} onClick={jest.fn()} />);
      expect(document.querySelector('.badge--high')).toBeInTheDocument();
    });
  });

  describe('isDragging prop', () => {
    it('isDragging=true → .ticket-card--dragging 클래스 적용', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} isDragging />);
      expect(document.querySelector('.ticket-card--dragging')).toBeInTheDocument();
    });

    it('isDragging 미전달 → .ticket-card--dragging 클래스 없음', () => {
      render(<TicketCard ticket={baseTicket} onClick={jest.fn()} />);
      expect(document.querySelector('.ticket-card--dragging')).not.toBeInTheDocument();
    });
  });

});
