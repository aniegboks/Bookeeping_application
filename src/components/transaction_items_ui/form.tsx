"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { InventoryTransaction, CreateInventoryTransactionInput } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";
import { User } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface TransactionFormProps {
  transaction?: InventoryTransaction; // optional, for edit
  onSubmit: (data: CreateInventoryTransactionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  users: User[];
  currentUserId: string;
}

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting,
  inventoryItems,
  suppliers,
  users,
  currentUserId,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateInventoryTransactionInput>({
    item_id: transaction?.item_id || "",
    supplier_id: transaction?.supplier_id || "",
    receiver_id: transaction?.receiver_id || "",
    supplier_receiver: transaction?.supplier_receiver || "",
    transaction_type: transaction?.transaction_type || "purchase",
    qty_in: transaction?.qty_in || 0,
    in_cost: transaction?.in_cost || 0,
    qty_out: transaction?.qty_out || 0,
    out_cost: transaction?.out_cost || 0,
    status: transaction?.status || "completed",
    reference_no: transaction?.reference_no || "",
    notes: transaction?.notes || "",
    transaction_date: transaction?.transaction_date || new Date().toISOString(),
    created_by: transaction?.created_by || currentUserId,
  });

  const isPurchase = formData.transaction_type === "purchase";
  const isSale = formData.transaction_type === "sale";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["qty_in", "qty_out", "in_cost", "out_cost"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPurchase && (!formData.qty_in || formData.qty_in <= 0)) {
      toast.error("Quantity In must be greater than 0 for a purchase");
      return;
    }
    if (isSale && (!formData.qty_out || formData.qty_out <= 0)) {
      toast.error("Quantity Out must be greater than 0 for a sale");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6">{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item */}
            <div className="pb-4">
              <label className="block font-medium mb-1">Item</label>
              <select
                name="item_id"
                value={formData.item_id}
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
            <div className="pb-4">
              <label className="block font-medium mb-1">Transaction Type</label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            {/* Quantity */}
            {isPurchase && (
              <div className="pb-4">
                <label className="block font-medium mb-1">Quantity In</label>
                <input
                  type="number"
                  min={1}
                  name="qty_in"
                  value={formData.qty_in}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
            )}
            {isSale && (
              <div className="pb-4">
                <label className="block font-medium mb-1">Quantity Out</label>
                <input
                  type="number"
                  min={1}
                  name="qty_out"
                  value={formData.qty_out}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
            )}

            {/* Costs */}
            {isPurchase && (
              <div className="pb-4">
                <label className="block font-medium mb-1">In Cost</label>
                <input
                  type="number"
                  min={0}
                  name="in_cost"
                  value={formData.in_cost}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            )}
            {isSale && (
              <div className="pb-4">
                <label className="block font-medium mb-1">Out Cost</label>
                <input
                  type="number"
                  min={0}
                  name="out_cost"
                  value={formData.out_cost}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            )}

            {/* Supplier */}
            <div className="pb-4">
              <label className="block font-medium mb-1">Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
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
            <div className="pb-4">
              <label className="block font-medium mb-1">Receiver</label>
              <select
                name="receiver_id"
                value={formData.receiver_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Receiver</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier / Receiver Text */}
            <div className="pb-4">
              <label className="block font-medium mb-1">Supplier / Receiver</label>
              <input
                type="text"
                name="supplier_receiver"
                value={formData.supplier_receiver}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* Status */}
            <div className="pb-4">
              <label className="block font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block font-medium mb-1">Transaction Date</label>
              <input
                type="datetime-local"
                name="transaction_date"
                value={(formData.transaction_date || new Date().toISOString()).slice(0, 16)}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* Reference No */}
            <div>
              <label className="block font-medium mb-1">Reference No</label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
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
              {isSubmitting ? <span className="flex gap-2">
                <SmallLoader /> <p className="text-sm">Saving...</p>
              </span> : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
