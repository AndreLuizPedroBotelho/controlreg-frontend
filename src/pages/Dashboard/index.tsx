import React from 'react';

import { Container, Content, Report, TitleDasboard } from './styles';

import Header from '../../components/Header';
import Collapse from '../../components/Collapse';

import ParcelExpired from './Reports/ParcelExpired';
import ProductEnded from './Reports/ProductEnded';

const Dashboard: React.FC = () => {
  return (
    <Container>
      <Header />
      <Content>
        <Report>
          <TitleDasboard>Relatórios</TitleDasboard>

          <Collapse title="Relatório parcelas vencidas">
            <ParcelExpired />
          </Collapse>
          <Collapse title="Relatório produtos que acabaram">
            <ProductEnded />
          </Collapse>
        </Report>
      </Content>
    </Container>
  );
};

export default Dashboard;
