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
  { label: "Sub Categories", link: "/subCategories" },
  { label: "UOM", link: "/uom" },
  { label: "InventoryItems", link: "/inventoryItem" },
  { label: "Class Inventory Entitlement", link: "/classInventoryEntitlment" },
  { label: "Suppliers", link: "/suppliers" },
  { label: "Users", link: "/user" },
  { label: "Classes", link: "/classes" },
  { label: "Class Teachers", link: "/classTeachers" },
  { label: "Transaction Items", link: "/transactionItem" },
  { label: "Students", link: "/students" },
  { label: "Inventory Distributions", link: "/inventory_distrbution" },
];
