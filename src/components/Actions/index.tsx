import React from 'react';
import { FaRegEdit, FaTrash, FaRegIdCard } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { Container, ButtonDelete, ButtonEdit } from './styles';

interface Action {
  handleEdit?: (data: any) => {};
  handleDelete?: (data: any) => {};
  moreActions?: any;
  data: {};
}

const Actions: React.FC<Action> = ({
  handleEdit,
  handleDelete,
  moreActions,
  data,
}) => {
  return (
    <Container>
      {moreActions && moreActions}

      {handleEdit && (
        <>
          <ButtonEdit
            type="button"
            data-tip
            data-for="tooltipEdit"
            onClick={() => handleEdit(data)}
          >
            <FaRegEdit />
          </ButtonEdit>
          <ReactTooltip id="tooltipEdit" type="dark">
            <span>Editar</span>
          </ReactTooltip>
        </>
      )}

      {handleDelete && (
        <>
          <ButtonDelete
            type="button"
            data-tip
            data-for="tooltipRemove"
            onClick={() => handleDelete(data)}
          >
            <FaTrash />
          </ButtonDelete>
          <ReactTooltip id="tooltipRemove" type="dark">
            <span>Remover</span>
          </ReactTooltip>
        </>
      )}
    </Container>
  );
};

export default Actions;
