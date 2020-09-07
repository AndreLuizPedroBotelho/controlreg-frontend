import React, { useCallback, useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaShoppingBasket } from 'react-icons/fa';
import { gql, useQuery, useMutation } from '@apollo/client';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ReactTooltip from 'react-tooltip';
import { debounce } from 'lodash';

import Header from '../../components/Header';

import { useModal } from '../../hooks/modal';
import { useToast } from '../../hooks/toast';

import {
  Container,
  Content,
  InputDiv,
  CardDiv,
  ButtonAdd,
  ButtonShopping,
} from './styles';

import Modal from '../../components/Modal';
import Actions from '../../components/Actions';
import ClientSave from './ClientSave';
import Shopping from './Shopping';

const LIST_CLIENT = gql`
  query listClients($page: Int!, $limit: Int!, $nameSearch: String) {
    listClients(page: $page, limit: $limit, nameSearch: $nameSearch) {
      clients {
        id
        name
        cellphone
        sales {
          id
          price
          methodPayment
          clientId
          productId
          product {
            name
          }
          amount
        }
      }
      count
    }
  }
`;

const DELETE_CLIENT = gql`
  mutation deleteClient($id: Int!) {
    deleteClient(id: $id)
  }
`;

interface ClientInterface {
  id: number;
  name: string;
  cellphone: string;
  sales?: {
    id: number;
    name: string;
  };
}

interface PropsData {
  data: {
    listClients: {
      clients: ClientInterface[];
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

const Client: React.FC = () => {
  const [clients, setClients] = useState([]);
  const [count, setCount] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  const [typeModal, setTypeModal] = useState('form');
  const [salesClient, setSalesClient] = useState([]);

  const [resetPaginantion, setResetPaginantion] = useState(false);
  const [paginationDefaultPage, setPaginationDefaultPage] = useState(1);

  const [client, setClient] = useState<ClientInterface>({} as ClientInterface);

  const [clientSearch, setClientSearch] = useState('');

  const { openModal, open } = useModal();
  const { addToast } = useToast();

  const [modalTitle, setModalTitle] = useState();

  const [deleteClient] = useMutation(DELETE_CLIENT);

  const { refetch, loading } = useQuery(LIST_CLIENT, {
    variables: {
      page: 0,
      limit: 10,
      nameSearch: '',
    },
    onCompleted: async (data) => {
      setClients(data.listClients.clients);
      setCount(data.listClients.count);
    },
  });

  const handleEdit = useCallback(
    async ({ id, name, cellphone }: ClientInterface) => {
      setTypeModal('form');

      setClient({
        id,
        name,
        cellphone,
      });

      openModal();

      setModalTitle('Editar cliente');
    },
    [openModal],
  );

  const handleShopping = useCallback(
    async ({ sales, name }: ClientInterface) => {
      setClient({} as ClientInterface);

      setModalTitle(`Compras - ${name}`);
      setTypeModal('shopping');

      setSalesClient(sales as any);

      openModal();
    },
    [openModal],
  );

  const loadClient = useCallback(async (data) => {
    setClients(data);
  }, []);

  const convertCellPhone = useCallback((cellphone: string) => {
    if (cellphone.length === 9) {
      return `${cellphone.slice(0, 5)}-${cellphone.slice(5)}`;
    }

    return `${cellphone.slice(0, 4)}-${cellphone.slice(4)}`;
  }, []);

  const handleDelete = useCallback(
    async ({ id }: ClientInterface) => {
      Swal.fire({
        title: 'Confirmação',
        text: `Você quer deletar o cliente ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
      }).then(async (result) => {
        if (result.value) {
          try {
            await deleteClient({
              variables: {
                id,
              },
            });

            const { data } = (await refetch({
              page: 0,
              limit: pageSize,
            })) as PropsData;

            if (data) {
              setClients(data.listClients.clients as any);
              setCount(data.listClients.count);

              addToast({
                type: 'success',
                title: 'Cliente foi deletado com sucesso!',
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
      left: true,
    },

    {
      name: 'Telefone',
      selector: 'cellphone',
      center: true,
      maxWidth: '230px',
      cell: (row: any) => <>{convertCellPhone(row.cellphone)}</>,
    },
    {
      cell: (row: any) => (
        <Actions
          moreActions={
            <>
              <ButtonShopping
                type="button"
                data-tip
                data-for="tooltipShopping"
                onClick={() => handleShopping(row)}
              >
                <FaShoppingBasket />
              </ButtonShopping>
              <ReactTooltip id="tooltipShopping" type="dark">
                <span>Visualizar Compras</span>
              </ReactTooltip>
            </>
          }
          handleEdit={handleEdit}
          data={row}
          handleDelete={handleDelete}
        />
      ),
      allowOverflow: true,
      button: true,
      width: '100px',
      name: '',
    },
  ];

  const handleOpenModalSave = useCallback(async () => {
    setClient({} as ClientInterface);
    setTypeModal('form');

    openModal();
    setModalTitle('Cadastrar cliente');
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
    async function loadClientApi(): Promise<void> {
      const { data } = await refetch({
        page: (pageIndex - 1) * pageSize,
        limit: pageSize,
        nameSearch: clientSearch,
      });

      if (data) {
        setClients(data.listClients.clients as any);
        setCount(data.listClients.count);
      }
    }

    loadClientApi();
  }, [pageIndex, pageSize, clientSearch]);

  const handleChangePage = useCallback(async (page, totalRows) => {
    setPageIndex(page);
  }, []);

  const handleClientSearchLoad = useCallback(async (search) => {
    setClientSearch(search);
  }, []);

  const debounced = useCallback(debounce(handleClientSearchLoad, 500), []);

  const handleClienteSearch = useCallback(async (evt) => {
    debounced(evt.target.value);
  }, []);

  return (
    <Container>
      <Header />

      <Content>
        <h1>Listagem de cliente</h1>
        <h4>Filtre por nome do cliente</h4>
        <InputDiv>
          <input
            name="inputSearch"
            placeholder="Procure por o nome de um cliente"
            onChange={handleClienteSearch}
          />
          <div>
            <FaSearch />
          </div>
        </InputDiv>

        <CardDiv>
          <DataTable
            noTableHead={false}
            columns={columns}
            data={clients}
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
        </CardDiv>
      </Content>

      <ButtonAdd onClick={handleOpenModalSave} data-tip data-for="tooltipAdd">
        <FaPlus />
      </ButtonAdd>

      <ReactTooltip id="tooltipAdd" type="dark">
        <span>Adicionar cliente</span>
      </ReactTooltip>

      {typeModal !== 'form' ? (
        <Modal title={modalTitle} size={80}>
          {open && <Shopping sales={salesClient} />}
        </Modal>
      ) : (
        <Modal title={modalTitle} size={60}>
          {open && (
            <ClientSave
              refresh={refetch}
              pageSize={pageSize}
              loadClient={loadClient}
              client={client}
              setCount={setCount}
            />
          )}
        </Modal>
      )}
    </Container>
  );
};

export default Client;
