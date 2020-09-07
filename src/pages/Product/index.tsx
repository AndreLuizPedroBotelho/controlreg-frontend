import React, { useCallback, useState, useEffect } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { gql, useQuery, useMutation } from '@apollo/client';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ReactTooltip from 'react-tooltip';
import { debounce } from 'lodash';

import Header from '../../components/Header';

import { useModal } from '../../hooks/modal';
import { useToast } from '../../hooks/toast';

import { Container, Content, InputDiv, CardDiv, ButtonAdd } from './styles';

import Modal from '../../components/Modal';
import Actions from '../../components/Actions';
import ProductSave from './ProductSave';

const LIST_PRODUCT = gql`
  query listProducts($page: Int!, $limit: Int!, $nameSearch: String) {
    listProducts(page: $page, limit: $limit, nameSearch: $nameSearch) {
      products {
        id
        name
        price
        amount
        category
        company {
          id
          name
        }
      }
      count
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation deleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

interface ProductInterface {
  id: number;
  name: string;
  price: string;
  amount: number;
  category: string;
  company?: {
    id: number;
    name: string;
  };
  companyId?: number;
}

interface PropsData {
  data: {
    listProducts: {
      products: ProductInterface[];
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

const Product: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  const [resetPaginantion, setResetPaginantion] = useState(false);
  const [paginationDefaultPage, setPaginationDefaultPage] = useState(1);

  const [product, setProduct] = useState<ProductInterface>(
    {} as ProductInterface,
  );

  const [productSearch, setProductSearch] = useState('');

  const { openModal, open } = useModal();
  const { addToast } = useToast();

  const [modalTitle, setModalTitle] = useState();

  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const { refetch, loading } = useQuery(LIST_PRODUCT, {
    variables: {
      page: 0,
      limit: 10,
      nameSearch: '',
    },
    onCompleted: async (data) => {
      setProducts(data.listProducts.products);
      setCount(data.listProducts.count);
    },
  });

  const handleEdit = useCallback(
    async ({
      id,
      name,
      category,
      price,
      company,
      amount,
    }: ProductInterface) => {
      setProduct({} as ProductInterface);

      openModal();

      setProduct({
        id,
        name,
        category,
        price: parseFloat(price).toFixed(2),
        companyId: company?.id,
        amount,
      });

      setModalTitle('Editar produto');
    },
    [openModal],
  );

  const loadProduct = useCallback(async (data) => {
    setProducts(data);
  }, []);

  const handleDelete = useCallback(
    async ({ id }: ProductInterface) => {
      Swal.fire({
        title: 'Confirmação',
        text: `Você quer deletar o produto ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
      }).then(async (result) => {
        if (result.value) {
          try {
            await deleteProduct({
              variables: {
                id,
              },
            });

            const { data } = (await refetch({
              page: 0,
              limit: pageSize,
            })) as PropsData;

            if (data) {
              setProducts(data.listProducts.products as any);
              setCount(data.listProducts.count);

              addToast({
                type: 'success',
                title: 'Produto foi deletado com sucesso!',
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
      name: 'Quantidade',
      selector: 'amount',
      center: true,
      width: '120px',
    },
    {
      name: 'Categoria',
      selector: 'category',
      center: true,
      width: '240px',
    },
    {
      name: 'Empresa',
      selector: 'company.name',
      center: true,
      maxWidth: '230px',
    },
    {
      cell: (row: any) => (
        <Actions
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
    setProduct({} as ProductInterface);
    openModal();
    setModalTitle('Cadastrar produto');
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
    async function loadProductApi(): Promise<void> {
      const { data } = await refetch({
        page: (pageIndex - 1) * pageSize,
        limit: pageSize,
        nameSearch: productSearch,
      });

      if (data) {
        setProducts(data.listProducts.products as any);
        setCount(data.listProducts.count);
      }
    }

    loadProductApi();
  }, [pageIndex, pageSize, productSearch]);

  const handleChangePage = useCallback(async (page, totalRows) => {
    setPageIndex(page);
  }, []);

  const handleProductSearchLoad = useCallback(async (search) => {
    setProductSearch(search);
  }, []);

  const debounced = useCallback(debounce(handleProductSearchLoad, 500), []);

  const handleProdutoSearch = useCallback(async (evt) => {
    debounced(evt.target.value);
  }, []);

  return (
    <Container>
      <Header />

      <Content>
        <h1>Listagem de produto</h1>
        <h4>Filtre por nome do produto</h4>
        <InputDiv>
          <input
            name="inputSearch"
            placeholder="Procure por o nome de um produto"
            onChange={handleProdutoSearch}
          />
          <div>
            <FaSearch />
          </div>
        </InputDiv>

        <CardDiv>
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
        </CardDiv>
      </Content>

      <ButtonAdd onClick={handleOpenModalSave} data-tip data-for="tooltipAdd">
        <FaPlus />
      </ButtonAdd>

      <ReactTooltip id="tooltipAdd" type="dark">
        <span>Adicionar produto</span>
      </ReactTooltip>

      <Modal title={modalTitle} size={80}>
        {open && (
          <ProductSave
            refresh={refetch}
            pageSize={pageSize}
            loadProduct={loadProduct}
            product={product}
            setCount={setCount}
          />
        )}
      </Modal>
    </Container>
  );
};

export default Product;
