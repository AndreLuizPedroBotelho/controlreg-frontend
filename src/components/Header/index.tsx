import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { FaSignOutAlt, FaUserEdit } from 'react-icons/fa';
import logoHome from '../../assets/logo-home.png';

import { Container, DivButton, LinkHref } from './styles';
import { useAuth } from '../../hooks/auth';

const Header: React.FC = () => {
  const history = useHistory();
  const { signOut, typeUser } = useAuth();

  const path = window.location.pathname;

  const handleLogout = useCallback(async () => {
    signOut();
    history.push('/');
  }, [history, signOut]);

  const handleReset = useCallback(async () => {
    history.push('/profile');
  }, []);

  return (
    <Container>
      <img src={logoHome} alt="ControlReg" />
      <LinkHref
        className={path === '/dashboard' ? 'activated' : 'disabled'}
        to="dashboard"
      >
        Dashboard
      </LinkHref>
      {typeUser === 'admin' && (
        <LinkHref
          className={path === '/empresa' ? 'activated' : 'disabled'}
          to="empresa"
        >
          Empresa
        </LinkHref>
      )}
      <LinkHref
        className={path === '/produto' ? 'activated' : 'disabled'}
        to="produto"
      >
        Produto
      </LinkHref>
      <LinkHref
        className={path === '/cliente' ? 'activated' : 'disabled'}
        to="cliente"
      >
        Cliente
      </LinkHref>
      <LinkHref
        className={path === '/venda' ? 'activated' : 'disabled'}
        to="venda"
      >
        Venda
      </LinkHref>
      {typeUser === 'admin' && (
        <LinkHref
          className={path === '/vendedor' ? 'activated' : 'disabled'}
          to="vendedor"
        >
          Vendedor
        </LinkHref>
      )}

      <DivButton>
        <button type="button" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
        <button type="button" onClick={handleReset}>
          <FaUserEdit />
        </button>
      </DivButton>
    </Container>
  );
};

export default Header;
