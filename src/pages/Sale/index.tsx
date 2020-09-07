import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPlus, FaCheck, FaBan } from 'react-icons/fa';
import { gql, useQuery, useMutation } from '@apollo/client';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ReactTooltip from 'react-tooltip';
import { debounce } from 'lodash';

import { format } from 'date-fns';
import Header from '../../components/Header';

import { useModal } from '../../hooks/modal';
import { useToast } from '../../hooks/toast';

import {
  Container,
  Content,
  InputDiv,
  CardDiv,
  ButtonAdd,
  PaidButton,
} from './styles';

import Modal from '../../components/Modal';
import Actions from '../../components/Actions';
import SaleSave from './SaleSave';
import ParcelSale from './ParcelSale';

const LIST_SALE = gql`
  query listSales($page: Int!, $limit: Int!, $nameSearch: String) {
    listSales(page: $page, limit: $limit, nameSearch: $nameSearch) {
      sales {
        id
        price
        dateSale
        methodPayment
        paid
        client {
          id
          name
        }
        product {
          id
          name
        }
        parcelSales {
          id
          price
          parcelNumber
          maturityDate
          paid
        }
      }
      count
    }
  }
`;

const DELETE_SALE = gql`
  mutation deleteSale($id: Int!) {
    deleteSale(id: $id)
  }
`;

const PAID_SALE = gql`
  mutation paidSale($saleId: Int!, $paid: Boolean!) {
    paidSale(saleId: $saleId, paid: $paid)
  }
`;

interface SaleInterface {
  id: number;
  name: string;
  price: string;
  dateSale: string;
  amount: number;
  category: string;
}

