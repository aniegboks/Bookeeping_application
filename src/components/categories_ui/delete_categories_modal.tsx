import React from "react";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DeleteCategoriesModalProps {
  selectedCategory: Category | null;
  setShowDeleteModal: (show: boolean) => void;
  confirmDelete: () => void;
  isDeleting?: boolean;
}

const DeleteCategoriesModal = ({
  selectedCategory,
  setShowDeleteModal,
  confirmDelete,
  isDeleting = false,
}: DeleteCategoriesModalProps) => {
  if (!selectedCategory) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setShowDeleteModal(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-sm shadow-lg max-w-sm w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div className="p-3 rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Delete Category</h2>
            <p className="mt-1 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedCategory.name}</span>? This
              action cannot be undone.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? (
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
  );
};

export default DeleteCategoriesModal;
