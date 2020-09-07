import styled from 'styled-components';

export const Container = styled.div`
  @media (max-width: 600px) {
    width: 112vh;
  }
`;

export const Content = styled.div`
  margin: 3% 5%;
  h1,
  h4 {
    color: #171b52;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: normal;
  }
`;

export const CardDiv = styled.div`
  width: 100%;

  margin-top: 10px;
`;

export const ButtonAdd = styled.button`
  display: flex;
  margin-right: 14px;
  padding: 20px;
  border-radius: 36px;
  border: 0;
  color: white;
  background: linear-gradient(211.58deg, #583ed3 14.86%, #5d66eb 85.2%);
  margin-bottom: 10px;
  position: fixed;
  bottom: 0;
  right: 0;
  opacity: 1;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.5;
  }
`;

export const InputDiv = styled.div`
  display: inline-block;
  padding: 4px;
  width: 100%;
  display: flex;
  position: relative;

  input {
    width: 100%;
    margin: 15px 0;
    padding: 8px;
    height: 50px;
    border-radius: 5px;
    border: 1px solid #91a2af;
    background: #f2f5f8;
  }

  div {
    display: flex;
    justify-content: center;
    position: absolute;
    align-items: center;
    width: 57px;
    height: 50px;
    margin: 15px 0;
    border-radius: 5px;
    right: 0;
    background: linear-gradient(269.98deg, #5d66eb -0.51%, #583ed2 99.99%);
    svg {
      color: #ffffff;
    }
  }
`;

export const ButtonReset = styled.button`
  color: #676767;
`;
