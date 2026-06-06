import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketModal from '@/client/components/ticket/TicketModal';
import { TicketWithOverdue } from '@/shared/types';

const sampleTicket: TicketWithOverdue = {
  id: 42,
  title: '샘플 티켓',
  description: '샘플 설명',
  status: 'TODO',
  priority: 'MEDIUM',
  position: 1,
  plannedStartDate: '2026-07-01',
  dueDate: '2026-07-15',
  startedAt: new Date('2026-06-10T00:00:00.000Z'),
  completedAt: null,
  createdAt: new Date('2026-05-15T00:00:00.000Z'),
  updatedAt: new Date('2026-05-15T00:00:00.000Z'),
  isOverdue: false,
};

const defaultProps = {
  ticket: sampleTicket,
  isOpen: true,
  onClose: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  isLoading: false,
};

describe('TicketModal — TC-COMP-005', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── C005-1: 열기/닫기 ──────────────────────────────────────────
  describe('C005-1: 열기/닫기', () => {
    it('isOpen=false → dialog가 렌더링되지 않는다', () => {
      render(<TicketModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpen=true → dialog가 렌더링된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isOpen=true → 티켓 제목이 표시된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByDisplayValue('샘플 티켓')).toBeInTheDocument();
    });
  });

  // ─── C005-2: 읽기 전용 필드 표시 ────────────────────────────────
  describe('C005-2: 읽기 전용 필드 표시 (TicketDetailView)', () => {
    it('상태가 표시된다 (Todo)', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByText('Todo')).toBeInTheDocument();
    });

    it('startedAt 날짜가 표시된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByText('2026-06-10')).toBeInTheDocument();
    });

    it('completedAt=null → "-"로 표시된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('createdAt 날짜가 표시된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByText('2026-05-15')).toBeInTheDocument();
    });
  });

  // ─── C005-3: 편집 가능 필드 ─────────────────────────────────────
  describe('C005-3: 편집 가능 필드 (TicketForm edit 모드)', () => {
    it('title 필드가 initialData로 채워진다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByLabelText('제목')).toHaveValue('샘플 티켓');
    });

    it('"수정" 제출 버튼이 렌더링된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    });

    it('수정 폼 제출 → onUpdate(id, data) 호출', async () => {
      render(<TicketModal {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: '수정' }));
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        sampleTicket.id,
        expect.objectContaining({ title: '샘플 티켓' })
      );
    });
  });

  // ─── C005-4: ESC 닫기 ────────────────────────────────────────────
  describe('C005-4: ESC 닫기', () => {
    it('ESC 키 → onClose 호출', async () => {
      render(<TicketModal {...defaultProps} />);
      await userEvent.keyboard('{Escape}');
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── C005-5: 바깥 클릭 닫기 ─────────────────────────────────────
  describe('C005-5: 오버레이 클릭 닫기', () => {
    it('오버레이 클릭 → onClose 호출', async () => {
      render(<TicketModal {...defaultProps} />);
      await userEvent.click(document.querySelector('.modal-overlay')!);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── C005-6: 삭제 확인 2단계 ─────────────────────────────────────
  describe('C005-6: 삭제 2단계 확인', () => {
    it('"삭제" 버튼이 렌더링된다', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    it('삭제 버튼 클릭 → ConfirmDialog가 열린다 ("확인" 버튼 표시)', async () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });

    it('ConfirmDialog 확인 → onDelete(id) 호출', async () => {
      const onDelete = jest.fn();
      render(<TicketModal {...defaultProps} onDelete={onDelete} />);
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      await userEvent.click(screen.getByRole('button', { name: '확인' }));
      expect(onDelete).toHaveBeenCalledWith(sampleTicket.id);
    });

    it('ConfirmDialog 취소 → ConfirmDialog 닫힘, onDelete 미호출', async () => {
      const onDelete = jest.fn();
      render(<TicketModal {...defaultProps} onDelete={onDelete} />);
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));

      // ConfirmDialog 안의 '취소' 버튼 클릭 (메시지 텍스트로 dialog 특정)
      const confirmMsg = screen.getByText('정말 삭제하시겠습니까?');
      const confirmContainer = confirmMsg.closest('[role="dialog"]') as HTMLElement;
      await userEvent.click(within(confirmContainer).getByRole('button', { name: '취소' }));

      expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  // ─── isLoading 상태 ──────────────────────────────────────────────
  describe('isLoading 상태', () => {
    it('isLoading=true → 수정 버튼이 "처리중.."으로 변경된다', () => {
      render(<TicketModal {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '처리중..' })).toBeDisabled();
    });

    it('isLoading=true → 삭제 버튼이 비활성화된다', () => {
      render(<TicketModal {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
    });
  });
});
