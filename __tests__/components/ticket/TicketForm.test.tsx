import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketForm from '@/client/components/ticket/TicketForm';
import { Ticket } from '@/shared/types';

// ─── 날짜 헬퍼 ────────────────────────────────────────────────────
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const thirtyDaysLater = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

// ─── 공통 Props / Mock Data ───────────────────────────────────────
const defaultProps = {
  mode: 'create' as const,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  isLoading: false,
};

const sampleInitialData: Partial<Ticket> = {
  title: '기존 티켓 제목',
  description: '기존 설명',
  priority: 'HIGH',
  plannedStartDate: '2026-07-01',
  dueDate: '2026-07-15',
};

describe('TicketForm — TC-COMP-004', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── C004-1: 빈 폼 렌더링 (생성 모드) ──────────────────────────
  describe('C004-1: 빈 폼 렌더링 (생성 모드)', () => {
    it('title 입력 필드가 비어있다', () => {
      render(<TicketForm {...defaultProps} />);
      expect(screen.getByLabelText('제목')).toHaveValue('');
    });

    it('priority select의 기본값이 MEDIUM이다', () => {
      render(<TicketForm {...defaultProps} />);
      expect(screen.getByLabelText('우선순위')).toHaveValue('MEDIUM');
    });

    it('description textarea가 비어있다', () => {
      render(<TicketForm {...defaultProps} />);
      expect(screen.getByLabelText('설명')).toHaveValue('');
    });

    it('"생성" 제출 버튼이 렌더링된다', () => {
      render(<TicketForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
    });

    it('"취소" 버튼이 렌더링된다', () => {
      render(<TicketForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  // ─── C004-2: 기존 데이터 표시 (수정 모드) ───────────────────────
  describe('C004-2: 기존 데이터 표시 (수정 모드)', () => {
    const editProps = {
      ...defaultProps,
      mode: 'edit' as const,
      initialData: sampleInitialData,
    };

    it('initialData.title이 title 필드에 반영된다', () => {
      render(<TicketForm {...editProps} />);
      expect(screen.getByLabelText('제목')).toHaveValue('기존 티켓 제목');
    });

    it('initialData.description이 description 필드에 반영된다', () => {
      render(<TicketForm {...editProps} />);
      expect(screen.getByLabelText('설명')).toHaveValue('기존 설명');
    });

    it('initialData.priority가 select에 반영된다', () => {
      render(<TicketForm {...editProps} />);
      expect(screen.getByLabelText('우선순위')).toHaveValue('HIGH');
    });

    it('initialData.dueDate가 종료예정일 필드에 반영된다', () => {
      render(<TicketForm {...editProps} />);
      expect(screen.getByLabelText('종료예정일')).toHaveValue('2026-07-15');
    });

    it('initialData.plannedStartDate가 시작예정일 필드에 반영된다', () => {
      render(<TicketForm {...editProps} />);
      expect(screen.getByLabelText('시작예정일')).toHaveValue('2026-07-01');
    });

    it('"수정" 제출 버튼이 렌더링된다', () => {
      render(<TicketForm {...editProps} />);
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    });
  });

  // ─── C004-3: 제목 검증 ──────────────────────────────────────────
  describe('C004-3: 제목 검증', () => {
    it('빈 제목으로 제출 → "제목을 입력해주세요" 에러 표시', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(await screen.findByText('제목을 입력해주세요')).toBeInTheDocument();
    });

    it('공백만인 제목으로 제출 → "제목을 입력해주세요" 에러', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText('제목'), '   ');
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(await screen.findByText('제목을 입력해주세요')).toBeInTheDocument();
    });

    it('빈 제목 제출 → onSubmit 호출 안 됨', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('200자 초과 제목 → "제목은 200자 이내로 입력해주세요" 에러', async () => {
      render(<TicketForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText('제목'), {
        target: { value: 'A'.repeat(201) },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(await screen.findByText('제목은 200자 이내로 입력해주세요')).toBeInTheDocument();
    });

    it('200자 초과 제목 → onSubmit 호출 안 됨', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText('제목'), {
        target: { value: 'A'.repeat(201) },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ─── C004-4: 과거 종료예정일 검증 ───────────────────────────────
  describe('C004-4: 과거 종료예정일 검증', () => {
    it('과거 날짜 입력 후 제출 → "종료예정일은 오늘 이후 날짜를 선택해주세요" 에러', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText('제목'), '유효한 제목');
      fireEvent.change(screen.getByLabelText('종료예정일'), {
        target: { value: yesterday() },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(
        await screen.findByText('종료예정일은 오늘 이후 날짜를 선택해주세요')
      ).toBeInTheDocument();
    });

    it('과거 날짜 입력 → onSubmit 호출 안 됨', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('제목'), '유효한 제목');
      fireEvent.change(screen.getByLabelText('종료예정일'), {
        target: { value: yesterday() },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ─── C004-5: 시작예정일 필드 존재 ───────────────────────────────
  describe('C004-5: 시작예정일(plannedStartDate) 필드 존재', () => {
    it('생성 모드에서 date input으로 렌더링된다', () => {
      render(<TicketForm {...defaultProps} />);
      const input = screen.getByLabelText('시작예정일');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'date');
    });

    it('수정 모드에서도 date input으로 렌더링된다', () => {
      render(<TicketForm {...defaultProps} mode="edit" initialData={sampleInitialData} />);
      const input = screen.getByLabelText('시작예정일');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'date');
    });
  });

  // ─── C004-6: 정상 제출 ──────────────────────────────────────────
  describe('C004-6: 정상 제출', () => {
    it('유효한 제목 입력 후 제출 → onSubmit 1회 호출', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('제목'), '새 티켓 제목');
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('제출 데이터에 입력한 title이 포함된다', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('제목'), '새 티켓 제목');
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: '새 티켓 제목' })
      );
    });

    it('priority 변경 후 제출 → 변경된 priority가 onSubmit에 전달된다', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('제목'), '제목');
      await userEvent.selectOptions(screen.getByLabelText('우선순위'), 'HIGH');
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'HIGH' })
      );
    });

    it('미래 dueDate 입력 후 제출 → dueDate가 onSubmit에 포함된다', async () => {
      const onSubmit = jest.fn();
      const future = thirtyDaysLater();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('제목'), '제목');
      fireEvent.change(screen.getByLabelText('종료예정일'), {
        target: { value: future },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ dueDate: future })
      );
    });

    it('취소 버튼 클릭 → onCancel 호출', async () => {
      const onCancel = jest.fn();
      render(<TicketForm {...defaultProps} onCancel={onCancel} />);
      await userEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ─── C004-7: 로딩 상태 ──────────────────────────────────────────
  describe('C004-7: 로딩 상태 (isLoading=true)', () => {
    it('제출 버튼이 비활성화되고 "처리중.." 텍스트로 변경된다', () => {
      render(<TicketForm {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '처리중..' })).toBeDisabled();
    });

    it('isLoading=false → 제출 버튼 활성화 상태', () => {
      render(<TicketForm {...defaultProps} isLoading={false} />);
      expect(screen.getByRole('button', { name: '생성' })).toBeEnabled();
    });
  });

  // ─── 설명 필드 검증 (createTicketSchema 기반) ────────────────────
  describe('설명 필드 검증', () => {
    it('1000자 초과 설명 → "설명은 1000자 이내로 입력해주세요" 에러', async () => {
      render(<TicketForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText('제목'), '제목');
      fireEvent.change(screen.getByLabelText('설명'), {
        target: { value: 'A'.repeat(1001) },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(await screen.findByText('설명은 1000자 이내로 입력해주세요')).toBeInTheDocument();
    });

    it('1000자 이하 설명 → onSubmit 정상 호출', async () => {
      const onSubmit = jest.fn();
      render(<TicketForm {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('제목'), '제목');
      fireEvent.change(screen.getByLabelText('설명'), {
        target: { value: 'A'.repeat(1000) },
      });
      await userEvent.click(screen.getByRole('button', { name: '생성' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
