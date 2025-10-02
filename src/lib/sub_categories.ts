// lib/subCategoriesApi.ts
export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

const BASE_URL = "https://inventory-backend-hm7r.onrender.com/api/v1/sub_categories";

// Helper to attach token to headers
function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// Fetch all sub-categories
export async function fetchAllSubCategories(token?: string): Promise<SubCategory[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch sub-categories");
  return res.json();
}

// Fetch a single sub-category by ID
export async function fetchSubCategoryById(token: string, id: string): Promise<SubCategory> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (res.status === 404) throw new Error("Sub-category not found");
  if (!res.ok) throw new Error("Failed to fetch sub-category");
  return res.json();
}

// Create a sub-category
export async function createSubCategory(token: string, data: Partial<SubCategory>): Promise<SubCategory> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create sub-category");
  return res.json();
}

// Update sub-category
export async function updateSubCategory(token: string, id: string, data: Partial<SubCategory>): Promise<SubCategory> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update sub-category");
  return res.json();
}

// Delete sub-category → returns boolean instead of void
export async function deleteSubCategory(token: string, id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (res.status === 404) return false; // not found
  if (!res.ok) throw new Error("Failed to delete sub-category");

  return true; // success
}

export const subCategoryApi = {
  getAll: fetchAllSubCategories,
  fetchById: fetchSubCategoryById,
  create: createSubCategory,
  update: updateSubCategory,
  delete: deleteSubCategory,
};
