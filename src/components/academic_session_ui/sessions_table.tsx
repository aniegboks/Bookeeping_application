"use client";

import { useState } from "react";
import { AcademicSession } from "@/lib/types/academic_session";
import { BookOpen, Plus, PenSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

// Delete modal component
function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Confirm Deletion
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete this academic session? This action
          cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Main sessions table component
export default function SessionsTable({
  sessions,
  setSessions,
  openCreateModal,
  openEditModal,
}: {
  sessions: AcademicSession[];
  setSessions: React.Dispatch<React.SetStateAction<AcademicSession[]>>;
  openCreateModal: () => void;
  openEditModal: (session: AcademicSession) => void;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/academic_session/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorMessage = "Failed to delete session";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await res.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Academic session deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete academic session");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#171D26]">
            Academic Sessions
          </h2>
          <button
            onClick={openCreateModal}
            className="bg-[#3D4C63] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#495C79] transition-colors"
          >
            <Plus size={16} /> Add New Session
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Session", "Name", "Start Date", "End Date", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-[#171D26]">
                    {session.session}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{session.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(session.start_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
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
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => openEditModal(session)}
                      className="text-[#3D4C63] hover:text-[#495C79] p-1 rounded hover:bg-blue-50"
                    >
                      <PenSquare size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(session.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
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
                Get started by creating a new session.
              </p>
              <div className="mt-6">
                <button
                  onClick={openCreateModal}
                  className="bg-[#3D4C63] text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto hover:bg-[#495C79] transition-colors"
                >
                  <Plus size={16} /> Add New Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
      />
    </>
  );
}
