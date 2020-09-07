import styled from 'styled-components';

export const Container = styled.div`
  @media (max-width: 600px) {
    width: 112vh;
  }
`;
export const Title = styled.h1`
  color: #171b52;
  font-weight: normal;
`;
export const Content = styled.div`
  margin: 40px 10%;
  form {
    margin-top: 30px;
    display: flex;
    width: 100%;
    align-items: center;
    flex-wrap: wrap;
    max-width: 100%;
  }
`;
