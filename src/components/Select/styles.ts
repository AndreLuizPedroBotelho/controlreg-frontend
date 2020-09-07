import styled, { css } from 'styled-components';

import Select from 'react-select';

interface SizeInput {
  class: string;
  select: string;
}

interface SelectProps {
  sizeSelect: SizeInput;
}

export const Container = styled.div<SelectProps>`
  label {
    margin-top: 30px;

    font-size: 21px;
    color: #171b52;
  }

  ${(props) =>
    props.sizeSelect.class &&
    css`
      width: ${props.sizeSelect.class};
    `}

  &:nth-child(1n) {
    margin: 0px 0px 40px 0;
  }

  & .react-select__control {
    background: #f2f5f8;
    height: 51px;

    ${(props) =>
      props.sizeSelect.select &&
      css`
        width: ${props.sizeSelect.select};
      `}
  }

  & .react-select__menu {
    ${(props) =>
      props.sizeSelect.select &&
      css`
        width: ${props.sizeSelect.select};
      `}
  }
`;

export const ReactSelect = styled(Select)``;
