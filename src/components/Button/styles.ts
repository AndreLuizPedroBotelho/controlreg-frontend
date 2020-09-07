import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 5%;
  bottom: 20px;
  right: 5%;

  button {
    background: #5d66eb;
    border-radius: 5px;
    color: #ffffff;
    width: 178px;
    height: 50px;
    left: 888px;
    top: 592px;
    border: 0;
    opacity: 1;
    transition: opacity 0.2s;
  }

  button:active {
    opacity: 0.5;
  }
`;
