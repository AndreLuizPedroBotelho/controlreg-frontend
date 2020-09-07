import React, { useRef, useState, useEffect } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import { useField } from '@unform/core';
import 'react-datepicker/dist/react-datepicker.css';
import { Container } from './styles';

export enum TypeInput {
  INITIAL = 'initial',
  BASIC = 'basic',
}

interface SizeInput {
  class: string;
  input: string;
}

interface Props extends Omit<ReactDatePickerProps, 'onChange'> {
  name: string;
  label?: string;
  placeholder?: string;
  typeInput?: TypeInput;
  sizeInput: SizeInput;
  containerStyle?: object;
}

const DatePicker: React.FC<Props> = ({
  name,
  label,
  typeInput = TypeInput.INITIAL,
  sizeInput,
  placeholder,
  containerStyle,
  ...rest
}) => {
  const datepickerRef = useRef(null);
  const { fieldName, registerField, defaultValue, error } = useField(name);
  const [date, setDate] = useState(defaultValue || null);
  useEffect(() => {
    registerField({
      name: fieldName,
      ref: datepickerRef.current,
      path: 'props.selected',
      clearValue: (ref: any) => {
        ref.clear();
      },
    });
  }, [fieldName, registerField]);
  return (
    <Container
      style={containerStyle}
      sizeInput={sizeInput}
      typeInput={typeInput}
    >
      {label && <label htmlFor={fieldName}>{label}</label>}
      <ReactDatePicker
        ref={datepickerRef}
        placeholderText={placeholder}
        selected={date}
        onChange={setDate}
        dateFormat="dd/MM/yyyy"
        {...rest}
      />
    </Container>
  );
};
export default DatePicker;
