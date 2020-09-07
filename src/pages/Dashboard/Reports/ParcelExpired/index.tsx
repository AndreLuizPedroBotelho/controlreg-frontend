import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import { Container } from './styles';

const PARCEL_EXPIRED = gql`
  query parcelExpired($page: Int!, $limit: Int!) {
    parcelExpired(page: $page, limit: $limit) {
      parcelSales {
        id
        price
        maturityDate
        sale {
          client {
            name
          }
        }
      }
      count
    }
  }
`;
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

const ParcelExpired: React.FC = () => {
  const [parcels, setParcels] = useState();
  const [count, setCount] = useState(0);

  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(1);

  const [resetPaginantion, setResetPaginantion] = useState(false);
  const [paginationDefaultPage, setPaginationDefaultPage] = useState(1);

  const { refetch, loading } = useQuery(PARCEL_EXPIRED, {
    variables: {
      page: 0,
      limit: 5,
    },
    onCompleted: async (data) => {
      setParcels(data.parcelExpired.parcelSales);
      setCount(data.parcelExpired.count);
    },
  });

  const handleChangeRowsPerPage = useCallback(
    async (currentRowsPerPage, currentPage) => {
      setPaginationDefaultPage(1);

      setResetPaginantion(true);

      setPageSize(currentRowsPerPage);
    },
    [],
  );

  useEffect(() => {
    async function loadSaleApi(): Promise<void> {
      const { data } = await refetch({
        page: (pageIndex - 1) * pageSize,
        limit: pageSize,
      });

      if (data) {
        setParcels(data.parcelExpired.parcelSales);
        setCount(data.parcelExpired.count);
      }
    }

    loadSaleApi();
  }, [pageIndex, pageSize]);

  const handleChangePage = useCallback(async (page) => {
    setPageIndex(page);
  }, []);

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
      width: '300px',
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
      name: 'Data Pagamento Vencida',
      selector: 'maturityDate',
      center: true,
      cell: (row: any) => (
        <>{String(format(new Date(row.maturityDate), 'dd/MM/yyyy'))}</>
      ),
    },
    {
      name: 'Nome do Cliente',
      selector: 'sale.client.name',
      center: true,
    },
  ];

  return (
    <Container>
      {parcels && (
        <DataTable
          noTableHead={false}
          columns={columns}
          data={parcels}
          noDataComponent="Nenhum registro encontrado!"
          pagination
          progressPending={loading}
          paginationServer
          customStyles={theme}
          onChangePage={handleChangePage}
          paginationResetDefaultPage={resetPaginantion}
          paginationDefaultPage={paginationDefaultPage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          highlightOnHover
          paginationPerPage={pageSize}
          paginationTotalRows={count}
          pointerOnHover
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página:',
          }}
          striped
          noHeader
        />
      )}{' '}
    </Container>
  );
};

export default ParcelExpired;
