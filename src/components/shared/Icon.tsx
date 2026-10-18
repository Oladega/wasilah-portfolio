type Props = { name: string; size?: number; className?: string };
export function Icon({ name, size = 16, className }: Props) {
  const paths: Record<string, React.ReactNode> = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    chat: <path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5a9 9 0 1 1 16.5-4.5Z" />,
    user: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 21v-4a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v4" />
      </>
    ),
    tools: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-4a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v4M16 4a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 5v3" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    megaphone: (
      <>
        <path d="M3 9h5l12-5v16L8 15H3ZM8 15l3 7H7l-3-7M8 9v6" />
      </>
    ),
    mic: (
      <>
        <rect
          x="9"
          y="2"
          width="7"
          height="13"
          rx="3.5"
          transform="rotate(30 12 9)"
        />
        <path d="m5 12-2 4 4 3 4-2M5 18l-3 4" />
      </>
    ),
    badge: (
      <>
        <rect x="5" y="3" width="14" height="19" rx="3" />
        <circle cx="12" cy="9" r="3" />
        <path d="m10 12-1 6 3-2 3 2-1-6" />
      </>
    ),
    document: (
      <>
        <path d="M5 2h10l4 4v16H5ZM14 2v5h5M8 11h8M8 15h8M8 19h6" />
      </>
    ),
    flag: (
      <>
        <path d="M4 22V3c5-4 10 4 16 0v11c-6 4-11-4-16 0" />
      </>
    ),
    palette: (
      <>
        <path d="M12 2a10 10 0 1 0 0 20c5 0 1-5 4-6 7-1 7-14-4-14Z" />
        <circle cx="7" cy="9" r="1" />
        <circle cx="11" cy="6" r="1" />
        <circle cx="16" cy="8" r="1" />
        <circle cx="6" cy="14" r="1" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h19M7 15l5-5 4 3 5-7" />
      </>
    ),
    speaker: (
      <>
        <path d="M4 9h4l5-4v14l-5-4H4Z" />
        <path d="m17 9 5 6m0-6-5 6" />
      </>
    ),
    sound: (
      <>
        <path d="M4 9h4l5-4v14l-5-4H4Z" />
        <path d="M17 8q6 4 0 8M16 11q2 1 0 2" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.document}
    </svg>
  );
}
