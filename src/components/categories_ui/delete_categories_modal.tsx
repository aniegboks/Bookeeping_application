import React from "react";

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
}

const DeleteCategoriesModal = ({
  selectedCategory,
  setShowDeleteModal,
  confirmDelete,
}: DeleteCategoriesModalProps) => {
  if (!selectedCategory) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setShowDeleteModal(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-sm z-10">
        <h2 className="text-lg font-semibold text-gray-800">Delete Category</h2>
        <p className="text-sm text-gray-600 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-medium">{selectedCategory.name}</span>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoriesModal;
