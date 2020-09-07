import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';

import * as Yup from 'yup';

import { gql, useQuery, useMutation } from '@apollo/client';

import { Container } from './styles';

import Input, { TypeInput } from '../../../components/Input';

import Select from '../../../components/Select';
import Button from '../../../components/Button';

import { useModal } from '../../../hooks/modal';
import { useToast } from '../../../hooks/toast';
import { useAuth } from '../../../hooks/auth';

const LIST_COMPANIES = gql`
  query listCompanies($page: Int!, $nameSearch: String) {
    listCompanies(page: $page, nameSearch: $nameSearch) {
      companies {
        id
        name
      }
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation createProduct(
    $name: String!
    $price: Float!
    $amount: Int!
    $category: String!
    $companyId: Int!
  ) {
    createProduct(
      data: {
        name: $name
        price: $price
        amount: $amount
        category: $category
        companyId: $companyId
      }
    ) {
      id
    }
  }
`;

const EDIT_PRODUCT = gql`
  mutation updateProduct(
    $id: Int!
    $name: String!
    $price: Float!
    $amount: Int!
    $category: String!
    $companyId: Int!
  ) {
    updateProduct(
      id: $id
      data: {
        name: $name
        price: $price
        amount: $amount
        category: $category
        companyId: $companyId
      }
    ) {
      id
    }
  }
`;

interface Company {
  id: number;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  amount: string;
  category: string;
  companyId: string;
}

interface ProductList {
  id?: number;
  name: string;
  price: string;
  amount: number;
  category: string;
  companyId?: number;
}

interface PropsProductSave {
  refresh: (data: any) => {};
  loadProduct: (data: {}) => {};
  product: ProductList;
  pageSize: number | string;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

interface PropsData {
  data: {
    listProducts: {
      products: any;
      count: number;
    };
  };
}

const ProductSave: React.FC<PropsProductSave> = ({
  product,
  refresh,
  loadProduct,
  pageSize,
  setCount,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [options, setOptions] = useState([]);
  const [listProduct] = useState(product);

  const { closeModal } = useModal();
  const { addToast } = useToast();
  const { getUser } = useAuth();

  const loadOptions = useCallback((data: any) => {
    const optionsConverted = data.companies.map((company: Company) => {
      return {
        value: company.id,
        label: company.name,
      };
    });

    setOptions(optionsConverted);
  }, []);

  useQuery(LIST_COMPANIES, {
    variables: {
      page: 0,
      nameSearch: '',
    },
    onCompleted: (data) => {
      loadOptions(data.listCompanies);
    },
  });

  useEffect(() => {
    if (getUser.typeUser !== 'admin') {
      loadOptions(getUser);
    }
  }, []);

  const [createProduct] = useMutation(CREATE_PRODUCT);

  const [editProduct] = useMutation(EDIT_PRODUCT);

  const handleSubmit = useCallback(
    async (
      { id, name, price, amount, category, companyId }: Product,
      { reset },
    ) => {
      try {
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatorio'),
          price: Yup.string()
            .matches(
              /(?=.*\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|0)?(\.\d{1,2})?$/,
              'Preço esta invalido!',
            )
            .required('Preço é obrigatorio'),
          amount: Yup.number()
            .min(1, 'Quantidade tem que ser maior que 0!')
            .required('Quantidade é obrigatorio')
            .typeError('Quantidade esta invalido !'),
          category: Yup.string()
            .max(128, 'O limite maximo é de 128 caracteres')
            .required('Categoria é obrigatorio'),
          companyId: Yup.number()
            .integer('Empresa é invalido!')
            .required('Empresa é obrigatorio')
            .typeError('Empresa esta invalida !'),
        });

        let title = '';

        await schema.validate(
          { id, name, price, amount, category, companyId },
          {
            abortEarly: false,
          },
        );
        closeModal();

        if (!id) {
          await createProduct({
            variables: {
              name,
              price: parseFloat(price),
              amount: parseInt(amount, 10),
              category,
              companyId: parseInt(companyId, 10),
            },
          });

          title = 'Cadastro realizado com sucesso!';
        } else {
          await editProduct({
            variables: {
              id: parseInt(id, 10),
              name,
              price: parseFloat(price),
              amount: parseInt(amount, 10),
              category,
              companyId: parseInt(companyId, 10),
            },
          });

          title = 'Edição realizada com sucesso!';
        }

        reset();
        closeModal();

        addToast({
          type: 'success',
          title,
          description: '',
        });

        const { data } = (await refresh({
          page: 0,
          limit: pageSize,
        })) as PropsData;

        loadProduct(data.listProducts.products);
        setCount(data.listProducts.count);
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          error.errors.map((err: string): any => {
            addToast({
              type: 'error',
              title: 'Erro no cadastro',
              description: err,
            });

            return err;
          });

          return;
        }
        addToast({
          type: 'error',
          title: 'Erro no cadastro',
          description: error.message.replace('GraphQL error:', ' ').trim(),
        });
      }
    },
    [],
  );

  return (
    <Container>
      <Form onSubmit={handleSubmit} ref={formRef} initialData={listProduct}>
        <Input
          id="id"
          placeholder="Id:"
          label="Id:"
          name="id"
          type="hidden"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '0%', input: '0%' }}
        />
        <Input
          id="name"
          placeholder="Digite o Nome do Produto:"
          label="Nome do Produto:"
          name="name"
          type="text"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />
        <Input
          id="amount"
          placeholder="Digite a quantidade:"
          label="Quantidade:"
          name="amount"
          type="text"
          mask="only-numbers"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />
        <Input
          id="price"
          placeholder="Digite o Preço:"
          label="Preço:"
          name="price"
          mask="money"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />
        <Input
          id="category"
          placeholder="Digite a Categoria:"
          label="Categoria:"
          name="category"
          type="text"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />

        <Select
          id="companyId"
          name="companyId"
          options={options}
          placeholder="Escolha uma Empresa"
          label="Escolha uma Empresa"
          sizeSelect={{ class: '50%', select: '90%' }}
        />

        <Button type="submit">Salvar</Button>
      </Form>
    </Container>
  );
};
export default ProductSave;
