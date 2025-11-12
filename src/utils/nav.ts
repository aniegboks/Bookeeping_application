// Export the type so it can be imported elsewhere
export interface NavItem {
  label: string;
  link: string;
  description?: string; 
}

// Export the menu items
export const AcademicSessionTerms: NavItem[] = [
  { label: "Academic Session", link: "/dashboard", description: "Manage academic sessions and terms" },
  { label: "Brands", link: "/brands", description: "View and manage product brands" },
  { label: "Categories", link: "/categories", description: "Manage product categories" },
  { label: "Sub Categories", link: "/subCategories", description: "Manage subcategories under categories" },
  { label: "Units of Measure", link: "/uom", description: "Define and manage units of measure" },
  { label: "InventoryItems", link: "/inventoryItem", description: "View and manage inventory items" },
  { label: "Inventory Entitlement", link: "/classInventoryEntitlment", description: "Assign inventory to classes" },
  { label: "Suppliers", link: "/suppliers", description: "Manage suppliers and contacts" },
  { label: "Users", link: "/user", description: "Manage system users and roles" },
  { label: "Classes", link: "/classes", description: "View and manage classes" },
  { label: "Class Teachers", link: "/classTeachers", description: "Assign and manage class teachers" },
  { label: "Purchase", link: "/transactionItem", description: "Track inventory transactions" },
  { label: "Students", link: "/students", description: "View and manage students" },
  { label: "Student Collection", link: "/studentInventoryEntitlement", description: "Assign inventory to students" },
  { label: "Inventory Distributions", link: "/inventoryDistrbution", description: "Distribute inventory to classes and students" },
  { label: "Inventory Summary", link: "/inventorySummary", description: "View and manage inventory summary" },
  { label: "Students Report", link: "/studentsReport", description: "Generate reports and analytics" },
  {label: "Supplier Transaction", link: "/supplierTransaction", description: "Track supplier transactions" },
  {label: "Roles", link: "/roles", description: "Manage user roles and permissions" },
];
