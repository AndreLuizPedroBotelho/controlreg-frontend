import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import DataTable from 'react-data-table-component';
import { Container } from './styles';

const PARCEL_EXPIRED = gql`
  query productEnded($page: Int!, $limit: Int!) {
    productEnded(page: $page, limit: $limit) {
      products {
        id
        name
        category
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

const ProductEnded: React.FC = () => {
  const [products, setProducts] = useState();
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
      setProducts(data.productEnded.products);
      setCount(data.productEnded.count);
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
        setProducts(data.productEnded.products);
        setCount(data.productEnded.count);
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
      name: 'Nome',
      selector: 'name',
      center: true,
    },
    {
      name: 'Categoria',
      selector: 'category',
      center: true,
    },
  ];

  return (
    <Container>
      {products && (
        <DataTable
          noTableHead={false}
          columns={columns}
          data={products}
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
      )}
    </Container>
  );
};

export default ProductEnded;
