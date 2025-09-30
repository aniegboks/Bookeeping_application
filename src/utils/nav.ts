// Export the type so it can be imported elsewhere
export interface NavItem {
  label: string;
  link: string;
}

// Export the menu items
export const AcademicSessionTerms: NavItem[] = [
  { label: "Academic Session", link: "/dashboard" },
  { label: "Brands", link: "/brands" },
  { label: "Categories", link: "/categories" },
  { label: "Sub Categories", link: "/subcategories" },
  { label: "UOM", link: "/uom" },
  { label: "InventoryItems", link: "/inventoryItem" },
];
