"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { inventoryItemApi } from "@/lib/inventory_item";
import { Brand } from "@/lib/brands";
import { Category } from "@/lib/types/categories";
import { SubCategory } from "@/lib/types/sub_categories";
import { UOM } from "@/lib/types/uom";
import {
  InventoryItem,
  CreateInventoryItemInput,
} from "@/lib/types/inventory_item";
import SmallLoader from "../ui/small_loader";

interface InventoryItemFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
  onCancel: () => void;
  brands: Brand[];
  categories: Category[];
  subCategories: SubCategory[];
  uoms: UOM[];
}

interface InventoryItemFormData {
  sku: string;
  name: string;
  category_id: string;
  sub_category_id: string;
  brand_id: string;
  uom_id: string;
  barcode: string;
  cost_price: string;
  selling_price: string;
  low_stock_threshold: string;
}

export default function InventoryItemForm({
  item,
  onSuccess,
  onCancel,
  brands,
  categories,
  subCategories,
  uoms,
}: InventoryItemFormProps) {
  const [formData, setFormData] = useState<InventoryItemFormData>({
    sku: item?.sku || "",
    name: item?.name || "",
    category_id: item?.category_id || "",
    sub_category_id: item?.sub_category_id || "",
    brand_id: item?.brand_id || "",
    uom_id: item?.uom_id || "",
    barcode: item?.barcode || "",
    cost_price: item?.cost_price?.toString() || "",
    selling_price: item?.selling_price?.toString() || "0",
    low_stock_threshold: item?.low_stock_threshold?.toString() || "0",
  });

  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const filtered = subCategories.filter(
        (sub) => sub.category_id === formData.category_id
      );
      setFilteredSubCategories(filtered);

      if (
        formData.sub_category_id &&
        !filtered.some((s) => s.id === formData.sub_category_id)
      ) {
        setFormData((prev) => ({ ...prev, sub_category_id: "" }));
      }
    } else {
      setFilteredSubCategories([]);
      setFormData((prev) => ({ ...prev, sub_category_id: "" }));
    }
  }, [formData.category_id, subCategories, formData.sub_category_id]);

  // Simple validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.brand_id) newErrors.brand_id = "Brand is required";
    if (!formData.uom_id) newErrors.uom_id = "Unit of measure is required";
    if (!formData.cost_price) newErrors.cost_price = "Cost price is required";
    if (!formData.selling_price) newErrors.selling_price = "Selling price is required";
    if (!formData.low_stock_threshold)
      newErrors.low_stock_threshold = "Low stock threshold is required";

    if (formData.cost_price && isNaN(Number(formData.cost_price)))
      newErrors.cost_price = "Cost price must be a number";
    if (formData.selling_price && isNaN(Number(formData.selling_price)))
      newErrors.selling_price = "Selling price must be a number";
    if (formData.low_stock_threshold && isNaN(Number(formData.low_stock_threshold)))
      newErrors.low_stock_threshold = "Low stock threshold must be a number";

    if (Number(formData.cost_price) < 0)
      newErrors.cost_price = "Cost price cannot be negative";
    if (Number(formData.selling_price) < 0)
      newErrors.selling_price = "Selling price cannot be negative";
    if (Number(formData.low_stock_threshold) < 0)
      newErrors.low_stock_threshold = "Low stock threshold cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getApiErrorMessage = (err: unknown, fallback = "Failed to save inventory item"): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      return apiErr.response?.data?.error ?? fallback;
    }
    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Correctly typed payload
      const payload: CreateInventoryItemInput = {
        sku: formData.sku.trim() || "",
        name: formData.name.trim(),
        category_id: formData.category_id,
        brand_id: formData.brand_id,
        uom_id: formData.uom_id,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        low_stock_threshold: parseFloat(formData.low_stock_threshold),
        sub_category_id: formData.sub_category_id || "",
        barcode: formData.barcode.trim() || "",
      };

      if (item) {
        await inventoryItemApi.update(item.id, payload);
        toast.success("Inventory item updated successfully!");
      } else {
        await inventoryItemApi.create(payload);
        toast.success("Inventory item created successfully!");
      }

      onSuccess();
    } catch (err: unknown) {
      console.error("Error saving inventory item:", err);
      const message = getApiErrorMessage(err);
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh] relative">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 py-4">
          {item ? "Edit Inventory Item" : "Create Inventory Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium mb-1">
                SKU <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-gray-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-gray-400">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category_id ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Sub-Category <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                name="sub_category_id"
                value={formData.sub_category_id}
                onChange={handleChange}
                disabled={!formData.category_id}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {formData.category_id ? "Select Sub-Category" : "Select Category First"}
                </option>
                {filteredSubCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Brand <span className="text-gray-400">*</span>
              </label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.brand_id ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* UOM */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit of Measure <span className="text-gray-400">*</span>
              </label>
              <select
                name="uom_id"
                value={formData.uom_id}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.uom_id ? "border-red-500" : ""
                }`}
              >
                <option value="">Select UOM</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Barcode <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Price <span className="text-gray-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cost_price ? "border-red-500" : ""
                }`}
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price <span className="text-gray-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.selling_price ? "border-red-500" : ""
                }`}
              />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Low Stock Threshold <span className="text-gray-400">*</span>
              </label>
              <input
                type="number"
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.low_stock_threshold ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-sm text-sm text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#3D4C63] hover:bg-[#495C79]"
              }`}
            >
              {isSubmitting ? (
                <span className="flex gap-2">
                  <SmallLoader />
                  <p className="text-sm font-semibold">Saving...</p>
                </span>
              ) : item ? (
                "Update Item"
              ) : (
                "Create Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
