import styled from 'styled-components';

export const Container = styled.div`
  button {
    background: transparent;
    border: 0;
    opacity: 1;
    transition: opacity 0.2s;
    margin: 0 5px;
    font-size: 21px;
  }
  button:active {
    opacity: 0.5;
  }
`;

export const ButtonEdit = styled.button`
  color: #0e05a0;
`;

export const ButtonDelete = styled.button`
  color: #de3232;
`;
