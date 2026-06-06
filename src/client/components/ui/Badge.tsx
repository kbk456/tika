import { TicketPriority } from '@/shared/types';

type BadgeVariant = 'low' | 'medium' | 'high' | 'due' | 'overdue';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const variant = priority.toLowerCase() as 'low' | 'medium' | 'high';
  return <Badge variant={variant}>{PRIORITY_LABEL[priority]}</Badge>;
}

export function DueDateBadge({ dueDate, isOverdue }: { dueDate: string; isOverdue: boolean }) {
  return <Badge variant={isOverdue ? 'overdue' : 'due'}>{dueDate}</Badge>;
}
