"use client";

import { useState } from "react";
import { Edit, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";

interface TransactionTableProps {
  transactions?: InventoryTransaction[];
  items?: InventoryItem[];
  onEdit: (transaction: InventoryTransaction) => void;
  onDelete: (transaction: InventoryTransaction) => void;
  loading?: boolean;
  itemsPerPage?: number; // optional prop to control pagination size
}

export default function TransactionTable({
  transactions = [],
  items = [],
  onEdit,
  onDelete,
  loading = false,
  itemsPerPage = 10, // default to 10 rows per page
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getItemName = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.name : id;
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity In/Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {transaction.transaction_type === "purchase" ? (
                      <ArrowDownCircle className="text-green-600 w-4 h-4" />
                    ) : (
                      <ArrowUpCircle className="text-purple-600 w-4 h-4" />
                    )}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {transaction.transaction_type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div
                    className="max-w-[150px] truncate"
                    title={getItemName(transaction.item_id)}
                  >
                    {getItemName(transaction.item_id)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {transaction.qty_in > 0 ? (
                    <span className="text-green-600 font-medium">
                      +{transaction.qty_in}
                    </span>
                  ) : (
                    <span className="text-purple-600 font-medium">
                      -{transaction.qty_out}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.transaction_date
                    ? new Date(transaction.transaction_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-colors"
                      title="Edit Transaction"
                    >
                      <Edit  className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white text-gray-800 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white text-gray-800 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
