import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Container, CollapseTitle, CollapseBody } from './styles';

interface CollpaseProps {
  title: string;
}

const Collapse: React.FC<CollpaseProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Container>
      <CollapseTitle type="button" onClick={() => setOpen(!open)}>
        <h2>
          <span>{title}</span>
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </h2>
      </CollapseTitle>
      <CollapseBody open={open}>{children}</CollapseBody>
    </Container>
  );
};

export default Collapse;
