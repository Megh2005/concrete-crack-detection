declare module 'react-katex' {
  import * as React from 'react';

  export interface KaTeXProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error | TypeError) => React.ReactNode;
  }

  export const InlineMath: React.FC<KaTeXProps>;
  export const BlockMath: React.FC<KaTeXProps>;
}
