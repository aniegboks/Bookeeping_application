"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";

interface TransactionTableProps {
  transactions?: InventoryTransaction[];
  items?: InventoryItem[];
  suppliers?: Supplier[];
  onEdit: (transaction: InventoryTransaction) => void;
  onDelete: (transaction: InventoryTransaction) => void;
  onView: (transaction: InventoryTransaction) => void;
  loading?: boolean;
  itemsPerPage?: number;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function TransactionTable({
  transactions = [],
  items = [],
  suppliers = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  itemsPerPage = 10,
  canUpdate = true,
  canDelete = true,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

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
  
  const getSupplierName = (id: string) => suppliers.find((s) => s.id === id)?.name || "—";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {/* Only show Actions column if user has any action permission */}
              {hasAnyActionPermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((tx) => {
              const isPurchase = tx.transaction_type === "purchase";
              const quantity = isPurchase ? tx.qty_in : tx.qty_out;
              const unitCost = isPurchase ? tx.in_cost : tx.out_cost;
              const totalCost = quantity * unitCost;
              const isCompleted = tx.status === "completed";

              return (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  {/* Item Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <div className="max-w-[150px] truncate" title={getItemName(tx.item_id)}>
                      {getItemName(tx.item_id)}
                    </div>
                  </td>

                  {/* Supplier Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="max-w-[150px] truncate" title={getSupplierName(tx.supplier_id || "")}>
                      {getSupplierName(tx.supplier_id || "")}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {quantity}
                  </td>

                  {/* Unit Cost */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {formatCurrency(unitCost)}
                  </td>

                  {/* Total Cost */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={isPurchase ? "text-green-600" : "text-purple-600"}>
                      {formatCurrency(totalCost)}
                    </span>
                  </td>

                  {/* Amount Paid */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                    {tx.amount_paid !== null && tx.amount_paid !== undefined
                      ? formatCurrency(tx.amount_paid)
                      : "—"}
                  </td>

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

                  {/* Actions - Only show if user has permissions */}
                  {hasAnyActionPermission && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {/* Show View button for completed transactions */}
                        {isCompleted ? (
                          <button
                            onClick={() => onView(tx)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Transaction"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            {/* Only show Edit button if user can update and transaction is not completed */}
                            {canUpdate && (
                              <button
                                onClick={() => onEdit(tx)}
                                className="p-2 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-colors"
                                title="Edit Transaction"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {/* Only show Delete button if user can delete and transaction is not completed */}
                            {canDelete && (
                              <button
                                onClick={() => onDelete(tx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
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
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
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