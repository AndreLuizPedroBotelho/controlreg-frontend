import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OptionTypeBase, Props as SelectProps } from 'react-select';
import { useField } from '@unform/core';
import makeAnimated from 'react-select/animated';
import { Container, ReactSelect } from './styles';

const animatedComponents = makeAnimated();

interface SizeInput {
  class: string;
  select: string;
}

interface Props extends SelectProps<OptionTypeBase> {
  name: string;
  sizeSelect: SizeInput;
  label: string;
  options: any;
}

const Select: React.FC<Props> = ({
  name,
  label,
  options,
  sizeSelect,
  ...rest
}) => {
  const selectRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  const [valueSelect, setValueSelect] = useState([]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef,
      getValue: (ref: any) => {
        if (rest.isMulti) {
          if (!ref.current.state.value) {
            return [];
          }

          return ref.current.state.value.map(
            (option: OptionTypeBase) => option.value,
          );
        }

        if (ref.current.select.state.selectValue.length <= 0) {
          return '';
        }

        return ref.current.select.state.selectValue[0].value;
      },
    });
  }, [fieldName, registerField, rest.isMulti, options]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (defaultValue) {
      if (!rest.isMulti) {
        return setValueSelect(
          options.filter(({ value }: any) => value === defaultValue),
        );
      }

      return setValueSelect(
        options.filter(
          ({ value }: any) =>
            defaultValue.filter(({ id }: any) => id === value).length > 0,
        ),
      );
    }
  }, [options]);

  return (
    <Container sizeSelect={sizeSelect}>
      {label && <label htmlFor={fieldName}>{label}</label>}

      {(valueSelect.length > 0 || !defaultValue) && (
        <ReactSelect
          cacheOptions
          noOptionsMessage={() => 'Nenhuma opção encontrada'}
          ref={selectRef}
          defaultValue={valueSelect}
          options={options}
          components={animatedComponents}
          classNamePrefix="react-select"
          {...rest}
        />
      )}
      {error && <span>{error}</span>}
    </Container>
  );
};

export default Select;
