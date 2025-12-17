"use client";

import { useState, useEffect, useMemo } from "react";
import {
  StudentInventoryCollection,
  CreateStudentInventoryCollectionInput,
} from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { User } from "@/lib/types/user";
import { AlertCircle, CheckCircle, XCircle, Package, Info } from "lucide-react";
import { 
  getFilteredInventoryItems,
  formatDistributedItemDisplay,
  hasSufficientStock,
  getStockStatus
} from "@/lib/utils/inventory_distribution_helper";

interface Class {
  id: string;
  name: string;
}

interface CollectionFormProps {
  collection?: StudentInventoryCollection;
  onSubmit: (data: CreateStudentInventoryCollectionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  students: Student[];
  inventoryItems: InventoryItem[];
  sessionTerms: AcademicSession[];
  distributions: InventoryDistribution[];
  collections: StudentInventoryCollection[]; // ADD THIS
  users: User[];
  classes: Class[];
}

export default function CollectionForm({
  collection,
  onSubmit,
  onCancel,
  isSubmitting,
  students,
  inventoryItems,
  sessionTerms,
  distributions,
  collections, // ADD THIS
  users,
  classes,
}: CollectionFormProps) {
  const [formData, setFormData] = useState<CreateStudentInventoryCollectionInput>({
    student_id: "",
    class_id: "",
    session_term_id: "",
    inventory_item_id: "",
    qty: 0,
    eligible: true,
    received: false,
    received_date: null,
    given_by: null,
  });

  // Helper: get student full name
  const getFullName = (s: Student) =>
    [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");

  // When editing an existing record
  useEffect(() => {
    if (collection) {
      setFormData({
        student_id: collection.student_id,
        class_id: collection.class_id,
        session_term_id: collection.session_term_id,
        inventory_item_id: collection.inventory_item_id,
        qty: collection.qty,
        eligible: collection.eligible,
        received: collection.received,
        received_date: collection.received_date || null,
        given_by: collection.given_by || null,
      });
    }
  }, [collection]);

  // Filter students based on selected class
  const filteredStudents = useMemo(() => {
    if (!formData.class_id) return [];
    return students.filter((s) => s.class_id === formData.class_id);
  }, [students, formData.class_id]);

  // Get available items based on distributions AND remaining stock
  const availableItems = useMemo(() => {
    if (!formData.class_id || !formData.session_term_id) {
      return [];
    }
    
    return getFilteredInventoryItems(
      inventoryItems,
      distributions,
      collections,
      formData.class_id,
      formData.session_term_id,
      collection?.id // Exclude current record when editing
    );
  }, [inventoryItems, distributions, collections, formData.class_id, formData.session_term_id, collection]);

  // Get stock status for selected item
  const stockStatus = useMemo(() => {
    if (!formData.inventory_item_id || !formData.class_id || !formData.session_term_id) {
      return null;
    }
    
    return getStockStatus(
      distributions,
      collections,
      formData.inventory_item_id,
      formData.class_id,
      formData.session_term_id,
      collection?.id // Exclude current record when editing
    );
  }, [distributions, collections, formData.inventory_item_id, formData.class_id, formData.session_term_id, collection]);

  // Check if quantity is valid
  const isQuantityValid = useMemo(() => {
    if (!formData.qty || !formData.inventory_item_id || !formData.class_id || !formData.session_term_id) {
      return true;
    }
    
    return hasSufficientStock(
      distributions,
      collections,
      formData.inventory_item_id,
      formData.class_id,
      formData.session_term_id,
      formData.qty,
      collection?.id // Exclude current record when editing
    );
  }, [distributions, collections, formData.qty, formData.inventory_item_id, formData.class_id, formData.session_term_id, collection]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isQuantityValid) {
      return;
    }
    
    await onSubmit(formData);
  };

  // Show distribution info banner
  const showDistributionInfo = formData.class_id && formData.session_term_id;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-semibold text-[#171D26] mb-4">
          {collection ? "Edit Collection" : "Create New Collection"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Distribution Info Banner */}
          {showDistributionInfo && availableItems.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">No items available</p>
                <p>
                  Either no items have been distributed to this class for the selected session, 
                  or all distributed items have already been assigned to students.
                  Please distribute more items before creating student collections.
                </p>
              </div>
            </div>
          )}

          {showDistributionInfo && availableItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">{availableItems.length} item(s) available for assignment</p>
                <p>
                  These items have remaining stock and are ready for student assignment.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class Select (first) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    class_id: e.target.value,
                    student_id: "",
                    inventory_item_id: "", // Reset item when class changes
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Term <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.session_term_id}
                onChange={(e) =>
                  setFormData({ 
                    ...formData, 
                    session_term_id: e.target.value,
                    inventory_item_id: "", // Reset item when session changes
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="">Select term</option>
                {sessionTerms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Select (depends on class) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.student_id}
                onChange={(e) =>
                  setFormData({ ...formData, student_id: e.target.value })
                }
                disabled={!formData.class_id || isSubmitting}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              >
                <option value="">
                  {formData.class_id
                    ? "Select student"
                    : "Select class first"}
                </option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getFullName(s)}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Item - Filtered by distribution and remaining stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.inventory_item_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventory_item_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting || !formData.class_id || !formData.session_term_id}
              >
                <option value="">
                  {!formData.class_id || !formData.session_term_id
                    ? "Select class and session first"
                    : availableItems.length === 0
                    ? "No items available"
                    : "Select item"}
                </option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {formatDistributedItemDisplay(item)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity with Stock Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  !isQuantityValid 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-[#3D4C63]"
                }`}
                required
                disabled={isSubmitting}
              />
              {formData.inventory_item_id && stockStatus && (
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Info className="w-3 h-3" />
                    <span>
                      {stockStatus.totalDistributed} distributed, {stockStatus.totalAssigned} assigned
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isQuantityValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={isQuantityValid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {stockStatus.available} available
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Received Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Date
              </label>
              <input
                type="date"
                value={
                  formData.received_date
                    ? formData.received_date.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    received_date: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="eligible"
                checked={formData.eligible}
                onChange={(e) =>
                  setFormData({ ...formData, eligible: e.target.checked })
                }
                className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded focus:ring-[#3D4C63]"
                disabled={isSubmitting}
              />
              <label htmlFor="eligible" className="ml-2 text-sm font-medium text-gray-700">
                Eligible
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="received"
                checked={formData.received}
                onChange={(e) =>
                  setFormData({ ...formData, received: e.target.checked })
                }
                className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded focus:ring-[#3D4C63]"
                disabled={isSubmitting}
              />
              <label htmlFor="received" className="ml-2 text-sm font-medium text-gray-700">
                Received
              </label>
            </div>
          </div>

          {/* Insufficient Stock Warning */}
          {!isQuantityValid && formData.qty > 0 && stockStatus && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Insufficient available stock</p>
                <p>
                  You requested <strong>{formData.qty}</strong> items, but only <strong>{stockStatus.available}</strong> are available.
                </p>
                <p className="mt-1 text-xs">
                  Breakdown: {stockStatus.totalDistributed} distributed - {stockStatus.totalAssigned} already assigned = {stockStatus.available} available
                </p>
                <p className="mt-1">
                  Please reduce the quantity to {stockStatus.available} or less, or distribute more items to this class first.
                </p>
              </div>
            </div>
          )}

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
              disabled={isSubmitting || !isQuantityValid || availableItems.length === 0}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : collection ? (
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