import React from 'react';
import DataTable from 'react-data-table-component';
import { Container } from './styles';

interface PropsSalesman {
  salesmans: {
    id: number;
    name: string;
    email: string;
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
const Salesman: React.FC<PropsSalesman> = ({ salesmans }) => {
  const columns = [
    {
      name: 'Código',
      selector: 'id',
      center: true,
      width: '120px',
    },
    {
      name: 'Nome',
      selector: 'name',
      center: true,
      width: '320px',
    },
    {
      name: 'Email',
      selector: 'email',
      center: true,
      width: '220px',
    },
  ];

  return (
    <Container>
      <DataTable
        noTableHead={false}
        columns={columns}
        paginationTotalRows={salesmans.length}
        data={salesmans}
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

export default Salesman;
