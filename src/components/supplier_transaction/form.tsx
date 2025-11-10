"use client";

import { useState, useEffect } from "react";
import {
  SupplierTransaction,
  CreateSupplierTransactionPayload,
  SupplierTransactionType,
} from "@/lib/types/supplier_transactions";
import { Supplier } from "@/lib/types/suppliers";

interface TransactionFormProps {
  transaction?: SupplierTransaction;
  onSubmit: (data: CreateSupplierTransactionPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  suppliers: Supplier[];
}

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting,
  suppliers,
}: TransactionFormProps) {
  // 🧠 Simple UI model - just payment or purchase
  const [formData, setFormData] = useState({
    supplier_id: "",
    transaction_type: "purchase" as SupplierTransactionType,
    amount: 0,
    transaction_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    notes: "",
  });

  // Populate when editing - figure out if it's a payment (credit) or purchase (debit)
  useEffect(() => {
    if (transaction) {
      const isPayment = transaction.credit > 0;
      const amount = isPayment ? transaction.credit : transaction.debit;

      setFormData({
        supplier_id: transaction.supplier_id,
        transaction_type: isPayment ? "payment" : "purchase",
        amount,
        transaction_date: transaction.transaction_date.split("T")[0],
        reference_no: transaction.reference_no || "",
        notes: transaction.notes || "",
      });
    }
  }, [transaction]);

  // Handle submit - convert to credit/debit for backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isPayment = formData.transaction_type === "payment";

    // Backend only understands credit/debit
    // Add automatic status note to help identify transaction state
    const statusNote = isPayment ? "Payment made - Completed" : "Purchase recorded - Pending payment";
    const combinedNotes = formData.notes 
      ? `${formData.notes} | ${statusNote}`
      : statusNote;

    const payload: CreateSupplierTransactionPayload = {
      supplier_id: formData.supplier_id,
      transaction_date: formData.transaction_date,
      credit: isPayment ? formData.amount : 0,
      debit: isPayment ? 0 : formData.amount,
      reference_no: formData.reference_no || undefined,
      notes: combinedNotes,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-semibold text-[#171D26] mb-4">
          {transaction ? "Edit Transaction" : "Create New Transaction"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type - Simple: Payment or Purchase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.transaction_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transaction_type: e.target.value as SupplierTransactionType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="purchase">Purchase (We owe them - Pending)</option>
                <option value="payment">Payment (We pay them - Completed)</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Reference Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference_no}
                onChange={(e) =>
                  setFormData({ ...formData, reference_no: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                disabled={isSubmitting}
                placeholder="e.g., INV-2024-001"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
              placeholder="Additional notes or comments..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : transaction ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}