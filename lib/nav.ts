/** Voci di navigazione condivise tra header e footer. */
export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/solar", label: "Solar" },
  { href: "/mobility", label: "Mobility" },
  { href: "/shop", label: "Shop" },
];
