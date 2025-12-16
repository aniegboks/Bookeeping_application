// components/academic_session_ui/sessions_table.tsx
"use client";

import { useState } from "react";
import { AcademicSession } from "@/lib/types/academic_session";
import { BookOpen, Plus, PenSquare, Trash2, ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";

function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-sm shadow-lg w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-100">
            <TriangleAlert className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
              Confirm Deletion
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this academic session? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
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
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionsTable({
  sessions,
  setSessions,
  openCreateModal,
  openEditModal,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: {
  sessions: AcademicSession[];
  setSessions: React.Dispatch<React.SetStateAction<AcademicSession[]>>;
  openCreateModal: () => void;
  openEditModal: (session: AcademicSession) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasAnyActionPermission = canUpdate || canDelete;

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast.error("Access denied: You don't have permission to delete academic sessions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/academic_session/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        let errorMessage = "Failed to delete session";
        
        // Try to get detailed error from response
        try {
          const errorData = await res.json();
          
          if (errorData.error) {
            // Parse specific error types
            if (errorData.error.includes("foreign key") || errorData.error.includes("constraint")) {
              errorMessage = "Cannot delete this session: It is currently being used by students, classes, or other records. Please remove those associations first.";
            } else if (errorData.error.includes("not found")) {
              errorMessage = "Session not found: This session may have already been deleted.";
            } else if (errorData.error.includes("active")) {
              errorMessage = "Cannot delete active session: Please set the session status to inactive before deleting.";
            } else {
              errorMessage = errorData.error;
            }
          }
        } catch {
          // If JSON parsing fails, try to get text response
          const text = await res.text();
          if (text) {
            errorMessage = text;
          } else {
            // Status-specific errors
            if (res.status === 404) {
              errorMessage = "Session not found: This session may have already been deleted.";
            } else if (res.status === 403) {
              errorMessage = "Access denied: You don't have permission to delete this session.";
            } else if (res.status === 409) {
              errorMessage = "Conflict: This session cannot be deleted because it's being used by other records.";
            } else if (res.status === 500) {
              errorMessage = "Server error: Something went wrong on our end. Please try again later or contact support.";
            } else {
              errorMessage = `Unable to delete session (Error ${res.status}). Please try again.`;
            }
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Success
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Academic session deleted successfully!", {
        duration: 3000,
      });
      
      // Adjust pagination if needed
      if (paginatedSessions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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
        toast.error("An unexpected error occurred while deleting the session. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const openDeleteModal = (id: string) => {
    if (!canDelete) {
      toast.error("Access denied: You don't have permission to delete academic sessions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setDeleteId(id);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <div className="bg-white rounded-sm border border-gray-200 px-6 py-4">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#171D26] tracking-tighter">
            Academic Sessions
          </h2>
          {canCreate && (
            <button
              onClick={openCreateModal}
              className="bg-[#3D4C63] text-white flex items-center gap-2 hover:bg-[#495C79] transition-colors px-2 py-2 rounded-sm"
            >
              <Plus size={16} /> Add New Session
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 py-4">
              <tr>
                {["Session", "Name", "Start Date", "End Date", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
                {hasAnyActionPermission && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 py-4">
                  <td className="px-6 py-4 text-sm font-medium text-[#171D26]">
                    {session.session}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-900">{session.name}</td>
                  <td className="px-6 py-6 text-sm text-gray-500">
                    {formatDate(session.start_date)}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-500">
                    {formatDate(session.end_date)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  {hasAnyActionPermission && (
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => openEditModal(session)}
                          className="text-[#3D4C63] hover:text-[#495C79] p-1 rounded hover:bg-blue-50"
                          title="Edit session"
                        >
                          <PenSquare className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => openDeleteModal(session.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No academic sessions
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {canCreate
                  ? "Get started by creating a new session."
                  : "No academic sessions available."}
              </p>
              {canCreate && (
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm flex items-center gap-2 mx-auto hover:bg-[#495C79] transition-colors"
                  >
                    <Plus size={16} />Create Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {sessions.length > itemsPerPage && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 inline" />
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        loading={deleting}
      />
    </>
  );
}