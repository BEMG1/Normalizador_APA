import { type ReactNode, type FC } from 'react';

interface ProviderComposerProps {
  providers: Array<FC<{ children: ReactNode }>>;
  children: ReactNode;
}

export const ProviderComposer: FC<ProviderComposerProps> = ({
  providers,
  children,
}) => {
  return providers.reduceRight(
    (kids, Provider) => <Provider>{kids}</Provider>,
    <>{children}</>
  );
};

export default ProviderComposer;
