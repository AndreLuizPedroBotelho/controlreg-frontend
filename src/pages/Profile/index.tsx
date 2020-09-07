import React, { useRef, useCallback } from 'react';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import { gql, useMutation } from '@apollo/client';

import { Container, Content, Title } from './styles';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Input, { TypeInput } from '../../components/Input';
import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  companies: [];
}

const EDIT_USER = gql`
  mutation updateUser(
    $id: Int!
    $name: String!
    $email: String!
    $typeUser: String!
    $password: String!
  ) {
    updateUser(
      id: $id
      data: {
        name: $name
        email: $email
        typeUser: $typeUser
        password: $password
      }
    ) {
      id
    }
  }
`;

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const { getUser } = useAuth();

  const [editUser] = useMutation(EDIT_USER);

  const handleSubmit = useCallback(
    async (
      { id, name, email, password, password_confirmation }: User,
      { reset },
    ) => {
      try {
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatorio'),
          email: Yup.string().email().required('Email é obrigatorio'),
          password: Yup.string().when('id', {
            is: (value) => !value,
            then: Yup.string().required('Senha obrigatória'),
          }),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password'), null],
            'Confirmação incorreta',
          ),
        });

        await schema.validate(
          { id, name, email, password, password_confirmation },
          {
            abortEarly: false,
          },
        );

        await editUser({
          variables: {
            id: parseInt(id, 10),
            name,
            email,
            password,

            typeUser: getUser.typeUser,
          },
        });

        addToast({
          type: 'success',
          title: 'Ação só será efetuada quando for efetuado o login novamente!',
        });
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
      <Header />
      <Content>
        <Title>Edição de Perfil</Title>
        <Form onSubmit={handleSubmit} ref={formRef} initialData={getUser}>
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

          <Input
            id="password"
            placeholder="Digite a nova senha:"
            label="Nova Senha:"
            name="password"
            type="password"
            typeInput={TypeInput.BASIC}
            sizeInput={{ class: '50%', input: '90%' }}
          />
          <Input
            id="password_confirmation"
            placeholder="Digite a senha de confirmação:"
            label="Senha de confirmação :"
            name="password_confirmation"
            type="password"
            typeInput={TypeInput.BASIC}
            sizeInput={{ class: '50%', input: '90%' }}
          />

          <Button type="submit">Salvar</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Profile;
