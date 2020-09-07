import React, { InputHTMLAttributes, useEffect, useRef } from 'react';
import { useField } from '@unform/core';
import { IconBaseProps } from 'react-icons';
import TextInputMask from 'react-masked-text';

import { Container } from './styles';

export enum TypeInput {
  INITIAL = 'initial',
  BASIC = 'basic',
}

interface SizeInput {
  class: string;
  input: string;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  containerStyle?: object;
  label?: string;
  typeInput?: TypeInput;
  sizeInput: SizeInput;
  icon?: React.ComponentType<IconBaseProps>;
  mask?: 'money' | 'only-numbers' | 'cel-phone';
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  containerStyle = {},
  icon: Icon,
  typeInput = TypeInput.INITIAL,
  sizeInput,
  mask,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  const optionMask = {
    money: {
      options: { unit: '' },
    },
    'only-numbers': {
      options: {},
    },
    'cel-phone': {
      options: {
        withDDD: false,
      },
    },
  };

  useEffect(() => {
    if (mask) {
      registerField({
        name: fieldName,
        ref: inputRef.current,
        getValue(ref: any) {
          return ref.getRawValue();
        },
      });
    } else {
      registerField({
        name: fieldName,
        path: 'value',
        ref: inputRef.current,
      });
    }
  }, [fieldName, registerField]);

  return (
    <Container
      style={containerStyle}
      sizeInput={sizeInput}
      typeInput={typeInput}
    >
      {label && rest.type !== 'hidden' && (
        <label htmlFor={fieldName}>{label}</label>
      )}
      {Icon && <Icon size={20} />}

      {!mask ? (
        <input
          id={fieldName}
          ref={inputRef}
          defaultValue={defaultValue}
          {...rest}
        />
      ) : (
        <TextInputMask
          kind={mask}
          id={fieldName}
          ref={inputRef}
          defaultValue={defaultValue}
          options={optionMask[mask].options}
          {...rest}
        />
      )}

      {error && <span>{error}</span>}
    </Container>
  );
};

export default Input;
