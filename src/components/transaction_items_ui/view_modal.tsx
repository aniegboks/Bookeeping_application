"use client";

import { X } from "lucide-react";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";

interface ViewTransactionModalProps {
  transaction: InventoryTransaction;
  items: InventoryItem[];
  suppliers: Supplier[];
  onClose: () => void;
}

export default function ViewTransactionModal({
  transaction,
  items,
  suppliers,
  onClose,
}: ViewTransactionModalProps) {
  const getItemName = (id: string) => items.find((i) => i.id === id)?.name || id;
  const getSupplierName = (id: string) => suppliers.find((s) => s.id === id)?.name || "—";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isPurchase = transaction.transaction_type === "purchase";
  const quantity = isPurchase ? transaction.qty_in : transaction.qty_out;
  const unitCost = isPurchase ? transaction.in_cost : transaction.out_cost;
  const totalCost = quantity * unitCost;
  const balance = totalCost - (transaction.amount_paid || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Type Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Type:</span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              isPurchase ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
            }`}>
              {transaction.transaction_type.toUpperCase()}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ml-auto ${getStatusColor(transaction.status)}`}>
              {transaction.status.toUpperCase()}
            </span>
          </div>

          {/* Main Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Item</label>
              <p className="mt-1 text-base font-semibold text-gray-900">{getItemName(transaction.item_id)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Supplier</label>
              <p className="mt-1 text-base font-semibold text-gray-900">{getSupplierName(transaction.supplier_id || "")}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Quantity</label>
              <p className="mt-1 text-base font-semibold text-gray-900">{quantity}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Unit Cost</label>
              <p className="mt-1 text-base font-semibold text-gray-900">{formatCurrency(unitCost)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Total Cost</label>
              <p className={`mt-1 text-base font-bold ${isPurchase ? "text-green-600" : "text-purple-600"}`}>
                {formatCurrency(totalCost)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Amount Paid</label>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {transaction.amount_paid !== null && transaction.amount_paid !== undefined
                  ? formatCurrency(transaction.amount_paid)
                  : "—"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Balance</label>
              <p className={`mt-1 text-base font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Transaction Date</label>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {transaction.transaction_date
                  ? new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="pt-4 border-t border-gray-200 space-y-4">
            {transaction.reference_no && (
              <div>
                <label className="text-sm font-medium text-gray-500">Reference Number</label>
                <p className="mt-1 text-base text-gray-900">{transaction.reference_no}</p>
              </div>
            )}

            {transaction.supplier_receiver && (
              <div>
                <label className="text-sm font-medium text-gray-500">Supplier/Receiver</label>
                <p className="mt-1 text-base text-gray-900">{transaction.supplier_receiver}</p>
              </div>
            )}

            {transaction.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="mt-1 text-base text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {transaction.notes}
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            {transaction.created_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(transaction.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {transaction.updated_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(transaction.updated_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}