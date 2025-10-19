"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";

interface TransactionTableProps {
  transactions?: InventoryTransaction[];
  items?: InventoryItem[];
  onEdit: (transaction: InventoryTransaction) => void;
  onDelete: (transaction: InventoryTransaction) => void;
  loading?: boolean;
  itemsPerPage?: number;
}

export default function TransactionTable({
  transactions = [],
  items = [],
  onEdit,
  onDelete,
  loading = false,
  itemsPerPage = 10,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [transactions.length, totalPages, currentPage]);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getItemName = (id: string) => items.find((i) => i.id === id)?.name || id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Cost</th>
              {/**               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Cost</th>
*/}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                {/* Transaction Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {tx.transaction_type === "purchase" ? (
                      <ArrowDownCircle className="text-green-600 w-4 h-4" />
                    ) : (
                      <ArrowUpCircle className="text-purple-600 w-4 h-4" />
                    )}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {tx.transaction_type}
                    </span>
                  </div>
                </td>

                {/* Item Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-[150px] truncate" title={getItemName(tx.item_id)}>
                    {getItemName(tx.item_id)}
                  </div>
                </td>

                {/* Quantity */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {tx.transaction_type === "purchase" ? tx.qty_in : tx.qty_out}
                </td>

                {/* In Cost */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{tx.in_cost}</td>

                {/* Out Cost */}
                {/**     <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">{tx.out_cost}</td>
 */}

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tx.status)}`}
                  >
                    {tx.status}
                  </span>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : "—"}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-colors"
                      title="Edit Transaction"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
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
          Showing {(currentPage - 1) * itemsPerPage + 1} –{" "}
          {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length}
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
