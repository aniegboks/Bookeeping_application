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
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "add" ? "Add New Supplier" : "Edit Supplier"}
          </h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-8 overflow-y-auto flex-1"
        >
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contact Name (Now First) */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>

              {/* Company Name (Auto-filled, Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 bg-gray-50 cursor-not-allowed"
                  placeholder="Auto-filled from contact name"
                />
              </div>

              {/* Email */}
              <div className="col-span-1 md:col-span-3">
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Notes</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#3D4C63] text-white rounded-lg hover:bg-[#2f3a4e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D4C63] disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex gap-2">
                  <SmallLoader />
                  Sending...
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