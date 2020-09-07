import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Container = styled.div`
  background: linear-gradient(269.74deg, #5d66eb -0.51%, #583ed2 99.99%);
  height: 50px;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;

  img {
    width: 31px;
    margin-right: 22px;
    margin-left: 20px;
  }

  align-items: center;

  button {
    color: white;
    background: transparent;
    border: none;
    font-size: 21px;
  }
`;

export const LinkHref = styled(Link)`
  margin: 0 10px;
  &:link,
  &:visited,
  &:hover {
    text-decoration: none;
    color: #f9f9f9;
  }

  &:active {
    color: #c7c6c6;
  }

  &.activated {
    font-weight: bold;
  }
`;

export const DivButton = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  flex-direction: row-reverse;
  button {
    margin-right: 24px;
  }
`;
