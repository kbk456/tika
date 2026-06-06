import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="modal-body">
        <p>{message}</p>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" size="md" onClick={onCancel}>
          취소
        </Button>
        <Button variant="danger" size="md" isLoading={isLoading} onClick={onConfirm}>
          확인
        </Button>
      </div>
    </Modal>
  );
}
