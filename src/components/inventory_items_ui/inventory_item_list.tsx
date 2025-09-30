"use client";

import { useEffect, useState } from "react";
import { InventoryItem } from "@/lib/types/inventory_item";
import { inventoryItemApi } from "@/lib/inventory_item";
import { formatCurrency, formatDate } from "@/lib/utils/inventory_helper";

type Props = {
  filters?: Record<string, string>;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
};

export default function InventoryItemList({ filters, onEdit, onDelete }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await inventoryItemApi.getAll(filters);
        setItems(data);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [filters]);

  if (loading) return <p>Loading...</p>;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search items..."
        className="border p-2 mb-4 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">SKU</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Selling Price</th>
            <th className="border px-4 py-2">Profit</th>
            <th className="border px-4 py-2">Margin</th>
            <th className="border px-4 py-2">Updated At</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.sku}</td>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">{formatCurrency(item.selling_price)}</td>
              <td className="border px-4 py-2">{formatCurrency(item.profit)}</td>
              <td className="border px-4 py-2">{item.margin.toFixed(2)}%</td>
              <td className="border px-4 py-2">{formatDate(item.updated_at)}</td>
              <td className="border px-4 py-2">
                <button
                  className="text-blue-600 hover:underline mr-2"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => onDelete(item)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No items found.</p>
      )}
    </div>
  );
}
