import type { ReactNode } from "react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const paths: Record<string, ReactNode> = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1H9.5v-5.5h5V21h3a1 1 0 0 0 1-1V9.5" />
  ),
  orders: (
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  ),
  tag: (
    <path d="M3 12.5V4.5A1.5 1.5 0 0 1 4.5 3h8l8.5 8.5a1.5 1.5 0 0 1 0 2.12l-6.38 6.38a1.5 1.5 0 0 1-2.12 0L3 12.5Z" />
  ),
  folder: (
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 17.5v-10Z" />
  ),
  users: (
    <path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.2a3.5 3.5 0 0 1 0 6.6" />
  ),
  search: (
    <path d="M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM21 21l-4.7-4.7" />
  ),
  bell: (
    <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9ZM13.7 20a2 2 0 0 1-3.4 0" />
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <path d="M16.5 4.5a2.12 2.12 0 0 1 3 3L8 19l-4 1 1-4L16.5 4.5Z" />
  ),
  trash: (
    <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M6.5 7l.8 12.1A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v6M14 11v6" />
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  eye: (
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
  ),
  eyeOff: (
    <path d="M4 4l16 16M9.9 5.9A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.4 4.1M6.1 8A17.7 17.7 0 0 0 2.5 12S6 18.5 12 18.5c1.3 0 2.4-.3 3.5-.7M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  ),
  logout: (
    <path d="M15 17l5-5-5-5M20 12H9M12 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h6" />
  ),
  box: (
    <path d="M21 8.5v7a1.5 1.5 0 0 1-.8 1.3l-7 3.8a1.5 1.5 0 0 1-1.4 0l-7-3.8A1.5 1.5 0 0 1 3 15.5v-7a1.5 1.5 0 0 1 .8-1.3l7-3.8a1.5 1.5 0 0 1 1.4 0l7 3.8A1.5 1.5 0 0 1 21 8.5Z" />
  ),
  layers: (
    <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" />
  ),
  palette: (
    <path d="M12 21a9 9 0 1 1 9-9c0 1.7-1.3 3-3 3h-1.5a2 2 0 0 0-1.4 3.4c.4.4.6.9.6 1.4 0 .6-.4 1.2-1 1.2H12Z" />
  ),
  info: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 7.5h.01" />
  ),
  chart: (
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  ),
  image: (
    <path d="M21 14.5V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h11.2M18.5 19H19M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 16l-4.5-4.5L7 21" />
  ),
  filter: <path d="M4 5h16l-6.5 7.5V19l-3 1.5v-8L4 5Z" />,
};

function Icon({ name, size = 20, className }: IconProps) {
  const filled = name === "bell";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? null}
    </svg>
  );
}

export default Icon;
