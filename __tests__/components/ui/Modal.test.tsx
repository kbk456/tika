import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/client/components/ui/Modal';

describe('Modal', () => {

  describe('isOpen', () => {
    it('isOpen=false → 아무것도 렌더링하지 않는다', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()}>
          <p>내용</p>
        </Modal>
      );
      expect(screen.queryByText('내용')).not.toBeInTheDocument();
    });

    it('isOpen=true → 오버레이와 컨테이너를 렌더링한다', () => {
      render(
        <Modal isOpen onClose={jest.fn()}>
          <p>내용</p>
        </Modal>
      );
      expect(screen.getByText('내용')).toBeInTheDocument();
      expect(document.querySelector('.modal-overlay')).toBeInTheDocument();
      expect(document.querySelector('.modal-container')).toBeInTheDocument();
    });
  });

  describe('role=dialog', () => {
    it('모달 컨테이너에 role="dialog" 속성이 있다', () => {
      render(
        <Modal isOpen onClose={jest.fn()}>
          <p>내용</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('ESC 닫기', () => {
    it('ESC 키를 누르면 onClose가 호출된다', async () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen onClose={onClose}>
          <p>내용</p>
        </Modal>
      );
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('isOpen=false 상태에서는 ESC 키가 onClose를 호출하지 않는다', async () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen={false} onClose={onClose}>
          <p>내용</p>
        </Modal>
      );
      await userEvent.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('오버레이 클릭 닫기', () => {
    it('오버레이(.modal-overlay)를 클릭하면 onClose가 호출된다', async () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen onClose={onClose}>
          <p>내용</p>
        </Modal>
      );
      await userEvent.click(document.querySelector('.modal-overlay')!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('컨텐츠 클릭 무시', () => {
    it('모달 컨테이너 내부를 클릭해도 onClose가 호출되지 않는다', async () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen onClose={onClose}>
          <p>내용</p>
        </Modal>
      );
      await userEvent.click(screen.getByText('내용'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

});
