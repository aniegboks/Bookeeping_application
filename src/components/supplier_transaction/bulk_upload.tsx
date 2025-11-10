"use client";

import { useState } from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { BulkUpsertTransactionItem, SupplierTransactionType } from "@/lib/types/supplier_transactions";
import { Supplier } from "@/lib/types/suppliers";

interface BulkUploadFormProps {
  onSubmit: (data: BulkUpsertTransactionItem[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  suppliers: Supplier[];
}

interface TransactionRow {
  tempId: string;
  supplier_id: string;
  transaction_type: SupplierTransactionType; // "payment" or "purchase"
  amount: number;
  transaction_date: string;
  reference_no?: string;
  notes?: string;
  id?: string;
}

export default function BulkUploadForm({
  onSubmit,
  onCancel,
  isSubmitting,
  suppliers,
}: BulkUploadFormProps) {
  const createEmptyRow = (): TransactionRow => ({
    tempId: crypto.randomUUID(),
    supplier_id: "",
    transaction_type: "purchase",
    amount: 0,
    transaction_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    notes: "",
  });

  const [rows, setRows] = useState<TransactionRow[]>([createEmptyRow()]);

  const handleAddRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const handleRemoveRow = (tempId: string) =>
    setRows((prev) => prev.filter((row) => row.tempId !== tempId));

  const handleChange = <K extends keyof TransactionRow>(
    tempId: string,
    field: K,
    value: TransactionRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.tempId === tempId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: BulkUpsertTransactionItem[] = rows.map((row) => {
      const isPayment = row.transaction_type === "payment";
      const statusNote = isPayment
        ? "Payment made - Completed"
        : "Purchase recorded - Pending payment";

      const combinedNotes = row.notes
        ? `${row.notes} | ${statusNote}`
        : statusNote;

      const item: BulkUpsertTransactionItem = {
        supplier_id: row.supplier_id,
        transaction_date: row.transaction_date,
        credit: isPayment ? row.amount : 0,
        debit: isPayment ? 0 : row.amount,
        reference_no: row.reference_no || undefined,
        notes: combinedNotes,
      };

      if (row.id) item.id = row.id;
      return item;
    });

    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-2xl w-full max-w-7xl shadow-xl border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#171D26] flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Bulk Transaction Upload
          </h2>
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>

        {/* Table Rows */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
          {rows.map((row, index) => (
            <div
              key={row.tempId}
              className="border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Row {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.tempId)}
                  className="text-red-600 hover:text-red-800 transition"
                  disabled={rows.length === 1 || isSubmitting}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Supplier */}
                <select
                  value={row.supplier_id}
                  onChange={(e) =>
                    handleChange(row.tempId, "supplier_id", e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Type - Only Payment or Purchase */}
                <select
                  value={row.transaction_type}
                  onChange={(e) =>
                    handleChange(
                      row.tempId,
                      "transaction_type",
                      e.target.value as SupplierTransactionType
                    )
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={isSubmitting}
                >
                  <option value="purchase">
                    Purchase (We owe them - Pending)
                  </option>
                  <option value="payment">
                    Payment (We pay them - Completed)
                  </option>
                </select>

                {/* Amount */}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={row.amount}
                  onChange={(e) =>
                    handleChange(
                      row.tempId,
                      "amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={isSubmitting}
                />

                {/* Date */}
                <input
                  type="date"
                  value={row.transaction_date}
                  onChange={(e) =>
                    handleChange(row.tempId, "transaction_date", e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Reference + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Reference Number"
                  value={row.reference_no || ""}
                  onChange={(e) =>
                    handleChange(row.tempId, "reference_no", e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  disabled={isSubmitting}
                />
                <div className="col-span-1 md:col-span-2">
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={row.notes || ""}
                    onChange={(e) =>
                      handleChange(row.tempId, "notes", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || rows.length === 0}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Submit All"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
