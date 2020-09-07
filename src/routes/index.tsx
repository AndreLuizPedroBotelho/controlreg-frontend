import React from 'react';
import { Switch } from 'react-router-dom';

import Route from './Route';

import SignIn from '../pages/SignIn';
import Dashboard from '../pages/Dashboard';
import User from '../pages/User';
import Product from '../pages/Product';
import Client from '../pages/Client';
import Sale from '../pages/Sale';
import Company from '../pages/Company';
import Profile from '../pages/Profile';

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={SignIn} />
    <Route path="/dashboard" component={Dashboard} isPrivate />
    <Route path="/vendedor" component={User} isPrivate isAdmin />
    <Route path="/produto" component={Product} isPrivate />
    <Route path="/cliente" component={Client} isPrivate />
    <Route path="/venda" component={Sale} isPrivate />
    <Route path="/empresa" component={Company} isPrivate isAdmin />
    <Route path="/profile" component={Profile} isPrivate />
  </Switch>
);

export default Routes;
