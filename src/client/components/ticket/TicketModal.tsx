'use client';

import { useState } from 'react';
import Modal from '@/client/components/ui/Modal';
import ConfirmDialog from '@/client/components/ui/ConfirmDialog';
import Button from '@/client/components/ui/Button';
import TicketDetailView from './TicketDetailView';
import TicketForm from './TicketForm';
import type { TicketWithOverdue } from '@/shared/types';
import type { UpdateTicketInput, CreateTicketInput } from '@/shared/validations/ticket';

interface TicketModalProps {
  ticket: TicketWithOverdue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTicketInput) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export default function TicketModal({
  ticket,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isLoading,
}: TicketModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!ticket) return null;

  const handleUpdate = (data: CreateTicketInput | UpdateTicketInput) => {
    onUpdate(ticket.id, data as UpdateTicketInput);
  };

  const handleDeleteConfirm = () => {
    onDelete(ticket.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-header">
          <h2>티켓 상세</h2>
        </div>
        <div className="modal-body">
          <TicketDetailView ticket={ticket} />
          <TicketForm
            mode="edit"
            initialData={ticket}
            onSubmit={handleUpdate}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
        <div className="modal-footer">
          <Button
            variant="danger"
            size="md"
            onClick={() => setConfirmOpen(true)}
            disabled={isLoading}
          >
            삭제
          </Button>
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={confirmOpen}
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
