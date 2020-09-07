import React, { useCallback, useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaRegIdCard } from 'react-icons/fa';
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
  ButtonSalesman,
} from './styles';

import Modal from '../../components/Modal';
import Actions from '../../components/Actions';
import CompanySave from './CompanySave';
import Salesman from './Salesman';

const LIST_COMPANY = gql`
  query listCompanies($page: Int!, $limit: Int!, $nameSearch: String) {
    listCompanies(page: $page, limit: $limit, nameSearch: $nameSearch) {
      companies {
        id
        name
        users {
          id
          name
          email
        }
      }
      count
    }
  }
`;

const DELETE_COMPANY = gql`
  mutation deleteCompany($id: Int!) {
    deleteCompany(id: $id)
  }
`;

interface CompanyInterface {
  id: number;
  name: string;
}

interface PropsData {
  data: {
    listCompanies: {
      companies: CompanyInterface[];
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

const Company: React.FC = () => {
  const [companies, setCompanies] = useState([]);
  const [count, setCount] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  const [typeModal, setTypeModal] = useState('form');
  const [salesmans, setSalesmans] = useState([]);

  const [resetPaginantion, setResetPaginantion] = useState(false);
  const [paginationDefaultPage, setPaginationDefaultPage] = useState(1);

  const [company, setCompany] = useState<CompanyInterface>(
    {} as CompanyInterface,
  );

  const [companieSearch, setCompanieSearch] = useState('');

  const { openModal, open } = useModal();
  const { addToast } = useToast();

  const [modalTitle, setModalTitle] = useState();

  const [deleteCompany] = useMutation(DELETE_COMPANY);

  const { refetch, loading } = useQuery(LIST_COMPANY, {
    variables: {
      page: 0,
      limit: 10,
      nameSearch: '',
    },
    onCompleted: async (data) => {
      setCompanies(data.listCompanies.companies);
      setCount(data.listCompanies.count);
    },
  });

  const handleEdit = useCallback(
    async ({ id, name }: CompanyInterface) => {
      setTypeModal('form');

      setCompany({
        id,
        name,
      });

      openModal();

      setModalTitle('Editar empresa');
    },
    [openModal],
  );

  const handleSalesman = useCallback(
    async ({ users, name }: any) => {
      setCompany({} as CompanyInterface);

      setModalTitle(`Vendedores - ${name}`);
      setTypeModal('salesman');

      setSalesmans(users as any);

      openModal();
    },
    [openModal],
  );

  const loadCompany = useCallback(async (data) => {
    setCompanies(data);
  }, []);

  const handleDelete = useCallback(
    async ({ id }: CompanyInterface) => {
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
            await deleteCompany({
              variables: {
                id,
              },
            });

            const { data } = (await refetch({
              page: 0,
              limit: pageSize,
            })) as PropsData;

            if (data) {
              setCompanies(data.listCompanies.companies as any);
              setCount(data.listCompanies.count);

              addToast({
                type: 'success',
                title: 'Empresa foi deletado com sucesso!',
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
      cell: (row: any) => (
        <Actions
          moreActions={
            <>
              <ButtonSalesman
                type="button"
                data-tip
                data-for="tooltipSalesman"
                onClick={() => handleSalesman(row)}
              >
                <FaRegIdCard />
              </ButtonSalesman>
              <ReactTooltip id="tooltipSalesman" type="dark">
                <span>Visualizar Vendedores</span>
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
    setCompany({} as CompanyInterface);
    setTypeModal('form');

    openModal();
    setModalTitle('Cadastrar empresa');
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
    async function loadCompanyApi(): Promise<void> {
      const { data } = await refetch({
        page: (pageIndex - 1) * pageSize,
        limit: pageSize,
        nameSearch: companieSearch,
      });

      if (data) {
        setCompanies(data.listCompanies.companies as any);
        setCount(data.listCompanies.count);
      }
    }

    loadCompanyApi();
  }, [pageIndex, pageSize, companieSearch]);

  const handleChangePage = useCallback(async (page, totalRows) => {
    setPageIndex(page);
  }, []);

  const handleCompanieSearchLoad = useCallback(async (search) => {
    setCompanieSearch(search);
  }, []);

  const debounced = useCallback(debounce(handleCompanieSearchLoad, 500), []);

  const handleCompanieSearch = useCallback(async (evt) => {
    debounced(evt.target.value);
  }, []);

  return (
    <Container>
      <Header />

      <Content>
        <h1>Listagem de empresa</h1>
        <h4>Filtre por nome do empresa</h4>
        <InputDiv>
          <input
            name="inputSearch"
            placeholder="Procure por o nome de um empresa"
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
            data={companies}
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

      {typeModal !== 'form' ? (
        <Modal title={modalTitle} size={80}>
          {open && <Salesman salesmans={salesmans} />}
        </Modal>
      ) : (
        <Modal title={modalTitle} size={40}>
          {open && (
            <CompanySave
              refresh={refetch}
              pageSize={pageSize}
              loadCompany={loadCompany}
              company={company}
              setCount={setCount}
            />
          )}
        </Modal>
      )}
    </Container>
  );
};

export default Company;
