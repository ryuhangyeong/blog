import React from 'react';
import styled from 'styled-components';

const ResponsiveBlock = styled.div`
  padding-left: 1rem;
  padding-right: 1rem;
  width: 1024px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    width: 768px;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// children를 제외한 나머지 props를 ResponsiveBlock로 보낸다.
const Responsive = ({ children, ...rest }) => {
  return <ResponsiveBlock {...rest}>{children}</ResponsiveBlock>;
};

export default Responsive;
