// components/school_class_ui/delete_modal.tsx

import { AlertTriangle } from "lucide-react";
import { SchoolClass } from "@/lib/types/classes";

interface DeleteModalProps {
  schoolClass: SchoolClass;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteModal({
  schoolClass,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete School Class
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this class? This action cannot be undone and may affect students and records associated with this class.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Class Name:</p>
                <p className="text-sm font-semibold text-gray-900">
                  {schoolClass.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Class ID:</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {schoolClass.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status:</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    schoolClass.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {schoolClass.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Class"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}