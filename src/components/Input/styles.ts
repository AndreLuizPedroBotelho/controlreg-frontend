import styled, { css } from 'styled-components';

const inputType = {
  initial: css`
    border: 0;
    border-bottom: 1px solid #5d66eb;
    background: transparent;
    height: 40px;
    font-size: 20px;
    color: #5d66eb;
  `,
  basic: css`
    border: 1px solid hsl(0, 0%, 80%);
    background: #f2f5f8;
    height: 40px;
    font-size: 20px;
    padding: 24px;
    margin: 0 20px 40px 0;
    border-radius: 4px;
  `,
};

interface SizeInput {
  class: string;
  input: string;
}

interface InputProps {
  typeInput: 'initial' | 'basic';
  sizeInput: SizeInput;
}

export const Container = styled.div<InputProps>`
  ${(props) =>
    props.sizeInput.class &&
    css`
      width: ${props.sizeInput.class};
    `}

  label {
    color: #5d66eb;
    display: block;

    ${(props) =>
      props.typeInput === 'basic' &&
      css`
        font-size: 21px;
        color: #171b52;
      `};
  }

  input {
    ${(props) => inputType[props.typeInput || 'initial']}

    ${(props) =>
      props.sizeInput.input &&
      css`
        width: ${props.sizeInput.input};
      `}
  }

  input:focus {
    border: 1px solid #2684ff;
  }
`;
