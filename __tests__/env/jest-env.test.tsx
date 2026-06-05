import React from 'react';
import { render, screen } from '@testing-library/react';
import { TICKET_STATUS } from '@/shared/types';

describe('Jest 환경 검증', () => {
  describe('@/ 경로 별칭', () => {
    it('@/shared/types 에서 정상 import', () => {
      expect(TICKET_STATUS.BACKLOG).toBe('BACKLOG');
      expect(TICKET_STATUS.TODO).toBe('TODO');
      expect(TICKET_STATUS.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(TICKET_STATUS.DONE).toBe('DONE');
    });
  });

  describe('@testing-library/react', () => {
    it('React 컴포넌트를 렌더링할 수 있다', () => {
      render(<div data-testid="tika">Tika Board</div>);
      expect(screen.getByTestId('tika')).toBeDefined();
    });
  });

  describe('@testing-library/jest-dom 매처', () => {
    it('toBeInTheDocument 동작', () => {
      render(<span>칸반 보드</span>);
      expect(screen.getByText('칸반 보드')).toBeInTheDocument();
    });

    it('toHaveTextContent 동작', () => {
      render(<p data-testid="priority">HIGH</p>);
      expect(screen.getByTestId('priority')).toHaveTextContent('HIGH');
    });

    it('not.toBeInTheDocument 동작', () => {
      render(<div>visible</div>);
      expect(screen.queryByText('invisible')).not.toBeInTheDocument();
    });
  });

  describe('Next.js App Router 호환성', () => {
    it('next/navigation 을 import할 수 있다', async () => {
      const { useRouter, usePathname } = await import('next/navigation');
      expect(useRouter).toBeDefined();
      expect(usePathname).toBeDefined();
    });

    it('next/headers 를 import할 수 있다', async () => {
      const { headers, cookies } = await import('next/headers');
      expect(headers).toBeDefined();
      expect(cookies).toBeDefined();
    });
  });
});
