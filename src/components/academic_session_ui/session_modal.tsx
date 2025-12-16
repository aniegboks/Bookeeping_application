// components/academic_session_ui/session_modal.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { AcademicSession, CreateAcademicSessionData } from "@/lib/types/academic_session";
import { X } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

  const validateForm = (): string | null => {
    if (!formData.session.trim()) {
      return "Session field is required. Please enter a session code (e.g., '2024/2025').";
    }
    if (!formData.name.trim()) {
      return "Session name is required. Please enter a descriptive name.";
    }
    if (!formData.start_date) {
      return "Start date is required. Please select when this session begins.";
    }
    if (!formData.end_date) {
      return "End date is required. Please select when this session ends.";
    }

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (end <= start) {
      return "Invalid date range: End date must be after the start date.";
    }

    // Check for duplicate session code (only for new sessions or if session code changed)
    if (!editingSession || editingSession.session !== formData.session) {
      const duplicate = sessions.find(
        (s) => s.session.toLowerCase() === formData.session.toLowerCase()
      );
      if (duplicate) {
        return `A session with code "${formData.session}" already exists. Please use a different session code.`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError, {
        duration: 4000,
      });
      return;
    }

    setSaving(true);

    try {
      const url = editingSession
        ? `/api/academic_session/${editingSession.id}`
        : "/api/academic_session";
      const method = editingSession ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let errorMessage = editingSession 
          ? "Failed to update academic session" 
          : "Failed to create academic session";

        try {
          const errorData = await res.json();

          if (errorData.error) {
            // Parse specific error types
            if (errorData.error.includes("unique") || errorData.error.includes("duplicate")) {
              errorMessage = `A session with code "${formData.session}" already exists. Please use a different session code.`;
            } else if (errorData.error.includes("foreign key")) {
              errorMessage = "Related records exist. Please remove associated data before making this change.";
            } else if (errorData.error.includes("not found")) {
              errorMessage = "Session not found. It may have been deleted by another user.";
            } else if (errorData.error.includes("validation")) {
              errorMessage = "Validation error: Please check your input and try again.";
            } else if (errorData.error.includes("date")) {
              errorMessage = "Invalid dates: Please ensure the end date is after the start date.";
            } else {
              errorMessage = errorData.error;
            }
          }
        } catch {
          const text = await res.text();
          if (text) {
            errorMessage = text;
          } else {
            // Status-specific errors
            if (res.status === 400) {
              errorMessage = "Invalid input: Please check your data and try again.";
            } else if (res.status === 403) {
              errorMessage = "Access denied: You don't have permission to perform this action.";
            } else if (res.status === 404) {
              errorMessage = "Session not found. It may have been deleted.";
            } else if (res.status === 409) {
              errorMessage = `Conflict: A session with code "${formData.session}" already exists.`;
            } else if (res.status === 500) {
              errorMessage = "Server error: Something went wrong. Please try again later or contact support.";
            } else {
              errorMessage += ` (Error ${res.status}). Please try again.`;
            }
          }
        }

        throw new Error(errorMessage);
      }

      const savedSession = await res.json();

      if (editingSession) {
        setSessions((prev) =>
          prev.map((s) => (s.id === editingSession.id ? savedSession : s))
        );
        toast.success(`"${savedSession.name}" has been updated successfully!`, {
          duration: 3000,
        });
      } else {
        setSessions((prev) => [...prev, savedSession]);
        toast.success(`"${savedSession.name}" has been created successfully!`, {
          duration: 3000,
        });
      }

      setShowModal(false);
      setEditingSession(null);
    } catch (err: unknown) {
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error("Network error: Unable to connect to the server. Please check your internet connection and try again.", {
          duration: 5000,
        });
      } else if (err instanceof Error) {
        toast.error(err.message, {
          duration: 5000,
        });
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)}></div>
      <div className="relative z-10 bg-white rounded-sm shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingSession ? "Edit Academic Session" : "Create Academic Session"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.session}
              onChange={(e) => setFormData({ ...formData, session: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              placeholder="e.g., 2024/2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              placeholder="e.g., Fall Semester 2024"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 108 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  {editingSession ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingSession ? "Update Session" : "Create Session"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}