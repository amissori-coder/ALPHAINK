import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconDashboard = ({ size = 18, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="8" height="10" rx="2" />
    <rect x="13" y="3" width="8" height="6" rx="2" />
    <rect x="3" y="15" width="8" height="6" rx="2" />
    <rect x="13" y="11" width="8" height="10" rx="2" />
  </svg>
);
export const IconInvoice = ({ size = 18, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M8 13h8M8 17h5" />
  </svg>
);
export const IconCart = ({ size = 18, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" />
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
  </svg>
);
export const IconBox = ({ size = 18, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M3 7 12 3l9 4v10l-9 4-9-4V7z" />
    <path d="M3 7l9 4 9-4M12 11v10" />
  </svg>
);
export const IconPlus = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconTrash = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);
export const IconCheck = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
export const IconCloud = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M7 18a4 4 0 0 1-.8-7.9 6 6 0 0 1 11.6 1A4 4 0 0 1 17 18H7z" />
  </svg>
);
export const IconDownload = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
  </svg>
);
export const IconUpload = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M12 20V8M7 13l5-5 5 5M5 4h14" />
  </svg>
);
export const IconSettings = ({ size = 18, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
export const IconArrow = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
export const IconSparkle = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3l1.8 4.8L18.6 9.6 13.8 11.4 12 16.2 10.2 11.4 5.4 9.6 10.2 7.8z" />
    <path d="M19 16l.8 2 2 .8-2 .8L19 21.6 18.2 19.6 16.2 18.8 18.2 18z" />
  </svg>
);
export const IconSearch = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
export const IconEdit = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
  </svg>
);
export const IconClose = ({ size = 16, ...p }: Props) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
