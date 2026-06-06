import React from 'react';
import { render, screen } from '@testing-library/react';
import TicketDetailView from '@/client/components/ticket/TicketDetailView';
import { TicketWithOverdue } from '@/shared/types';

const base: TicketWithOverdue = {
  id: 1,
  title: '테스트 티켓',
  description: null,
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: new Date('2026-06-01T00:00:00.000Z'),
  completedAt: null,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  isOverdue: false,
};

describe('TicketDetailView — TC-COMP-005 C005-2', () => {
  describe('값 있는 읽기 전용 필드 표시', () => {
    it('status(IN_PROGRESS)가 "In Progress"로 표시된다', () => {
      render(<TicketDetailView ticket={base} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('startedAt 날짜가 YYYY-MM-DD 형식으로 표시된다', () => {
      render(<TicketDetailView ticket={base} />);
      expect(screen.getByText('2026-06-01')).toBeInTheDocument();
    });

    it('createdAt 날짜가 YYYY-MM-DD 형식으로 표시된다', () => {
      render(<TicketDetailView ticket={base} />);
      expect(screen.getByText('2026-05-01')).toBeInTheDocument();
    });

    it('completedAt이 있으면 날짜로 표시된다', () => {
      const ticket = { ...base, completedAt: new Date('2026-06-10T00:00:00.000Z') };
      render(<TicketDetailView ticket={ticket} />);
      expect(screen.getByText('2026-06-10')).toBeInTheDocument();
    });
  });

  describe('null 값 → "-" 표시', () => {
    it('completedAt=null → "-"로 표시된다 (startedAt은 값 있음)', () => {
      render(<TicketDetailView ticket={base} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('startedAt=null → "-"로 표시된다', () => {
      const ticket = { ...base, startedAt: null, completedAt: new Date('2026-06-10T00:00:00.000Z') };
      render(<TicketDetailView ticket={ticket} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('startedAt, completedAt 모두 null → "-"가 2개 표시된다', () => {
      const ticket = { ...base, startedAt: null, completedAt: null };
      render(<TicketDetailView ticket={ticket} />);
      expect(screen.getAllByText('-')).toHaveLength(2);
    });
  });

  describe('.form-readonly 클래스', () => {
    it('읽기 전용 값에 .form-readonly 클래스가 적용된다', () => {
      render(<TicketDetailView ticket={base} />);
      expect(document.querySelector('.form-readonly')).toBeInTheDocument();
    });
  });

  describe('상태 레이블 표시', () => {
    it('status=BACKLOG → "Backlog" 표시', () => {
      render(<TicketDetailView ticket={{ ...base, status: 'BACKLOG' }} />);
      expect(screen.getByText('Backlog')).toBeInTheDocument();
    });

    it('status=TODO → "Todo" 표시', () => {
      render(<TicketDetailView ticket={{ ...base, status: 'TODO' }} />);
      expect(screen.getByText('Todo')).toBeInTheDocument();
    });

    it('status=DONE → "Done" 표시', () => {
      render(<TicketDetailView ticket={{ ...base, status: 'DONE' }} />);
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });
});
