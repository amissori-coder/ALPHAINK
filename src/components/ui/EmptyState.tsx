import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: Props) => (
  <div className="card flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-500 mb-4">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-ink-900">{title}</h3>
    {description && <p className="text-sm text-ink-500 mt-1 max-w-md">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
