import styled, { css } from 'styled-components';

interface CollapseProps {
  open: boolean;
}

export const Container = styled.div`
  background: #fffdfd;
  margin-top: 26px;
  width: 100%;
`;

export const CollapseTitle = styled.button`
  border: 1px solid #5c5de5;
  padding: 10px;
  padding: 10px;
  text-align: left;
  background: transparent;
  width: 100%;
  background: #5c5de5;
  color: white;

  h2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export const CollapseBody = styled.div<CollapseProps>`
  border: 1px solid #5c5de5;
  border-top: 0;
  padding: 10px;

  display: ${(props) => (props.open ? 'block' : 'none')};
`;
