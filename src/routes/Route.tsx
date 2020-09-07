import React from 'react';
import {
  Route as ReactDomRoute,
  RouteProps as ReactDomRouteProps,
  Redirect,
} from 'react-router-dom';

import { useAuth } from '../hooks/auth';

interface RouteProps extends ReactDomRouteProps {
  isPrivate?: boolean;
  isAdmin?: boolean;
  component: React.ComponentType;
}

const Route: React.FC<RouteProps> = ({
  component: Component,
  isPrivate = false,
  isAdmin = false,
  ...rest
}) => {
  const { token, typeUser } = useAuth();

  const isSigned = !!token;

  const isPermitted = isAdmin && typeUser !== 'admin';

  return (
    <ReactDomRoute
      {...rest}
      render={({ location }) => {
        if (isPrivate !== isSigned || isPermitted) {
          return (
            <Redirect
              to={{
                pathname: isPrivate ? '/' : 'dashboard',
                state: { from: location },
              }}
            />
          );
        }

        return <Component />;
      }}
    />
  );
};

export default Route;
