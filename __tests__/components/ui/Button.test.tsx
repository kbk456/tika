import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/client/components/ui/Button';

describe('Button', () => {

  // ─── children 렌더링 ───────────────────────────────────────────
  describe('children', () => {
    it('텍스트 children을 렌더링한다', () => {
      render(<Button>새 업무</Button>);
      expect(screen.getByRole('button', { name: '새 업무' })).toBeInTheDocument();
    });

    it('React 노드 children을 렌더링한다', () => {
      render(
        <Button>
          <span data-testid="icon">+</span>
          추가
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('추가')).toBeInTheDocument();
    });
  });

  // ─── variant CSS 클래스 ────────────────────────────────────────
  describe('variant', () => {
    it('variant="primary" → .btn--primary 클래스 적용', () => {
      render(<Button variant="primary">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--primary');
    });

    it('variant="secondary" → .btn--secondary 클래스 적용', () => {
      render(<Button variant="secondary">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--secondary');
    });

    it('variant="danger" → .btn--danger 클래스 적용', () => {
      render(<Button variant="danger">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--danger');
    });

    it('variant="ghost" → .btn--ghost 클래스 적용', () => {
      render(<Button variant="ghost">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--ghost');
    });

    it('모든 variant에 공통 .btn 클래스가 있다', () => {
      const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>버튼</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn');
        unmount();
      });
    });
  });

  // ─── 기본값 ────────────────────────────────────────────────────
  describe('기본값', () => {
    it('variant 미지정 시 .btn--primary가 기본 적용된다', () => {
      render(<Button>버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--primary');
    });

    it('size 미지정 시 .btn--md가 기본 적용된다', () => {
      render(<Button>버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--md');
    });
  });

  // ─── size CSS 클래스 ───────────────────────────────────────────
  describe('size', () => {
    it('size="sm" → .btn--sm 클래스 적용', () => {
      render(<Button size="sm">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--sm');
    });

    it('size="md" → .btn--md 클래스 적용', () => {
      render(<Button size="md">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--md');
    });

    it('size="lg" → .btn--lg 클래스 적용', () => {
      render(<Button size="lg">버튼</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--lg');
    });
  });

  // ─── onClick ──────────────────────────────────────────────────
  describe('onClick', () => {
    it('클릭 시 onClick 핸들러가 호출된다', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>버튼</Button>);

      await userEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('여러 번 클릭하면 클릭 횟수만큼 호출된다', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>버튼</Button>);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  // ─── isLoading ────────────────────────────────────────────────
  describe('isLoading', () => {
    it('isLoading=true → 버튼이 비활성화된다', () => {
      render(<Button isLoading>버튼</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('isLoading=true → "처리중.." 텍스트를 표시한다', () => {
      render(<Button isLoading>버튼</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('처리중..');
    });

    it('isLoading=true → children 대신 "처리중.."이 표시된다', () => {
      render(<Button isLoading>새 업무 만들기</Button>);
      expect(screen.queryByText('새 업무 만들기')).not.toBeInTheDocument();
      expect(screen.getByText('처리중..')).toBeInTheDocument();
    });

    it('isLoading=true → 클릭해도 onClick이 호출되지 않는다', async () => {
      const handleClick = jest.fn();
      render(<Button isLoading onClick={handleClick}>버튼</Button>);

      await userEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('isLoading=false → 버튼이 활성화 상태다', () => {
      render(<Button isLoading={false}>버튼</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

});
