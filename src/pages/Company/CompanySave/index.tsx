import React, { useRef, useCallback, useState } from 'react';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';

import * as Yup from 'yup';

import { gql, useMutation } from '@apollo/client';

import { Container } from './styles';

import Input, { TypeInput } from '../../../components/Input';

import Button from '../../../components/Button';

import { useModal } from '../../../hooks/modal';
import { useToast } from '../../../hooks/toast';

const CREATE_COMPANY = gql`
  mutation createCompany($name: String!) {
    createCompany(data: { name: $name }) {
      id
    }
  }
`;

const EDIT_COMPANY = gql`
  mutation updateCompany($id: Int!, $name: String!) {
    updateCompany(id: $id, data: { name: $name }) {
      id
    }
  }
`;

interface Company {
  id: string;
  name: string;
}

interface CompanyList {
  id?: number;
  name: string;
}

interface PropsCompanySave {
  refresh: (data: any) => {};
  loadCompany: (data: {}) => {};
  company: CompanyList;
  pageSize: number | string;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

interface PropsData {
  data: {
    listCompanies: {
      companies: any;
      count: number;
    };
  };
}

const CompanySave: React.FC<PropsCompanySave> = ({
  company,
  refresh,
  loadCompany,
  pageSize,
  setCount,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [listCompany] = useState(company);

  const { closeModal } = useModal();
  const { addToast } = useToast();

  const [createCompany] = useMutation(CREATE_COMPANY);

  const [editCompany] = useMutation(EDIT_COMPANY);

  const handleSubmit = useCallback(async ({ id, name }: Company, { reset }) => {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required('Nome é obrigatorio'),
      });

      let title = '';

      await schema.validate(
        { id, name },
        {
          abortEarly: false,
        },
      );
      closeModal();

      if (!id) {
        await createCompany({
          variables: {
            name,
          },
        });

        title = 'Cadastro realizado com sucesso!';
      } else {
        await editCompany({
          variables: {
            id: parseInt(id, 10),
            name,
          },
        });

        title = 'Edição realizada com sucesso!';
      }

      reset();
      closeModal();

      addToast({
        type: 'success',
        title,
        description: '',
      });

      const { data } = (await refresh({
        page: 0,
        limit: pageSize,
      })) as PropsData;

      loadCompany(data.listCompanies.companies);
      setCount(data.listCompanies.count);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        error.errors.map((err: string): any => {
          addToast({
            type: 'error',
            title: 'Erro no cadastro',
            description: err,
          });

          return err;
        });

        return;
      }
      addToast({
        type: 'error',
        title: 'Erro no cadastro',
        description: error.message.replace('GraphQL error:', ' ').trim(),
      });
    }
  }, []);

  return (
    <Container>
      <Form onSubmit={handleSubmit} ref={formRef} initialData={listCompany}>
        <Input
          id="id"
          placeholder="Id:"
          label="Id:"
          name="id"
          type="hidden"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '0%', input: '0%' }}
        />
        <Input
          id="name"
          placeholder="Digite o Nome do Empresa:"
          label="Nome da Empresa:"
          name="name"
          type="text"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '100%', input: '90%' }}
        />

        <Button type="submit">Salvar</Button>
      </Form>
    </Container>
  );
};
export default CompanySave;
