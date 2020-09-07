import React, { useCallback, useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaKey } from 'react-icons/fa';
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
  ButtonReset,
} from './styles';

import Modal from '../../components/Modal';
import Actions from '../../components/Actions';
import UserSave from './UserSave';

const LIST_USER = gql`
  query listUsers($page: Int!, $limit: Int!, $nameSearch: String) {
    listUsers(page: $page, limit: $limit, nameSearch: $nameSearch) {
      users {
        id
        name
        email
        companies {
          id
          name
        }
      }
      count
    }
  }
`;

const DELETE_USER = gql`
  mutation deleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

const RESET_PASSWORD = gql`
  mutation resetPassword($userId: Int!) {
    resetPassword(userId: $userId)
  }
`;

interface UserInterface {
  id: number;
  name: string;
  email: string;
  companies: {
    id: number;
    name: string;
  }[];
}

interface PropsData {
  data: {
    listUsers: {
      users: UserInterface[];
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

const User: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState();
  const [count, setCount] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  const [resetPaginantion, setResetPaginantion] = useState(false);
  const [paginationDefaultPage, setPaginationDefaultPage] = useState(1);

  const [userSearch, setUserSearch] = useState('');

  const { openModal, open } = useModal();
  const { addToast } = useToast();

  const [modalTitle, setModalTitle] = useState();

  const [deleteUser] = useMutation(DELETE_USER);
  const [resetPassword] = useMutation(RESET_PASSWORD);

  const { refetch, loading } = useQuery(LIST_USER, {
    variables: {
      page: 0,
      limit: 10,
      nameSearch: '',
    },
    onCompleted: async (data) => {
      setUsers(data.listUsers.users);
      setCount(data.listUsers.count);
    },
  });

  const handleEdit = useCallback(
    async ({ id, name, email, companies }: UserInterface) => {
      setUser({
        id,
        name,
        email,
        companies,
      });

      openModal();

      setModalTitle('Editar vendedor');
    },
    [openModal],
  );

  const loadUser = useCallback(async (data) => {
    setUsers(data);
  }, []);

  const handleDelete = useCallback(
    async ({ id }: UserInterface) => {
      Swal.fire({
        title: 'Confirmação',
        text: `Você quer deletar a empresa ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
      }).then(async (result) => {
        if (result.value) {
          try {
            await deleteUser({
              variables: {
                id,
              },
            });

            const { data } = (await refetch({
              page: 0,
              limit: pageSize,
            })) as PropsData;

            if (data) {
              setUsers(data.listUsers.users as any);
              setCount(data.listUsers.count);

              addToast({
                type: 'success',
                title: 'Vendedor foi deletado com sucesso!',
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

  const handleResetPassword = useCallback(
    async ({ id }: any) => {
      const resetMsg = await resetPassword({
        variables: {
          userId: id,
        },
      });

      const { resetPassword: resetMasg } = resetMsg.data;

      addToast({
        type: 'success',
        title: resetMasg,
        description: '',
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
      name: 'Email',
      selector: 'email',
      left: true,
    },
    {
      cell: (row: any) => (
        <Actions
          moreActions={
            <>
              <ButtonReset
                type="button"
                data-tip
                data-for="tooltipSalesman"
                onClick={() => handleResetPassword(row)}
              >
                <FaKey />
              </ButtonReset>
              <ReactTooltip id="tooltipSalesman" type="dark">
                <span>Resetar Senha</span>
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
    setUser({} as UserInterface);

    openModal();
    setModalTitle('Cadastrar vendedor');
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
    async function loadUserApi(): Promise<void> {
      const { data } = await refetch({
        page: (pageIndex - 1) * pageSize,
        limit: pageSize,
        nameSearch: userSearch,
      });

      if (data) {
        setUsers(data.listUsers.users as any);
        setCount(data.listUsers.count);
      }
    }

    loadUserApi();
  }, [pageIndex, pageSize, userSearch]);

  const handleChangePage = useCallback(async (page, totalRows) => {
    setPageIndex(page);
  }, []);

  const handleCompanieSearchLoad = useCallback(async (search) => {
    setUserSearch(search);
  }, []);

  const debounced = useCallback(debounce(handleCompanieSearchLoad, 500), []);

  const handleCompanieSearch = useCallback(async (evt) => {
    debounced(evt.target.value);
  }, []);

  return (
    <Container>
      <Header />

      <Content>
        <h1>Listagem de vendedor</h1>
        <h4>Filtre por nome do vendedor</h4>
        <InputDiv>
          <input
            name="inputSearch"
            placeholder="Procure por o nome de um vendedor"
            onChange={handleCompanieSearch}
          />
          <div>
            <FaSearch />
          </div>
        </InputDiv>

        <CardDiv>
          <DataTable
            noTableHead={false}
            columns={columns}
            data={users}
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
        <span>Adicionar empresa</span>
      </ReactTooltip>

      <Modal title={modalTitle} size={80}>
        {open && (
          <UserSave
            refresh={refetch}
            pageSize={pageSize}
            loadUser={loadUser}
            user={user}
            setCount={setCount}
          />
        )}
      </Modal>
    </Container>
  );
};

export default User;
