import * as React from 'react';
import { ModalContainer, ModalContextProvider } from 'components/Modal';

export default function Page({ children, innerRef, ...restProps }) {
  return (
    <div ref={innerRef} {...restProps}>
      {children}
      <ModalContainer />
    </div>
  );
}