interface PropsData {
  data: {
    listSales: {
      sales: SaleInterface[];
      count: number;
    };
  };
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

const Sale: React.FC = () => {
  const [sales, setSales] = useState([]);
  const [count, setCount] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  const [resetPaginantion, setResetPaginantion] = useState(false);
  const [paginationDefaultPage, setPaginationDefaultPage] = useState(1);

  const [sale, setSale] = useState<SaleInterface>({} as SaleInterface);

  const [saleSearch, setSaleSearch] = useState('');
  const [load, setLoad] = useState();

  const { openModal, open } = useModal();
  const { addToast } = useToast();

  const [modalTitle, setModalTitle] = useState();

  const [deleteSale] = useMutation(DELETE_SALE);

  const [paidSale] = useMutation(PAID_SALE);

  const { refetch, loading } = useQuery(LIST_SALE, {
    variables: {
      page: 0,
      limit: 10,
      nameSearch: '',
    },
    onCompleted: async (data) => {
      setSales(data.listSales.sales);
      setCount(data.listSales.count);
    },
  });

  const loadSale = useCallback(async (data) => {
    setSales(data);
  }, []);

  const handleDelete = useCallback(
    async ({ id }: SaleInterface) => {
      Swal.fire({
        title: 'Confirmação',
        text: `Você quer deletar a venda ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
      }).then(async (result) => {
        if (result.value) {
          try {
            await deleteSale({
              variables: {
                id,
              },
            });

            const { data } = (await refetch({
              page: 0,
              limit: pageSize,
            })) as PropsData;

            if (data) {
              setSales(data.listSales.sales as any);
              setCount(data.listSales.count);

              addToast({
                type: 'success',
                title: 'Venda foi deletada com sucesso!',
                description: '',
              });
            }
          } catch (err) {
            addToast({
              type: 'error',
              title: 'Erro no cadastro',
              description: err.message.replace('GraphQL error:', ' ').trim(),
            });
          }
        }
      });
    },
    [openModal],
  );

  const handleLoad = useCallback(async () => {
    setLoad(true);
  }, []);

  const handlePaidSale = useCallback(async (saleRow: any, paid: boolean) => {
    Swal.fire({
      title: 'Confirmação',
      text: `Você quer pagar essa conta?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    }).then(async (result) => {
      if (result.value) {
        try {
          const returnMsg: any = await paidSale({
            variables: {
              saleId: parseInt(saleRow.id, 10),
              paid: !paid,
            },
          });

          await handleLoad();
          addToast({
            type: 'success',
            title: returnMsg.data.paidSale,
            description: '',
          });
        } catch (err) {
          addToast({
            type: 'error',
            title: 'Erro no cadastro',
            description: err.message.replace('GraphQL error:', ' ').trim(),
          });
        }
      }
    });
  }, []);

  const methodPaymentReturn = useCallback((methodPayment: any) => {
    const methodsPayments: any = {
      cartão: 'Cartão',
      avista: 'Á vista',
      parcelado: 'Parcelado',
    };

    return methodsPayments[methodPayment];
  }, []);

  const columns = [
    {
      name: 'Código',
      selector: 'id',
      center: true,
      width: '120px',
    },
    {
      name: 'Cliente',
      selector: 'client.name',
      left: true,
    },

    {
      name: 'Produto',
      selector: 'product.name',
      left: true,
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
      name: 'Data da venda',
      selector: 'dateSale',
      center: true,
      width: '150px',
      cell: (row: any) => (
        <>{String(format(new Date(row.dateSale), 'dd/MM/yyyy'))}</>
      ),
    },

    {
      name: 'Método de pagamento',
      selector: 'methodPayment',
      center: true,
      width: '220px',
      cell: (row: any) => <>{methodPaymentReturn(row.methodPayment)}</>,
    },

    {
      name: 'Pago',
      cell: (row: any) => (
        <PaidButton
          className={row.paid === 'true' ? 'paid' : 'notPaid'}
          onClick={() => handlePaidSale(row, row.paid === 'true')}
        >
          {row.paid === 'true' ? <FaCheck /> : <FaBan />}
        </PaidButton>
      ),
      center: true,
      width: '100px',
    },
    {
      cell: (row: any) => <Actions data={row} handleDelete={handleDelete} />,
      allowOverflow: true,
      button: true,
      width: '100px',
      name: '',
    },
  ];
  const isExpanded = (row: any): any => row.defaultExpanded;

  const handleOpenModalSave = useCallback(async () => {
    setSale({} as SaleInterface);
    openModal();
    setModalTitle('Cadastrar venda');
  }, [openModal]);

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
        nameSearch: saleSearch,
      });

      if (data) {
        setSales(data.listSales.sales as any);
        setCount(data.listSales.count);
        setLoad(false);
      }
    }

    loadSaleApi();
  }, [pageIndex, pageSize, saleSearch, load]);

  const handleChangePage = useCallback(async (page) => {
    setPageIndex(page);
  }, []);

  const handleSaleSearchLoad = useCallback(async (search) => {
    setSaleSearch(search);
  }, []);

  const debounced = useCallback(debounce(handleSaleSearchLoad, 500), []);

  const handleSaleSearch = useCallback(async (evt) => {
    debounced(evt.target.value);
  }, []);

  return (
    <Container>
      <Header />

      <Content>
        <h1>Listagem de venda</h1>
        <h4>Filtre por nome do cliente</h4>
        <InputDiv>
          <input
            name="inputSearch"
            placeholder="Procure por o nome de um cliente"
            onChange={handleSaleSearch}
          />
          <div>
            <FaSearch />
          </div>
        </InputDiv>

        <CardDiv>
          {sales && (
            <DataTable
              noTableHead={false}
              columns={columns}
              data={sales}
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
              expandableRows
              expandableRowExpanded={isExpanded}
              expandableRowsComponent={<ParcelSale handleLoad={handleLoad} />}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página:',
              }}
              striped
              noHeader
            />
          )}
        </CardDiv>
      </Content>

      <ButtonAdd onClick={handleOpenModalSave} data-tip data-for="tooltipAdd">
        <FaPlus />
      </ButtonAdd>

      <ReactTooltip id="tooltipAdd" type="dark">
        <span>Criar Venda</span>
      </ReactTooltip>

      <Modal title={modalTitle} size={80}>
        {open && (
          <SaleSave
            refresh={refetch}
            pageSize={pageSize}
            loadSale={loadSale}
            sale={sale}
            setCount={setCount}
          />
        )}
      </Modal>
    </Container>
  );
};

export default Sale;
