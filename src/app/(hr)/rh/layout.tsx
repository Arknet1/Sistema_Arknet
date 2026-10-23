import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Recursos Humanos · J.Matos',
    template: '%s · J.Matos RH',
  },
  description: 'Gestão de Recursos Humanos · J.Matos Tecnologia',
};

export default function RhLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
