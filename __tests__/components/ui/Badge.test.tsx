import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '@/client/components/ui/Badge';

describe('Badge', () => {

  describe('공통', () => {
    it('모든 variant에 공통 .badge 클래스가 있다', () => {
      const variants = ['low', 'medium', 'high', 'due', 'overdue'] as const;
      variants.forEach((variant) => {
        const { unmount } = render(<Badge variant={variant}>텍스트</Badge>);
        expect(screen.getByText('텍스트')).toHaveClass('badge');
        unmount();
      });
    });

    it('children 텍스트를 렌더링한다', () => {
      render(<Badge variant="medium">MEDIUM</Badge>);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });

  describe('PriorityBadge — 우선순위 variant', () => {
    it('variant="low" → .badge--low 클래스 적용', () => {
      render(<Badge variant="low">LOW</Badge>);
      expect(screen.getByText('LOW')).toHaveClass('badge--low');
    });

    it('variant="medium" → .badge--medium 클래스 적용', () => {
      render(<Badge variant="medium">MEDIUM</Badge>);
      expect(screen.getByText('MEDIUM')).toHaveClass('badge--medium');
    });

    it('variant="high" → .badge--high 클래스 적용', () => {
      render(<Badge variant="high">HIGH</Badge>);
      expect(screen.getByText('HIGH')).toHaveClass('badge--high');
    });
  });

  describe('DueDateBadge — 날짜 variant', () => {
    it('variant="due" → .badge--due 클래스 적용', () => {
      render(<Badge variant="due">2026-06-20</Badge>);
      expect(screen.getByText('2026-06-20')).toHaveClass('badge--due');
    });

    it('variant="overdue" → .badge--overdue 클래스 적용', () => {
      render(<Badge variant="overdue">기한 초과</Badge>);
      expect(screen.getByText('기한 초과')).toHaveClass('badge--overdue');
    });
  });

});
