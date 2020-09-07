import styled, { css } from 'styled-components';

export const Container = styled.div``;

export const PaidButton = styled.button`
  background: transparent;
  border: 0;
  font-size: 19px;
  &.paid {
    svg {
      color: green;
    }
  }
  &.notPaid {
    svg {
      color: red;
    }
  }
`;

interface DateSaleProps {
  isExpired: boolean;
}

export const DateSaleDiv = styled.div<DateSaleProps>`
  ${(props) =>
    props.isExpired &&
    css`
      color: red;
    `}
`;
