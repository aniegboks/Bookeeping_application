// src/lib/uom.ts

const BASE_URL = "/api/uoms"; // This hits your Next.js route, not the backend directly

async function getAll() {
  const res = await fetch(BASE_URL, {
    method: "GET",
    credentials: "include", // ensures cookies are sent
  });

  if (!res.ok) throw new Error("Failed to fetch UOMs");
  return res.json();
}

async function create(data: { name: string; symbol: string }) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create UOM");
  return res.json();
}

async function getById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch UOM by ID");
  return res.json();
}

async function update(id: string, data: { name: string; symbol: string }) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update UOM");
  return res.json();
}

async function remove(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete UOM");
  return true;
}

export const uomApi = {
  getAll,
  create,
  getById,
  update,
  remove,
};
