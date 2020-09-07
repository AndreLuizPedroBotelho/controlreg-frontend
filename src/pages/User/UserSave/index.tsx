import React, { useRef, useCallback, useState } from 'react';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';

import * as Yup from 'yup';

import { gql, useMutation, useQuery } from '@apollo/client';

import Select from '../../../components/Select';

import { Container } from './styles';

import Input, { TypeInput } from '../../../components/Input';

import Button from '../../../components/Button';

import { useModal } from '../../../hooks/modal';
import { useToast } from '../../../hooks/toast';

const LIST_COMPANIES = gql`
  query listCompanies($page: Int!, $nameSearch: String) {
    listCompanies(page: $page, nameSearch: $nameSearch) {
      companies {
        id
        name
      }
    }
  }
`;

const CREATE_USER = gql`
  mutation createUser(
    $name: String!
    $email: String!
    $password: String!
    $typeUser: String!
    $companies: [Int!]
  ) {
    createUser(
      data: {
        name: $name
        email: $email
        password: $password
        typeUser: $typeUser
        companies: $companies
      }
    ) {
      id
    }
  }
`;

const EDIT_USER = gql`
  mutation updateUser(
    $id: Int!
    $name: String!
    $email: String!
    $typeUser: String!
    $companies: [Int!]
  ) {
    updateUser(
      id: $id
      data: {
        name: $name
        email: $email
        typeUser: $typeUser
        companies: $companies
      }
    ) {
      id
    }
  }
`;

interface Company {
  id: number;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  companies: [];
}

interface UserList {
  id?: number;
  name: string;
  email: string;
}

interface PropsUserSave {
  refresh: (data: any) => {};
  loadUser: (data: {}) => {};
  user: UserList;
  pageSize: number | string;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

interface PropsData {
  data: {
    listUsers: {
      users: any;
      count: number;
    };
  };
}

const UserSave: React.FC<PropsUserSave> = ({
  user,
  refresh,
  loadUser,
  pageSize,
  setCount,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [listUser] = useState(user);

  const [options, setOptions] = useState([]);

  const { closeModal } = useModal();
  const { addToast } = useToast();

  const [createUser] = useMutation(CREATE_USER);

  const [editUser] = useMutation(EDIT_USER);

  useQuery(LIST_COMPANIES, {
    variables: {
      page: 1,
      nameSearch: '',
    },
    onCompleted: (data) => {
      const optionsConverted = data.listCompanies.companies.map(
        (company: Company) => {
          return {
            value: company.id,
            label: company.name,
          };
        },
      );
      setOptions(optionsConverted);
    },
  });

  const handleSubmit = useCallback(
    async (
      { id, name, email, password, password_confirmation, companies }: User,
      { reset },
    ) => {
      try {
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatorio'),
          email: Yup.string().email().required('Email é obrigatorio'),
          companies: Yup.array().min(1, 'Empresa é obrigatorio'),
          password: Yup.string().when('id', {
            is: (value) => !value,
            then: Yup.string().required('Senha obrigatória'),
          }),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password'), null],
            'Confirmação incorreta',
          ),
        });

        let title = '';

        await schema.validate(
          { id, name, email, password, password_confirmation, companies },
          {
            abortEarly: false,
          },
        );

        if (!id) {
          await createUser({
            variables: {
              name,
              email,
              password,
              typeUser: 'salesman',
              companies,
            },
          });

          title = 'Cadastro realizado com sucesso!';
        } else {
          await editUser({
            variables: {
              id: parseInt(id, 10),
              name,
              email,
              typeUser: 'salesman',

              companies,
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

        loadUser(data.listUsers.users);
        setCount(data.listUsers.count);
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
      <Form onSubmit={handleSubmit} ref={formRef} initialData={listUser}>
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
          placeholder="Digite o Nome do vendedor:"
          label="Nome do vendedor:"
          name="name"
          type="text"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />
        <Input
          id="email"
          placeholder="Digite o email:"
          label="Email:"
          name="email"
          type="email"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />

        {!listUser.id && (
          <>
            <Input
              id="password"
              placeholder="Digite a senha:"
              label="Senha:"
              name="password"
              type="password"
              typeInput={TypeInput.BASIC}
              sizeInput={{ class: '50%', input: '90%' }}
            />
            <Input
              id="password_confirmation"
              placeholder="Digite a senha de confirmação:"
              label="Senha de confirmação:"
              name="password_confirmation"
              type="password"
              typeInput={TypeInput.BASIC}
              sizeInput={{ class: '50%', input: '90%' }}
            />
          </>
        )}

        <Select
          isMulti
          id="companies"
          name="companies"
          options={options}
          placeholder="Escolha uma Empresa"
          label="Escolha uma Empresa"
          sizeSelect={{ class: '100%', select: '80%' }}
        />

        <Button type="submit">Salvar</Button>
      </Form>
    </Container>
  );
};
export default UserSave;
