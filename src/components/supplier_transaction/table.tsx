"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { SupplierTransaction } from "@/lib/types/supplier_transactions";
import { Supplier } from "@/lib/types/suppliers";

interface TransactionTableProps {
  transactions: SupplierTransaction[];
  onEdit: (transaction: SupplierTransaction) => void;
  onDelete: (transaction: SupplierTransaction) => void;
  loading?: boolean;
  suppliers: Supplier[];
  onRefresh?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  loading = false,
  suppliers,
  onRefresh,
  canUpdate = true,
  canDelete = true,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  const totalPages = Math.max(1, Math.ceil(transactions.length / rowsPerPage));
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Unknown Supplier";
  };

  // Determine status based on credit/debit
  const getTransactionStatus = (transaction: SupplierTransaction): "completed" | "pending" => {
    return transaction.credit > 0 ? "completed" : "pending";
  };

  const getStatusBadge = (transaction: SupplierTransaction) => {
    const status = getTransactionStatus(transaction);
    
    const statusConfig = {
      completed: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Completed" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock, label: "Pending" },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Determine transaction type based on credit/debit
  const getTransactionType = (transaction: SupplierTransaction): "payment" | "purchase" => {
    return transaction.credit > 0 ? "payment" : "purchase";
  };

  const getTransactionTypeBadge = (transaction: SupplierTransaction) => {
    const type = getTransactionType(transaction);
    
    const typeConfig = {
      payment: { bg: "bg-blue-100", text: "text-blue-800", label: "Payment" },
      purchase: { bg: "bg-purple-100", text: "text-purple-800", label: "Purchase" },
    };

    const config = typeConfig[type];
    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-[#171D26] text-lg">
          Supplier Transactions
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              {/* Only show Actions column if user has any action permission */}
              {hasAnyActionPermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {transaction.reference_no || "—"}
                    </div>
                    {transaction.notes && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getSupplierName(transaction.supplier_id)}
                </td>
                <td className="px-6 py-4">
                  {getTransactionTypeBadge(transaction)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  ₦{(transaction.credit || transaction.debit).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(transaction)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </td>
                {/* Only show action buttons if user has permissions */}
                {hasAnyActionPermission && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {/* Only show Edit button if user can update */}
                      {canUpdate && (
                        <button 
                          onClick={() => onEdit(transaction)} 
                          className="text-[#3D4C63] hover:text-[#495C79]" 
                          title="Edit transaction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {/* Only show Delete button if user can delete */}
                      {canDelete && (
                        <button 
                          onClick={() => onDelete(transaction)} 
                          className="p-1 text-red-600 hover:bg-red-50 rounded" 
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}