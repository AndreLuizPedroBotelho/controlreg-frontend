import styled, { css } from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  size: number;
}

export const Container = styled.div<ModalProps>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  visibility: hidden;
  transition: all 200ms ease-in-out;

  background: rgba(0, 0, 0, 0.5);

  ${(props) =>
    props.isOpen &&
    css`
      visibility: visible;
    `}
`;

export const Content = styled.div<ModalProps>`
  padding: 10px;
  overflow: auto;
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 20%;
  z-index: 2;
  border-radius: 10px;
  background: #fff;
  width: 60%;
  border: 1px solid #91a2af;

  ${(props) =>
    props.size &&
    css`
      height: ${props.size}%;
    `}

  @media (max-height: 700px) {
    ${(props) =>
      props.size &&
      css`
        height: 80%;
      `}
  }

  bottom: 0;
  padding: 3%;

  opacity: 0;
  transform: translateY(-100px);
  transition: all 500ms ease-in-out;

  ${(props) =>
    props.isOpen &&
    css`
      opacity: 1;
      transform: translateY(0px);
    `}
`;

export const ModalTitle = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 60px;
  width: 100%;

  h1 {
    width: 98%;
    color: #171b52;
  }
  button {
    color: black;
    background: transparent;
    border: none;
    font-size: 31px;
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 2%;
    margin-right: 2%;
  }
`;
