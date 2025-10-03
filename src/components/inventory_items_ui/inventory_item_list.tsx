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

  /** Compute profit safely */
  const computeProfit = (item: InventoryItem) => {
    const selling = Number(item.selling_price ?? 0);
    const cost = Number(item.cost_price ?? 0);
    return selling - cost;
  };

  /** Compute margin safely */
  const computeMargin = (item: InventoryItem) => {
    const selling = Number(item.selling_price ?? 0);
    if (selling === 0) return 0;
    return (computeProfit(item) / selling) * 100;
  };

  /** Format margin */
  const formatMargin = (item: InventoryItem) => computeMargin(item).toFixed(2);

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
    <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search items..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#3D4C63] focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "SKU",
                "Name",
                "Selling Price",
                "Cost Price",
                "Estimated Profit",
                "Margin",
                "Updated At",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-[#171D26]">{item.sku}</td>
                <td className="px-6 py-4 text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-700">
                  {formatCurrency(Number(item.selling_price ?? 0))}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatCurrency(Number(item.cost_price ?? 0))}
                </td>
                <td className="px-6 py-4 text-green-700 font-semibold">
                  {formatCurrency(computeProfit(item))}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${computeProfit(item) > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {formatMargin(item)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {formatDate(item.updated_at)}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-[#3D4C63] hover:text-[#495C79] p-1 rounded hover:bg-blue-50 flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5h2M12 7v10m-9 2h18"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or add a new item.
            </p>
          </div>
        )}
      </div>
    </div>

  );
}
