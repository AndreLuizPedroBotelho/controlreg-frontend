import React, { useCallback, useRef } from 'react';
import { gql, useMutation } from '@apollo/client';

import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { useHistory } from 'react-router-dom';
import { ExecutionResult } from 'graphql';
import { useToast } from '../../hooks/toast';

import { Container, Background, Content } from './styles';

import logo from '../../assets/logo.svg';
import Input, { TypeInput } from '../../components/Input';
import { useAuth } from '../../hooks/auth';

interface SignInFormData {
  email: string;
  password: string;
}

interface SignInReturn {
  login: {
    accessToken: string;
  };
}

const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
    }
  }
`;

const SignIn: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const history = useHistory();
  const { signIn } = useAuth();
  const { addToast } = useToast();

  const [loginUser] = useMutation(LOGIN_USER);

  const handleSubmit = useCallback(
    async ({ email, password }: SignInFormData) => {
      try {
        const result = (await loginUser({
          variables: { email, password },
        })) as ExecutionResult<any>;

        const { login }: SignInReturn = result?.data;

        await signIn(login.accessToken);

        if (login.accessToken) {
          history.push('/dashboard');
        }
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Erro no cadastro',
          description: err.message.replace('GraphQL error:', ' ').trim(),
        });
      }
    },
    [addToast, history, loginUser, signIn],
  );

  return (
    <Container>
      <Background />
      <img src={logo} alt="logo" />

      <Content>
        <Form onSubmit={handleSubmit} ref={formRef}>
          <h1>
            Olá,
            <br /> Seja bem vindo
          </h1>

          <Input
            id="email"
            label="DIGITE SEU EMAIL:"
            name="email"
            type="email"
            typeInput={TypeInput.INITIAL}
            sizeInput={{ class: '100%', input: '100%' }}
          />

          <Input
            id="password"
            label="DIGITE SUA SENHA:"
            type="password"
            name="password"
            typeInput={TypeInput.INITIAL}
            sizeInput={{ class: '100%', input: '100%' }}
          />

          <button type="submit">Login</button>
        </Form>
      </Content>
    </Container>
  );
};

export default SignIn;
