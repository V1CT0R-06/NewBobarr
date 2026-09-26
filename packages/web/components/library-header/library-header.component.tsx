import React from 'react';
import styled from 'styled-components';

import { MissingComponent } from '../missing/missing.component';
import { DownloadingComponent } from '../downloading/downloading.component';

const LibraryHeaderComponentStyles = styled.div`
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 24px 0;

  @media (max-width: 700px) {
    padding: 12px;
  }
`;

export function LibraryHeaderComponent({ types }: { types: string[] }) {
  return (
    <LibraryHeaderComponentStyles>
      <DownloadingComponent types={types} />
      <MissingComponent />
    </LibraryHeaderComponentStyles>
  );
}
