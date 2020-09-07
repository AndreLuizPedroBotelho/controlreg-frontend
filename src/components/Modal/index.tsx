import React, { useCallback } from 'react';
import { MdClose } from 'react-icons/md';
import { Container, Content, ModalTitle } from './styles';
import { useModal } from '../../hooks/modal';

interface ModalProps {
  title: string;
  size: number;
}

const Modal: React.FC<ModalProps> = ({ children, title, size }) => {
  const { open, closeModal } = useModal();

  const handleCloseModal = useCallback(async () => {
    closeModal();
  }, [closeModal]);

  return (
    <Container isOpen={open} size={size}>
      <Content isOpen={open} size={size}>
        <ModalTitle>
          <h1>{title}</h1>
          <button type="button" onClick={handleCloseModal}>
            <MdClose />
          </button>
        </ModalTitle>
        {children}
      </Content>
    </Container>
  );
};

export default Modal;
