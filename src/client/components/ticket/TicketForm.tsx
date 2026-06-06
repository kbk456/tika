'use client';

import { useState } from 'react';
import Button from '@/client/components/ui/Button';
import { createTicketSchema } from '@/shared/validations/ticket';
import type { CreateTicketInput, UpdateTicketInput } from '@/shared/validations/ticket';
import type { Ticket } from '@/shared/types';

interface TicketFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

export default function TicketForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: TicketFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(
    initialData?.priority ?? 'MEDIUM'
  );
  const [plannedStartDate, setPlannedStartDate] = useState(
    initialData?.plannedStartDate ?? ''
  );
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title,
      description: description || undefined,
      priority,
      plannedStartDate: plannedStartDate || undefined,
      dueDate: dueDate || undefined,
    };

    const result = createTicketSchema.safeParse(data);

    if (!result.success) {
      const next: FormErrors = {};
      for (const err of result.error.errors) {
        const field = err.path[0] as keyof FormErrors;
        if (field && !next[field]) {
          next[field] = err.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  const submitLabel = mode === 'create' ? '생성' : '수정';

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* 제목 */}
      <div className="form-field">
        <label className="form-label" htmlFor="tf-title">
          제목
        </label>
        <input
          id="tf-title"
          type="text"
          className={`form-input${errors.title ? ' form-input--error' : ''}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* 설명 */}
      <div className="form-field">
        <label className="form-label" htmlFor="tf-description">
          설명
        </label>
        <textarea
          id="tf-description"
          className={`form-input form-textarea${errors.description ? ' form-input--error' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      {/* 우선순위 */}
      <div className="form-field">
        <label className="form-label" htmlFor="tf-priority">
          우선순위
        </label>
        <select
          id="tf-priority"
          className="form-input"
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
          }
          disabled={isLoading}
        >
          <option value="LOW">낮음</option>
          <option value="MEDIUM">보통</option>
          <option value="HIGH">높음</option>
        </select>
      </div>

      {/* 시작예정일 */}
      <div className="form-field">
        <label className="form-label" htmlFor="tf-planned-start-date">
          시작예정일
        </label>
        <input
          id="tf-planned-start-date"
          type="date"
          className="form-input"
          value={plannedStartDate}
          onChange={(e) => setPlannedStartDate(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* 종료예정일 */}
      <div className="form-field">
        <label className="form-label" htmlFor="tf-due-date">
          종료예정일
        </label>
        <input
          id="tf-due-date"
          type="date"
          className={`form-input${errors.dueDate ? ' form-input--error' : ''}`}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
        />
        {errors.dueDate && (
          <span className="form-error">{errors.dueDate}</span>
        )}
      </div>

      {/* 버튼 */}
      <div className="modal-footer">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
