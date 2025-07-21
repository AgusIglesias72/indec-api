declare module 'react-world-flags' {
  import { ComponentType } from 'react';
  
  interface FlagProps {
    code: string;
    className?: string;
    style?: React.CSSProperties;
    height?: number;
    width?: number;
  }
  
  const Flag: ComponentType<FlagProps>;
  export default Flag;
}