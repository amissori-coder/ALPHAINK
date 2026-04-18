import { ReactNode, useEffect } from 'react';
import { IconClose } from './Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizes = {
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'lg' }: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/40 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className={`card w-full ${sizes[size]} shadow-pop my-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
            {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <button className="btn-ghost !p-2" onClick={onClose} aria-label="Chiudi">
            <IconClose />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-ink-100 px-5 py-3 flex justify-end gap-2 bg-ink-50/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
