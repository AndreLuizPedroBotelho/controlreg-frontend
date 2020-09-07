import React, { useRef, useCallback, useState, useEffect } from 'react';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';

import * as Yup from 'yup';

import { gql, useMutation, useQuery } from '@apollo/client';

import Select from '../../../components/Select';

import { Container } from './styles';

import Input, { TypeInput } from '../../../components/Input';

import Button from '../../../components/Button';
import DatePicker from '../../../components/DatePicker';

import { useModal } from '../../../hooks/modal';
import { useToast } from '../../../hooks/toast';

const CREATE_SALE = gql`
  mutation createSale(
    $price: Float!
    $methodPayment: String!
    $amount: Int!
    $dateSale: DateTime!
    $clientId: Int!
    $productId: Int!
  ) {
    createSale(
      data: {
        price: $price
        methodPayment: $methodPayment
        amount: $amount
        dateSale: $dateSale
        clientId: $clientId
        productId: $productId
      }
    ) {
      id
    }
  }
`;

const LIST_CLIENT_PRODUCT = gql`
  query($page: Int!, $nameSearch: String) {
    listClients(page: $page, nameSearch: $nameSearch) {
      clients {
        id
        name
      }
    }

    listProducts(page: $page, nameSearch: $nameSearch) {
      products {
        id
        name
      }
    }
  }
`;

interface Company {
  id: number;
  name: string;
}

interface Sale {
  id: string;
  price: string;
  amount: string;
  dateSale: string;
  methodPayment: string;
  clientId?: number;
  productId?: number;
}

interface SaleList {
  id: number;
  price: string;
  amount: number;
  dateSale: string;
  company?: {
    id: number;
    name: string;
  };
  companyId?: number;
}

interface PropsSaleSave {
  refresh: (data: any) => {};
  loadSale: (data: {}) => {};
  sale: SaleList;
  pageSize: number | string;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

interface PropsData {
  data: {
    listSales: {
      sales: any;
      count: number;
    };
  };
}

const SaleSave: React.FC<PropsSaleSave> = ({
  sale,
  refresh,
  loadSale,
  pageSize,
  setCount,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [listSale] = useState(sale);

  const [optionsMethodPayment] = useState([
    {
      value: 'cartão',
      label: 'Cartão',
    },
    {
      value: 'avista',
      label: 'A vista',
    },
    {
      value: 'parcelado',
      label: 'Parcelado',
    },
  ]);

  const [optionsClient, setOptionsClient] = useState([]);
  const [optionsProduct, setOptionsProduct] = useState([]);

  const [visibleAmount, setVisibleAmount] = useState(true);

  useQuery(LIST_CLIENT_PRODUCT, {
    variables: {
      page: 0,
      nameSearch: '',
    },
    onCompleted: async (data) => {
      const optionsClientConverted = data.listClients.clients.map(
        (client: Company) => {
          return {
            value: client.id,
            label: client.name,
          };
        },
      );

      const optionsProductConverted = data.listProducts.products.map(
        (product: Company) => {
          return {
            value: product.id,
            label: product.name,
          };
        },
      );

      setOptionsClient(optionsClientConverted);
      setOptionsProduct(optionsProductConverted);
    },
  });

  const { closeModal } = useModal();
  const { addToast } = useToast();

  const [createSale] = useMutation(CREATE_SALE);

  const handleSubmit = useCallback(
    async (
      { id, price, amount, dateSale, methodPayment, clientId, productId }: Sale,
      { reset },
    ) => {
      try {
        const schema = Yup.object().shape({
          price: Yup.string()
            .matches(
              /(?=.*\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|0)?(\.\d{1,2})?$/,
              'Preço esta invalido!',
            )
            .required('Preço é obrigatorio'),
          clientId: Yup.number()
            .integer('Cliente é invalido!')
            .required('Cliente é obrigatorio')
            .typeError('Cliente esta invalida !'),
          productId: Yup.number()
            .integer('Produto é invalido!')
            .required('Produto é obrigatorio')
            .typeError('Produto esta invalida !'),
        });

        await schema.validate(
          { id, price, clientId, productId },
          {
            abortEarly: false,
          },
        );
        closeModal();

        // eslint-disable-next-line no-param-reassign
        amount = methodPayment === 'avista' ? '1' : amount;

        await createSale({
          variables: {
            price,
            amount: parseInt(amount, 10),
            dateSale,
            methodPayment,
            clientId,
            productId,
          },
        });

        reset();
        closeModal();

        addToast({
          type: 'success',
          title: 'Cadastro realizado com sucesso!',
          description: '',
        });

        const { data } = (await refresh({
          page: 0,
          limit: pageSize,
        })) as PropsData;

        loadSale(data.listSales.sales);
        setCount(data.listSales.count);
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

  const handleMethodPayment = useCallback(async ({ value }) => {
    setVisibleAmount(value !== 'avista');
  }, []);

  return (
    <Container>
      <Form onSubmit={handleSubmit} ref={formRef} initialData={listSale}>
        <Input
          id="id"
          placeholder="Id:"
          label="Id:"
          name="id"
          type="hidden"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '0%', input: '0%' }}
        />

        <Select
          id="methodPayment"
          name="methodPayment"
          onChange={(data: any) => handleMethodPayment(data)}
          options={optionsMethodPayment}
          placeholder="Escolha o método de pagamento"
          label="Método de pagamento"
          sizeSelect={{ class: '50%', select: '90%' }}
        />
        {visibleAmount && (
          <Input
            id="amount"
            placeholder="Digite a quantidade de parcela:"
            label="Quantidade de parcela:"
            name="amount"
            type="text"
            mask="only-numbers"
            typeInput={TypeInput.BASIC}
            sizeInput={{ class: '50%', input: '90%' }}
          />
        )}

        <Input
          id="price"
          placeholder="Digite o Preço:"
          label="Preço:"
          name="price"
          mask="money"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />

        <DatePicker
          id="dateSale"
          name="dateSale"
          placeholder="Digite a data da venda:"
          label="Data da venda:"
          typeInput={TypeInput.BASIC}
          sizeInput={{ class: '50%', input: '90%' }}
        />

        <Select
          id="clientId"
          name="clientId"
          options={optionsClient}
          placeholder="Escolha o cliente"
          label="Cliente"
          sizeSelect={{ class: '50%', select: '90%' }}
        />
        <Select
          id="productId"
          name="productId"
          options={optionsProduct}
          placeholder="Escolha o produto"
          label="Produto"
          sizeSelect={{ class: '50%', select: '90%' }}
        />

        <Button type="submit">Salvar</Button>
      </Form>
    </Container>
  );
};
export default SaleSave;
