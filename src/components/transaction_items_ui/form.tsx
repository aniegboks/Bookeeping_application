"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Info, HelpCircle } from "lucide-react";
import {
  InventoryTransaction,
  CreateInventoryTransactionInput,
} from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";
import { User } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface TransactionFormProps {
  transaction?: InventoryTransaction;
  onSubmit: (data: CreateInventoryTransactionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  currentUser: User | null;
}

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting,
  inventoryItems,
  suppliers,
  currentUser,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<{
    item_id: string;
    supplier_id: string;
    receiver_id: string;
    supplier_receiver: string;
    transaction_type: "purchase" | "sale";
    qty_in: number | string;
    qty_out: number | string;
    in_cost: number | string;
    out_cost: number | string;
    amount_paid: number | string;
    status: "pending" | "completed" | "cancelled" | "on_hold";
    reference_no: string;
    notes: string;
    transaction_date: string;
    created_by: string;
  }>({
    item_id: transaction?.item_id || "",
    supplier_id: transaction?.supplier_id || "",
    receiver_id: transaction?.receiver_id || currentUser?.id || "",
    supplier_receiver: transaction?.supplier_receiver || "",
    transaction_type: transaction?.transaction_type || "purchase",
    qty_in: transaction?.qty_in?.toString() || "",
    qty_out: transaction?.qty_out?.toString() || "",
    in_cost: transaction?.in_cost?.toString() || "",
    out_cost: transaction?.out_cost?.toString() || "",
    amount_paid: transaction?.amount_paid?.toString() || "",
    status: transaction?.status || "completed",
    reference_no: transaction?.reference_no || "",
    notes: transaction?.notes || "",
    transaction_date: transaction?.transaction_date || new Date().toISOString(),
    created_by: transaction?.created_by || currentUser?.id || "",
  });

  const [showDiscountTooltip, setShowDiscountTooltip] = useState(false);

  const isPurchase = formData.transaction_type === "purchase";
  const isSale = formData.transaction_type === "sale";

  // Get selected item
  const selectedItem = inventoryItems.find(item => item.id === formData.item_id);

  // Auto-populate unit cost when item is selected
  useEffect(() => {
    if (selectedItem) {
      const defaultCost = selectedItem.cost_price || 0;
      const defaultSellingPrice = selectedItem.selling_price || 0;

      // Only auto-populate for NEW transactions (not editing)
      if (!transaction) {
        if (isPurchase) {
          setFormData(prev => ({
            ...prev,
            in_cost: defaultCost
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            out_cost: defaultSellingPrice || defaultCost
          }));
        }
      }
    }
  }, [formData.item_id, isPurchase, selectedItem, transaction]);

  // Calculate totals based on whether discount is applied
  const quantity = isPurchase ? Number(formData.qty_in || 0) : Number(formData.qty_out || 0);
  const unitCost = isPurchase ? Number(formData.in_cost || 0) : Number(formData.out_cost || 0);
  const defaultCostPrice = selectedItem?.cost_price || 0;

  // Check if a discount is applied (unit cost is less than default cost price)
  const hasDiscount = isPurchase && defaultCostPrice > 0 && unitCost < defaultCostPrice && unitCost > 0;
  const discountAmount = hasDiscount ? defaultCostPrice - unitCost : 0;
  const discountPercentage = hasDiscount ? ((discountAmount / defaultCostPrice) * 100).toFixed(1) : 0;

  // Calculate total using the actual unit cost (with or without discount)
  const totalInCost = isPurchase ? quantity * unitCost : 0;
  const totalOutCost = isSale ? quantity * unitCost : 0;
  const totalSavings = hasDiscount ? quantity * discountAmount : 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["qty_in", "qty_out", "in_cost", "out_cost", "amount_paid"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Current user not available.");
      return;
    }

    const dataToSubmit: CreateInventoryTransactionInput = {
      item_id: formData.item_id,
      transaction_type: formData.transaction_type,
      status: formData.status,
      created_by: formData.created_by || currentUser.id,
    };

    if (formData.supplier_id) dataToSubmit.supplier_id = formData.supplier_id;
    if (formData.receiver_id) dataToSubmit.receiver_id = formData.receiver_id;
    if (formData.supplier_receiver)
      dataToSubmit.supplier_receiver = formData.supplier_receiver;
    if (formData.reference_no) dataToSubmit.reference_no = formData.reference_no;
    if (formData.notes) dataToSubmit.notes = formData.notes;
    if (formData.transaction_date)
      dataToSubmit.transaction_date = formData.transaction_date;
    if (formData.qty_in !== "") dataToSubmit.qty_in = Number(formData.qty_in);
    if (formData.qty_out !== "") dataToSubmit.qty_out = Number(formData.qty_out);
    if (formData.in_cost !== "") dataToSubmit.in_cost = Number(formData.in_cost);
    if (formData.out_cost !== "") dataToSubmit.out_cost = Number(formData.out_cost);
    if (formData.amount_paid !== "")
      dataToSubmit.amount_paid = Number(formData.amount_paid);

    // Validation
    if (isPurchase && (!dataToSubmit.qty_in || dataToSubmit.qty_in <= 0)) {
      toast.error("Quantity In must be greater than 0 for a purchase");
      return;
    }
    if (isSale && (!dataToSubmit.qty_out || dataToSubmit.qty_out <= 0)) {
      toast.error("Quantity Out must be greater than 0 for a sale");
      return;
    }
    if (dataToSubmit.amount_paid && dataToSubmit.amount_paid > 0 && !dataToSubmit.supplier_id) {
      toast.error("Please select a supplier when entering an amount paid");
      return;
    }

    await onSubmit(dataToSubmit);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold mb-2">
          {transaction ? `Edit ${isPurchase ? "Purchase" : "Sale"}` : `Add ${isPurchase ? "Purchase" : "Sale"}`}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the transaction details below. Unit costs are automatically populated from item settings.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction Type */}
            <div>
              <label className="block font-medium mb-1 text-sm">Transaction Type *</label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              >
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            {/* Item */}
            <div>
              <label className="block font-medium mb-1 text-sm">Item *</label>
              <select
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              >
                <option value="">Select an item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({formatCurrency(item.cost_price || 0)})
                  </option>
                ))}
              </select>
              {selectedItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Cost Price: {formatCurrency(selectedItem.cost_price || 0)} |
                  Selling Price: {formatCurrency(selectedItem.selling_price || 0)}
                </p>
              )}
            </div>

            {/* Purchase Fields */}
            {isPurchase && (
              <>
                <div>
                  <label className="block font-medium mb-1 text-sm">Quantity In *</label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    name="qty_in"
                    value={formData.qty_in}
                    onChange={handleChange}
                    required
                    placeholder="Enter quantity"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm flex items-center gap-2">
                    Unit Cost (Purchase Price) *
                    <div className="relative inline-block">
                      <HelpCircle
                        className="w-4 h-4 text-blue-600 cursor-help"
                        onMouseEnter={() => setShowDiscountTooltip(true)}
                        onMouseLeave={() => setShowDiscountTooltip(false)}
                      />
                      {showDiscountTooltip && (
                        <div className="absolute left-6 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                          <div className="font-semibold mb-1">Got a discount?</div>
                          <div>
                            The default cost price is shown below. If you received a discounted price from your supplier,
                            simply change this amount to the actual discounted price you paid. The system will automatically
                            calculate your savings.
                          </div>
                          <div className="absolute -left-1 top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="in_cost"
                      value={formData.in_cost}
                      onChange={handleChange}
                      required
                      placeholder={selectedItem ? `Default: ${formatCurrency(selectedItem.cost_price || 0)}` : "Select an item first"}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
                    />
                  </div>
                  {selectedItem && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💡 Item&apos;s standard cost: {formatCurrency(selectedItem.cost_price || 0)}
                      {formData.in_cost && Number(formData.in_cost) !== selectedItem.cost_price && (
                        <span className="text-gray-600"> → You entered: {formatCurrency(Number(formData.in_cost))}</span>
                      )}
                    </p>
                  )}

                  {/* Discount Applied Notification */}
                  {hasDiscount && (
                    <div className="flex items-start gap-2 mt-2 p-2.5 bg-green-50 border border-green-300 rounded-lg">
                      <Info className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-green-800">
                        <div className="font-semibold">🎉 Discount Applied: {discountPercentage}% off!</div>
                        <div className="mt-1">
                          You&apos;re saving {formatCurrency(discountAmount)} per unit
                          <br />
                          Original: {formatCurrency(defaultCostPrice)} → Discounted: {formatCurrency(unitCost)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">Total Cost</label>
                  <input
                    type="text"
                    value={formatCurrency(totalInCost)}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-700 font-semibold"
                  />
                  {hasDiscount && quantity > 0 && (
                    <p className="text-xs text-green-700 mt-1 font-medium">
                      Total savings: {formatCurrency(totalSavings)}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Sale Fields */}
            {isSale && (
              <>
                <div>
                  <label className="block font-medium mb-1 text-sm">Quantity Out *</label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    name="qty_out"
                    value={formData.qty_out}
                    onChange={handleChange}
                    required
                    placeholder="Enter quantity"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">
                    Unit Cost (Sale Price) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="out_cost"
                      value={formData.out_cost}
                      onChange={handleChange}
                      required
                      placeholder={selectedItem ? `Default: ${formatCurrency(selectedItem.selling_price || 0)}` : "Select an item first"}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
                    />
                  </div>
                  {selectedItem && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💡 Item&apos;s standard selling price: {formatCurrency(selectedItem.selling_price || 0)}
                      {formData.out_cost && Number(formData.out_cost) !== selectedItem.selling_price && (
                        <span className="text-gray-600"> → You entered: {formatCurrency(Number(formData.out_cost))}</span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm">Total Sale Value</label>
                  <input
                    type="text"
                    value={formatCurrency(totalOutCost)}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-700 font-semibold"
                  />
                </div>
              </>
            )}

            {/* Supplier */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Supplier {formData.amount_paid && Number(formData.amount_paid) > 0 ? "*" : ""}
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {formData.amount_paid && Number(formData.amount_paid) > 0 && !formData.supplier_id && (
                <p className="text-red-500 text-xs mt-1">Supplier is required when amount paid is entered</p>
              )}
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block font-medium mb-1 text-sm">Amount Paid</label>
              <input
                type="number"
                min={0}
                step="0.01"
                name="amount_paid"
                value={formData.amount_paid}
                onChange={handleChange}
                placeholder="Enter amount paid"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium mb-1 text-sm">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            {/* Receiver */}
            {/**  <div>
              <label className="block font-medium mb-1 text-sm">Received By</label>
              <input
                type="text"
                value={currentUser?.name || "Unknown User"}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-600"
              />
            </div>*/}

            {/* Transaction Date */}
            <div>
              <label className="block font-medium mb-1 text-sm">Transaction Date</label>
              <input
                type="datetime-local"
                name="transaction_date"
                value={(formData.transaction_date || "").slice(0, 16)}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              />
            </div>

            {/* Reference No */}
            <div>
              <label className="block font-medium mb-1 text-sm">Reference No</label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no}
                onChange={handleChange}
                placeholder="Enter reference number"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-1 text-sm">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional notes..."
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-[#3D4C63] text-white hover:bg-[#495C79] disabled:opacity-50 transition-colors min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="flex gap-2 items-center justify-center">
                  <SmallLoader /> <span className="text-sm">Saving...</span>
                </span>
              ) : (
                `Save ${isPurchase ? "Purchase" : "Sale"}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}