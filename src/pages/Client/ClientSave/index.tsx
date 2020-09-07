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

const CREATE_CLIENT = gql`
  mutation createClient($name: String!, $cellphone: String!) {
    createClient(data: { name: $name, cellphone: $cellphone }) {
      id
    }
  }
`;

const EDIT_CLIENT = gql`
  mutation updateClient($id: Int!, $name: String!, $cellphone: String!) {
    updateClient(id: $id, data: { name: $name, cellphone: $cellphone }) {
      id
    }
  }
`;

interface Client {
  id: string;
  name: string;
  cellphone: string;
}

interface ClientList {
  id?: number;
  name: string;
  cellphone: string;
}

interface PropsClientSave {
  refresh: (data: any) => {};
  loadClient: (data: {}) => {};
  client: ClientList;
  pageSize: number | string;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

interface PropsData {
  data: {
    listClients: {
      clients: Client;
      count: number;
    };
  };
}

const ClientSave: React.FC<PropsClientSave> = ({
  client,
  refresh,
  loadClient,
  pageSize,
  setCount,
}) => {
  const formRef = useRef<FormHandles>(null);

  const { closeModal } = useModal();
  const { addToast } = useToast();

  const [createClient] = useMutation(CREATE_CLIENT);

  const [editClient] = useMutation(EDIT_CLIENT);

  const handleSubmit = useCallback(
    async ({ id, name, cellphone }: Client, { reset }) => {
      try {
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatorio'),
          cellphone: Yup.string()
            .matches(/^(\d{8}|\d{9})$/, 'Telefone é invalido!')
            .required('Telefone é obrigatorio'),
        });

        let title = '';

        await schema.validate(
          { id, name, cellphone },
          {
            abortEarly: false,
          },
        );
        closeModal();

        if (!id) {
          await createClient({
            variables: {
              name,
              cellphone,
            },
          });

          title = 'Cadastro realizado com sucesso!';
        } else {
          await editClient({
            variables: {
              id: parseInt(id, 10),
              name,
              cellphone,
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

        loadClient(data.listClients.clients);
        setCount(data.listClients.count);
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
    },
    [],
  );

  return (
    <Container>
      {client && (
        <Form onSubmit={handleSubmit} ref={formRef} initialData={client}>
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
            placeholder="Digite o Nome do Cliente:"
            label="Nome do Cliente:"
            name="name"
            type="text"
            typeInput={TypeInput.BASIC}
            sizeInput={{ class: '100%', input: '91%' }}
          />
          <Input
            id="cellphone"
            placeholder="Digite o telefone:"
            label="Telefone:"
            name="cellphone"
            type="text"
            mask="cel-phone"
            typeInput={TypeInput.BASIC}
            sizeInput={{ class: '100%', input: '91%' }}
          />

          <Button type="submit">Salvar</Button>
        </Form>
      )}
    </Container>
  );
};
export default ClientSave;
