import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '@/client/components/ui/ConfirmDialog';

const defaultProps = {
  isOpen: true,
  message: '정말 삭제하시겠습니까?',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe('ConfirmDialog', () => {

  describe('메시지 표시', () => {
    it('isOpen=true → message 텍스트를 표시한다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
    });

    it('isOpen=false → 아무것도 렌더링하지 않는다', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('정말 삭제하시겠습니까?')).not.toBeInTheDocument();
    });
  });

  describe('확인 → onConfirm', () => {
    it('확인 버튼을 클릭하면 onConfirm이 호출된다', async () => {
      const onConfirm = jest.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: '확인' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('확인 버튼은 .btn--danger 스타일이다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: '확인' })).toHaveClass('btn--danger');
    });

    it('isLoading=true → 확인 버튼이 비활성화된다', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '처리중..' })).toBeDisabled();
    });
  });

  describe('취소 → onCancel', () => {
    it('취소 버튼을 클릭하면 onCancel이 호출된다', async () => {
      const onCancel = jest.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      await userEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('취소 버튼을 클릭해도 onConfirm은 호출되지 않는다', async () => {
      const onConfirm = jest.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

});
