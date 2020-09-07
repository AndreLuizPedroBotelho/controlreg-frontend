import styled from 'styled-components';

export const Container = styled.div`
  @media (max-width: 768px) {
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

  &:nth-child(1) {
    margin-bottom: 10px;
  }
`;

export const TitleDasboard = styled.h1`
  margin-bottom: 10px;
`;

export const Report = styled.div`
  width: 90%;
`;
