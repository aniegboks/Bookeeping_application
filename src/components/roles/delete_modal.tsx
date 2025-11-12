"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteRoleModalProps {
  roleCode: string;
  roleName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteRoleModal({
  roleCode,
  roleName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteRoleModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#171D26] mb-2">
              Delete Role
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <div className="bg-gray-50 rounded p-3 mb-4 space-y-1">
              {roleName && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {roleName}
                </p>
              )}
              <p className="text-xs text-gray-500 font-mono break-all">
                Code: {roleCode}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
