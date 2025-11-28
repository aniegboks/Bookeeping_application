"use client";
import React, { useState, useEffect } from "react";
import { Supplier } from "@/lib/types/suppliers";
import SmallLoader from "../ui/small_loader";

interface Props {
  supplier: Supplier | null;
  mode: "add" | "edit";
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onSubmit: (
    data: Omit<Supplier, "id" | "created_at" | "updated_at" | "created_by">
  ) => Promise<void>;
}

type SupplierForm = Omit<
  Supplier,
  "id" | "created_at" | "updated_at" | "created_by"
>;

export default function SupplierModal({
  supplier,
  mode,
  onClose,
  onSubmit,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<SupplierForm>({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier && mode === "edit") {
      const { ...rest } = supplier;
      setFormData(rest);
    } else if (mode === "add") {
      setFormData({
        name: "",
        contact_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        website: "",
        notes: "",
      });
    }
  }, [supplier, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // If contact_name is being changed, automatically update the company name
    if (name === "contact_name") {
      setFormData((prev) => ({ 
        ...prev, 
        contact_name: value,
        name: value // Auto-fill company name with contact name
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Modal submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "add" ? "Add New Supplier" : "Edit Supplier"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {mode === "add" 
              ? "Fill in the details to add a new supplier" 
              : "Update supplier information"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Basic Information - 3 Column Grid */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-5 bg-[#3D4C63] rounded-full mr-2"></span>
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter contact name"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Auto-filled"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact Details - 2 Column Grid */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-5 bg-[#3D4C63] rounded-full mr-2"></span>
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://company.com"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Address Information - 4 Column Grid */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-5 bg-[#3D4C63] rounded-full mr-2"></span>
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>

              {/* Country - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-5 bg-[#3D4C63] rounded-full mr-2"></span>
              Additional Notes
            </h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Add any additional notes or comments..."
              className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#3D4C63] text-white rounded-lg hover:bg-[#2f3a4e] transition-all focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:ring-offset-2 disabled:opacity-70 font-medium shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <SmallLoader />
                  Saving...
                </span>
              ) : mode === "add" ? (
                "Add Supplier"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}