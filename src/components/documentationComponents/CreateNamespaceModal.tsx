import React, { useState } from "react";
import axios from "axios";
import { backendURL } from "../../utils/constants";
import { useAuth } from "../../providers/AuthContext";
import { FiX } from "react-icons/fi";

interface CreateNamespaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNamespaceModal: React.FC<CreateNamespaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [namespaceName, setNamespaceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSuccess, handleError } = useAuth();
  const userId = localStorage.getItem("user_id");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namespaceName.trim()) {
      handleError("Please enter a namespace name");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${backendURL}/api/create-namespace`,
        {
          name: namespaceName.trim(),
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        handleSuccess("Namespace created successfully");
        setNamespaceName("");
        onSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to create namespace";

      handleError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Create New Namespace
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="namespaceName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Namespace Name
              </label>
              <input
                type="text"
                id="namespaceName"
                value={namespaceName}
                onChange={(e) => setNamespaceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter namespace name"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-indigo-600 !text-white rounded-md font-medium transition-colors ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Namespace"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNamespaceModal;
