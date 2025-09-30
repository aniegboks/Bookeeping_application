"use client";

import { useState, useEffect } from "react";
import { inventoryItemApi } from "@/lib/inventory_item";
import { Brand } from "@/lib/brands";
import { Category } from "@/lib/types/categories";
import { SubCategory } from "@/lib/types/sub_categories";
import { UOM } from "@/lib/types/uom";
import { InventoryItem } from "@/lib/types/inventory_item";

interface InventoryItemFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
  onCancel: () => void; // <-- added cancel callback
  brands: Brand[];
  categories: Category[];
  subCategories: SubCategory[];
  uoms: UOM[];
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
  const [formData, setFormData] = useState({
    sku: item?.sku || "",
    name: item?.name || "",
    category_id: item?.category_id || "",
    sub_category_id: item?.sub_category_id || "",
    brand_id: item?.brand_id || "",
    uom_id: item?.uom_id || "",
    barcode: item?.barcode || "",
    cost_price: item?.cost_price?.toString() || "",
    selling_price: item?.selling_price?.toString() || "",
  });

  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.category_id) {
      const filtered = subCategories.filter(
        (sub) => sub.category_id === formData.category_id
      );
      setFilteredSubCategories(filtered);

      if (formData.sub_category_id && !filtered.some((s) => s.id === formData.sub_category_id)) {
        setFormData((prev) => ({ ...prev, sub_category_id: "" }));
      }
    } else {
      setFilteredSubCategories([]);
      setFormData((prev) => ({ ...prev, sub_category_id: "" }));
    }
  }, [formData.category_id, subCategories]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.brand_id) newErrors.brand_id = "Brand is required";
    if (!formData.uom_id) newErrors.uom_id = "Unit of measure is required";
    if (!formData.cost_price) newErrors.cost_price = "Cost price is required";
    if (!formData.selling_price) newErrors.selling_price = "Selling price is required";

    if (formData.cost_price && isNaN(Number(formData.cost_price)))
      newErrors.cost_price = "Cost price must be a number";
    if (formData.selling_price && isNaN(Number(formData.selling_price)))
      newErrors.selling_price = "Selling price must be a number";
    if (formData.cost_price && Number(formData.cost_price) < 0)
      newErrors.cost_price = "Cost price cannot be negative";
    if (formData.selling_price && Number(formData.selling_price) < 0)
      newErrors.selling_price = "Selling price cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("user_id") || "default-user-id";
      const payload: any = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        brand_id: formData.brand_id,
        uom_id: formData.uom_id,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        //created_by: userId,
      };
      if (formData.sku.trim()) payload.sku = formData.sku.trim();
      if (formData.sub_category_id) payload.sub_category_id = formData.sub_category_id;
      if (formData.barcode.trim()) payload.barcode = formData.barcode.trim();

      if (item) {
        await inventoryItemApi.update(item.id, payload);
      } else {
        await inventoryItemApi.create(payload);
      }

      onSuccess();
    } catch (err: any) {
      console.log("Error saving inventory item:", err);
      setErrors({
        submit: err.message || "Failed to save inventory item. Please check all required fields.",
      });
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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh] relative">
        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {item ? "Edit Inventory Item" : "Create Inventory Item"}
        </h2>

        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {errors.submit}
          </div>
        )}

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
                Name <span className="text-red-500">*</span>
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
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
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
              {errors.category_id && (
                <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>
              )}
            </div>

            {/* Sub-Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Sub-Category</label>
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
                Brand <span className="text-red-500">*</span>
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
              {errors.brand_id && (
                <p className="text-red-500 text-xs mt-1">{errors.brand_id}</p>
              )}
            </div>

            {/* UOM */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit of Measure <span className="text-red-500">*</span>
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
              {errors.uom_id && <p className="text-red-500 text-xs mt-1">{errors.uom_id}</p>}
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
                Cost Price <span className="text-red-500">*</span>
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
              {errors.cost_price && (
                <p className="text-red-500 text-xs mt-1">{errors.cost_price}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price <span className="text-red-500">*</span>
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
              {errors.selling_price && (
                <p className="text-red-500 text-xs mt-1">{errors.selling_price}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSubmitting ? "Saving..." : item ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
