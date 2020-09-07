import React from 'react';
import DataTable from 'react-data-table-component';
import { Container } from './styles';

interface PropsShopping {
  sales: {
    id: number;
    price: number;
    methodPayment: string;
    clientId: number;
    productId: number;
    product: {
      name: string;
    };
    amount: number;
  }[];
}

const theme = {
  rows: {
    style: {
      fontSize: '18px',
    },

    highlightOnHoverStyle: {
      background: '#5d66eb',
      backgroundColor: '',
      borderBottomColor: '#FFFFFF',
      borderRadius: '25px',
      outline: '1px solid #FFFFFF',
      color: '#FFFFFF',
    },
  },
  headCells: {
    style: {
      fontSize: '20px',
    },
  },
};
const Shopping: React.FC<PropsShopping> = ({ sales }) => {
  const columns = [
    {
      name: 'Código',
      selector: 'id',
      center: true,
      width: '120px',
    },
    {
      name: 'Preço',
      selector: 'price',
      center: true,
      width: '220px',
      cell: (row: any) => (
        <>
          {row.price.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            style: 'currency',
            currency: 'BRL',
          })}
        </>
      ),
    },
    {
      name: 'Tipo de Pagamento',
      selector: 'methodPayment',
      center: true,
      width: '200px',
    },
    {
      name: 'Quantidade',
      selector: 'amount',
      center: true,
      width: '120px',
    },
    {
      name: 'Produto',
      selector: 'product.name',
      center: true,
      width: '320px',
    },
  ];

  return (
    <Container>
      <DataTable
        noTableHead={false}
        columns={columns}
        paginationTotalRows={sales.length}
        data={sales}
        noDataComponent="Nenhuma venda encontrada!"
        pagination
        customStyles={theme}
        pointerOnHover
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página:',
        }}
        striped
        noHeader
      />
    </Container>
  );
};

export default Shopping;
