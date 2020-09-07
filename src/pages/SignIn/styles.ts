import styled from 'styled-components';
import background from '../../assets/background.png';

export const Container = styled.div`
  align-items: stretch;
  position: absolute;
  width: 100%;
  height: 100vh;
  left: 0px;
  top: 0px;
  background: linear-gradient(17.6deg, #dfe1fe -8.43%, #ffffff 85.32%);
  display: flex;
  position: fixed;

  img {
    width: 120px;
    position: absolute;
    margin: 74px 25%;
  }

  @media (max-width: 768px) {
    img {
      margin: 20px 42%;
      width: 100px;
    }
  }
`;

export const Background = styled.div`
  flex: 1;
  background: url(${background}) no-repeat center;
  background-size: cover;
  height: 100vh;
  width: 56%;

  @media (max-width: 768px) {
    width: 0%;
  }
`;

export const Content = styled.div`
  width: 44%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }

  form {
    display: flex;
    flex-direction: column;
    width: 45%;

    h1 {
      margin-bottom: 50px;
    }

    div {
      display: contents;
    }

    button {
      background: linear-gradient(269.99deg, #5d66eb -0.51%, #583ed2 99.99%);
      border: 0;
      width: 100%;
      height: 46px;
      border-radius: 6px;
      color: white;
      margin-top: 25px;
      opacity: 1;
      transition: opacity 0.2s;

      &:active {
        opacity: 0.5;
      }
    }
  }
`;
