import React, { useState, useCallback, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { format, isPast } from 'date-fns';
import { orderBy } from 'lodash';
import { FaCheck, FaBan } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import Swal from 'sweetalert2';
import { useMutation, gql } from '@apollo/client';
import { PaidButton, DateSaleDiv } from './styles';
import { useToast } from '../../../hooks/toast';

interface ParcelSale {
  parcelSale: {};
}

interface PropsSaleSave {
  data?: { id: number; paid: boolean; parcelSales: ParcelSale[] };
  handleLoad: any;
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

const PAID_PARCEL_SALE = gql`
  mutation paidParcelSale($parcelSaleId: Int!, $paid: Boolean!) {
    paidParcelSale(parcelSaleId: $parcelSaleId, paid: $paid)
  }
`;

const ParcelSale: React.FC<PropsSaleSave> = ({ data, handleLoad, ...rest }) => {
  const { addToast } = useToast();
  const [paidParcelSale] = useMutation(PAID_PARCEL_SALE);

  const handlePaid = useCallback(async (parcelSale: any, paid: boolean) => {
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
          const returnMsg: any = await paidParcelSale({
            variables: {
              parcelSaleId: parseInt(parcelSale.id, 10),
              paid: !paid,
            },
          });

          await handleLoad();
          addToast({
            type: 'success',
            title: returnMsg.data.paidParcelSale,
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

  const columns = [
    {
      name: 'Número de parcela',
      selector: 'parcelNumber',
      center: true,
      width: '320px',
    },
    {
      name: 'Preço',
      selector: 'price',
      center: true,
      width: '400px',
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
      name: 'Data Pagamento',
      selector: 'dateSale',
      center: true,
      cell: (row: any) => (
        <DateSaleDiv
          isExpired={row.paid === 'false' && isPast(new Date(row.maturityDate))}
        >
          {String(format(new Date(row.maturityDate), 'dd/MM/yyyy'))}
        </DateSaleDiv>
      ),
    },

    {
      name: 'Pago',
      cell: (row: any) => (
        <PaidButton
          className={row.paid === 'true' ? 'paid' : 'notPaid'}
          data-tip
          data-for="tooltipParcelPaid"
          onClick={() => handlePaid(row, row.paid === 'true')}
        >
          {row.paid === 'true' ? <FaCheck /> : <FaBan />}
        </PaidButton>
      ),
      center: true,
      width: '300px',
    },
  ];

  const [parcelSales, setParcelSales] = useState(
    data ? orderBy(data.parcelSales, ['parcelNumber'], ['asc']) : [],
  );

  useEffect(() => {
    setParcelSales(
      data ? orderBy(data.parcelSales, ['parcelNumber'], ['asc']) : [],
    );
  }, [data]);

  return (
    <>
      {parcelSales && (
        <DataTable
          noTableHead={false}
          columns={columns}
          data={parcelSales}
          noDataComponent="Nenhum registro encontrado!"
          pagination
          customStyles={theme}
          paginationServer
          highlightOnHover
          paginationTotalRows={data?.parcelSales.length || 0}
          pointerOnHover
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página:',
          }}
          striped
          noHeader
        />
      )}
      <ReactTooltip id="tooltipParcelPaid" type="dark">
        <span>Deseja pagar?</span>
      </ReactTooltip>
    </>
  );
};
export default ParcelSale;
