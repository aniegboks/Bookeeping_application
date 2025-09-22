"use client";

import { AcademicSession, CreateAcademicSessionData } from "@/lib/types/academic_session";
import SmallLoader from "../ui/small_loader";
import toast from "react-hot-toast";
import { useState } from "react";

export default function SessionModal({
  formData,
  setFormData,
  editingSession,
  setEditingSession,
  setShowModal,
  setSessions,
  sessions,
}: {
  formData: CreateAcademicSessionData;
  setFormData: React.Dispatch<React.SetStateAction<CreateAcademicSessionData>>;
  editingSession: AcademicSession | null;
  setEditingSession: React.Dispatch<React.SetStateAction<AcademicSession | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSessions: React.Dispatch<React.SetStateAction<AcademicSession[]>>;
  sessions: AcademicSession[];
}) {
  const [loading, setLoading] = useState(false);

  const resetForm = () =>
    setFormData({
      session: "",
      name: "",
      start_date: "",
      end_date: "",
      status: "active",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSession) {
        const res = await fetch(`/api/academic_session/${editingSession.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update session");
        const updated = await res.json();
        setSessions(sessions.map((s) => (s.id === editingSession.id ? updated : s)));
        toast.success("Session updated!");
      } else {
        const res = await fetch("/api/academic_session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create session");
        const created = await res.json();
        setSessions([...sessions, created]);
        toast.success("Session created!");
      }
      setShowModal(false);
      setEditingSession(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-[#171D26] mb-4">
          {editingSession ? "Edit Academic Session" : "Create New Academic Session"}
        </h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <input
              type="text"
              value={formData.session}
              onChange={(e) => setFormData({ ...formData, session: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#171D26]"
              placeholder="Enter session"
              required
              disabled={loading}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#171D26]"
              placeholder="Enter name"
              required
              disabled={loading}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#171D26]"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#171D26]"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#171D26]"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingSession(null);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg flex items-center gap-2 justify-center"
              disabled={loading}
            >
              {loading && <SmallLoader />}
              {editingSession ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
