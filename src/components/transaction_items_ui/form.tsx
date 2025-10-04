"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";
import { User } from "@/lib/types/user";

interface TransactionFormProps {
  transaction?: InventoryTransaction;
  onSubmit: (data: Partial<InventoryTransaction>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  users: User[];
}

type TransactionType = "purchase" | "sale" | "return";
type TransactionStatus = "completed" | "pending" | "cancelled" | "processing";

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting,
  inventoryItems,
  suppliers,
  users,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<Partial<InventoryTransaction>>(
    transaction || {
      item_id: "",
      supplier_id: "",
      receiver_id: "",
      supplier_receiver: "",
      transaction_type: "purchase",
      qty_in: 0,
      qty_out: 0,
      in_cost: 0,
      out_cost: 0,
      status: "completed",
      reference_no: "",
      notes: "",
      transaction_date: new Date().toISOString(),
      created_by: "",
    }
  );

  const type = formData.transaction_type ?? "";
  const isInTransaction = type === "purchase" || type === "return";
  const isOutTransaction = type === "sale";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("qty") || name.includes("cost") ? Number(value) : value,
    }));
  };

  const handleCostChange = (name: "in_cost" | "out_cost", value: string) => {
    const numeric = value.replace(/[^\d.]/g, "");
    setFormData((prev) => ({ ...prev, [name]: Number(numeric) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Business rule: cannot have both qty_in and qty_out > 0
    if (formData.qty_in && formData.qty_out && formData.qty_in > 0 && formData.qty_out > 0) {
      toast.error("Both Quantity In and Quantity Out cannot be greater than 0 in a single transaction.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh] relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item */}
            <div>
              <label className="block font-medium mb-1">Item</label>
              <select
                name="item_id"
                value={formData.item_id ?? ""}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select an item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block font-medium mb-1">Transaction Type</label>
              <select
                name="transaction_type"
                value={formData.transaction_type ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="return">Return</option>
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="block font-medium mb-1">Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Receiver */}
            <div>
              <label className="block font-medium mb-1">Receiver</label>
              <select
                name="receiver_id"
                value={formData.receiver_id ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Receiver</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username || u.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier / Receiver Name */}
            <div>
              <label className="block font-medium mb-1">Supplier / Receiver Name</label>
              <input
                type="text"
                name="supplier_receiver"
                value={formData.supplier_receiver ?? ""}
                onChange={handleChange}
                placeholder="Supplier or receiver name"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block font-medium mb-1">Reference No</label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no ?? ""}
                onChange={handleChange}
                placeholder="Enter reference number"
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* Quantity In */}
            <div>
              <label className="block font-medium mb-1">Quantity In</label>
              <input
                type="number"
                name="qty_in"
                min={0}
                disabled={isOutTransaction}
                value={formData.qty_in ?? 0}
                onChange={handleChange}
                className={`w-full border border-gray-300 rounded-lg p-2 ${
                  isOutTransaction ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Quantity Out */}
            <div>
              <label className="block font-medium mb-1">Quantity Out</label>
              <input
                type="number"
                name="qty_out"
                min={0}
                disabled={isInTransaction}
                value={formData.qty_out ?? 0}
                onChange={handleChange}
                className={`w-full border border-gray-300 rounded-lg p-2 ${
                  isInTransaction ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* In Cost */}
            <div>
              <label className="block font-medium mb-1">In Cost (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="text"
                  name="in_cost"
                  disabled={isOutTransaction}
                  value={formData.in_cost ?? ""}
                  onChange={(e) => handleCostChange("in_cost", e.target.value)}
                  placeholder="Enter cost price"
                  className={`w-full border border-gray-300 rounded-lg pl-7 p-2 ${
                    isOutTransaction ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Out Cost */}
            <div>
              <label className="block font-medium mb-1">Out Cost (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="text"
                  name="out_cost"
                  disabled={isInTransaction}
                  value={formData.out_cost ?? ""}
                  onChange={(e) => handleCostChange("out_cost", e.target.value)}
                  placeholder="Enter selling price"
                  className={`w-full border border-gray-300 rounded-lg pl-7 p-2 ${
                    isInTransaction ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block font-medium mb-1">Transaction Date</label>
              <input
                type="datetime-local"
                name="transaction_date"
                value={formData.transaction_date?.slice(0, 16) ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes ?? ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#3D4C63] text-white hover:bg-[#495C79] disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
