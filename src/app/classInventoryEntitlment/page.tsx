"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  Package,
  Calendar,
  Filter,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import {
  classInventoryEntitlementsApi,
  ClassInventoryEntitlement,
  CreateClassInventoryEntitlementRequest,
} from "@/lib/class_inventory_entitlement";

// Get token from cookies
const getToken = (): string | undefined =>
  document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

export default function ClassInventoryDashboard() {
  const [entitlements, setEntitlements] = useState<ClassInventoryEntitlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEntitlement, setEditingEntitlement] = useState<ClassInventoryEntitlement | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState<CreateClassInventoryEntitlementRequest>({
    class_id: "",
    inventory_item_id: "",
    session_term_id: "",
    quantity: 0,
    notes: "",
    created_by: "current-user",
  });

  const [lookup, setLookup] = useState({
    classes: [] as { id: string; name: string }[],
    inventoryItems: [] as { id: string; name: string }[],
    sessionTerms: [] as { id: string; name: string }[],
  });

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Fetch lookup data
  const loadLookups = useCallback(async () => {
    const token = getToken();
    try {
      const [classesRes, itemsRes, termsRes] = await Promise.all([
        classInventoryEntitlementsApi.getClasses(token),
        classInventoryEntitlementsApi.getInventoryItems(token),
        classInventoryEntitlementsApi.getSessionTerms(token),
      ]);
      setLookup({
        classes: classesRes.data || [],
        inventoryItems: itemsRes.data || [],
        sessionTerms: termsRes.data || [],
      });
    } catch {
      showNotification("Failed to load lookup data", "error");
    }
  }, [showNotification]);

  const loadEntitlements = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await classInventoryEntitlementsApi.getAllClassInventoryEntitlements({}, token);
      if (res.data) setEntitlements(res.data);
      else showNotification(res.error || "Failed to load entitlements", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadLookups();
    loadEntitlements();
  }, [loadLookups, loadEntitlements]);

  const openModal = (entitlement?: ClassInventoryEntitlement) => {
    if (entitlement) {
      setEditingEntitlement(entitlement);
      setFormData({
        class_id: entitlement.class_id,
        inventory_item_id: entitlement.inventory_item_id,
        session_term_id: entitlement.session_term_id,
        quantity: entitlement.quantity,
        notes: entitlement.notes,
        created_by: entitlement.created_by,
      });
    } else {
      setEditingEntitlement(null);
      setFormData({
        class_id: "",
        inventory_item_id: "",
        session_term_id: "",
        quantity: 0,
        notes: "",
        created_by: "current-user",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntitlement(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = getToken();
    try {
      if (editingEntitlement) {
        const res = await classInventoryEntitlementsApi.updateClassInventoryEntitlement(
          editingEntitlement.id,
          formData,
          token
        );
        if (res.data) {
          showNotification("Entitlement updated!", "success");
          loadEntitlements();
          closeModal();
        } else showNotification(res.error || "Failed to update", "error");
      } else {
        const res = await classInventoryEntitlementsApi.createClassInventoryEntitlement(formData, token);
        if (res.data) {
          showNotification("Entitlement created!", "success");
          loadEntitlements();
          closeModal();
        } else showNotification(res.error || "Failed to create", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entitlement?")) return;
    setLoading(true);
    const token = getToken();
    const res = await classInventoryEntitlementsApi.deleteClassInventoryEntitlement(id, token);
    if (res.status === 204) {
      showNotification("Entitlement deleted!", "success");
      loadEntitlements();
    } else showNotification(res.error || "Failed to delete", "error");
    setLoading(false);
  };

  // Filters
  const filteredEntitlements = entitlements.filter((e) => {
    const matchesSearch =
      lookup.classes.find((c) => c.id === e.class_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lookup.inventoryItems.find((i) => i.id === e.inventory_item_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || e.class_id === selectedClass;
    const matchesTerm = !selectedTerm || e.session_term_id === selectedTerm;
    return matchesSearch && matchesClass && matchesTerm;
  });

  const getTotalQuantity = () => filteredEntitlements.reduce((sum, e) => sum + e.quantity, 0);
  const getUniqueClasses = () => new Set(filteredEntitlements.map((e) => e.class_id)).size;

  const getClassName = (id: string) => lookup.classes.find((c) => c.id === id)?.name || "Unknown";
  const getItemName = (id: string) => lookup.inventoryItems.find((i) => i.id === id)?.name || "Unknown";
  const getTermName = (id: string) => lookup.sessionTerms.find((t) => t.id === id)?.name || "Unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Class Inventory Entitlements</h1>
              <p className="text-gray-600 text-sm">Manage inventory allocations for classes</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Entitlement
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
        >
          {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Entitlements</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEntitlements.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalQuantity()}</p>
              </div>
              <Package className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{getUniqueClasses()}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Session Terms</p>
                <p className="text-2xl font-bold text-gray-900">{lookup.sessionTerms.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search entitlements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            >
              <option value="">All Classes</option>
              {lookup.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            >
              <option value="">All Terms</option>
              {lookup.sessionTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedClass("");
                setSelectedTerm("");
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Inventory Item</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Session Term</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Notes</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && entitlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading entitlements...</p>
                    </td>
                  </tr>
                ) : filteredEntitlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No entitlements found</p>
                      <button
                        onClick={() => openModal()}
                        className="text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        Create your first entitlement
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredEntitlements.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{getClassName(e.class_id)}</td>
                      <td className="px-6 py-4">{getItemName(e.inventory_item_id)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTermName(e.session_term_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{e.quantity}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{e.notes || "-"}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => openModal(e)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEntitlement ? "Edit Entitlement" : "Add New Entitlement"}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select a class</option>
                    {lookup.classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inventory Item</label>
                  <select
                    value={formData.inventory_item_id}
                    onChange={(e) => setFormData({ ...formData, inventory_item_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select an item</option>
                    {lookup.inventoryItems.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Term</label>
                  <select
                    value={formData.session_term_id}
                    onChange={(e) => setFormData({ ...formData, session_term_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select a term</option>
                    {lookup.sessionTerms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  {editingEntitlement ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
