// Export the type so it can be imported elsewhere
export interface NavItem {
  label: string;
  link: string;
  description?: string; // Optional description for dashboard cards
}

// Export the menu items
export const AcademicSessionTerms: NavItem[] = [
  { label: "Academic Session", link: "/dashboard", description: "Manage academic sessions and terms" },
  { label: "Brands", link: "/brands", description: "View and manage product brands" },
  { label: "Categories", link: "/categories", description: "Manage product categories" },
  { label: "Sub Categories", link: "/subCategories", description: "Manage subcategories under categories" },
  { label: "UOM", link: "/uom", description: "Define and manage units of measure" },
  { label: "InventoryItems", link: "/inventoryItem", description: "View and manage inventory items" },
  { label: "Inventory Entitlement", link: "/classInventoryEntitlment", description: "Assign inventory to classes" },
  { label: "Suppliers", link: "/suppliers", description: "Manage suppliers and contacts" },
  { label: "Users", link: "/user", description: "Manage system users and roles" },
  { label: "Classes", link: "/classes", description: "View and manage classes" },
  { label: "Class Teachers", link: "/classTeachers", description: "Assign and manage class teachers" },
  { label: "Transaction Items", link: "/transactionItem", description: "Track inventory transactions" },
  { label: "Students", link: "/students", description: "View and manage students" },
  { label: "Student Entitlement", link: "/studentInventoryEntitlement", description: "Assign inventory to students" },
];
