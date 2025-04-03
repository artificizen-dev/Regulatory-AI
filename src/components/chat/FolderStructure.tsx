import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiChevronRight,
  FiChevronDown,
  FiFolder,
  FiFolderPlus,
} from "react-icons/fi";
import { backendURL } from "../../utils/constants";
import { FolderNode, FolderStructureProps } from "../../interfaces";

const FolderStructure: React.FC<FolderStructureProps> = ({
  onSelectionChange,
  initialSelected = [],
}) => {
  const [folderHierarchy, setFolderHierarchy] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [selectedFolders, setSelectedFolders] =
    useState<string[]>(initialSelected);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch folder hierarchy data
  useEffect(() => {
    const fetchFolderHierarchy = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${backendURL}/api/get-folders-hierarchy`
        );
        setFolderHierarchy(response.data);

        // Initialize expanded state for top-level folders
        const initialExpanded: Record<string, boolean> = {};
        response.data.forEach((folder: FolderNode) => {
          initialExpanded[folder.name] = false;
        });
        setExpandedFolders(initialExpanded);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching folder hierarchy:", err);
        setError("Failed to load folder structure. Please try again later.");
        setLoading(false);
      }
    };

    fetchFolderHierarchy();
  }, []);

  // Notify parent component when selection changes
  useEffect(() => {
    onSelectionChange(selectedFolders);
  }, [selectedFolders, onSelectionChange]);

  // Handle initialSelected changes from parent
  useEffect(() => {
    setSelectedFolders(initialSelected);
  }, [initialSelected]);

  // Toggle folder expansion
  const toggleFolder = (e: React.MouseEvent, folderName: string) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Get all namespaces from a folder and its children
  const getAllNamespaces = (folder: FolderNode): string[] => {
    const namespaces: string[] = [];

    // Add current folder's namespace if it exists
    if (folder.namespace) {
      namespaces.push(folder.namespace);
    }

    // Add all child namespaces
    if (folder.children && folder.children.length > 0) {
      folder.children.forEach((child) => {
        // Get all namespaces for this child
        const childNamespaces = getAllNamespaces(child);
        // Add them to our list
        namespaces.push(...childNamespaces);
      });
    }

    return namespaces;
  };

  // Check if a folder is selected directly
  const isFolderSelected = (folder: FolderNode): boolean => {
    // If this folder's namespace is in selectedFolders, it's selected
    if (folder.namespace && selectedFolders.includes(folder.namespace)) {
      return true;
    }

    // If this is a parent folder with children, check if all children are selected
    if (folder.children && folder.children.length > 0) {
      // Get all child namespaces
      const allChildNamespaces = folder.children.flatMap(getAllNamespaces);

      // If we have no child namespaces, then it can't be selected
      if (allChildNamespaces.length === 0) return false;

      // Check if all child namespaces are in selectedFolders
      return allChildNamespaces.every((ns) => selectedFolders.includes(ns));
    }

    return false;
  };

  // Check if a folder is partially selected (some children selected, but not all)
  const isFolderPartiallySelected = (folder: FolderNode): boolean => {
    if (!folder.children || folder.children.length === 0) {
      return false;
    }

    // Get all child namespaces
    const allChildNamespaces = folder.children.flatMap(getAllNamespaces);

    // If we have no child namespaces, it can't be partially selected
    if (allChildNamespaces.length === 0) return false;

    // Check if any child namespace is in selectedFolders
    const anyChildSelected = allChildNamespaces.some((ns) =>
      selectedFolders.includes(ns)
    );

    // Check if all child namespaces are in selectedFolders
    const allChildrenSelected = allChildNamespaces.every((ns) =>
      selectedFolders.includes(ns)
    );

    // It's partially selected if some (but not all) children are selected
    // and the folder itself is not directly selected
    return (
      anyChildSelected &&
      !allChildrenSelected &&
      !(folder.namespace && selectedFolders.includes(folder.namespace))
    );
  };

  // Handle folder selection
  const handleFolderSelect = (folder: FolderNode) => {
    const isSelected = isFolderSelected(folder);
    let newSelectedFolders: string[];

    if (isSelected) {
      // If selected, deselect this folder and all its children
      const namespacesToRemove = getAllNamespaces(folder);
      newSelectedFolders = selectedFolders.filter(
        (ns) => !namespacesToRemove.includes(ns)
      );
    } else {
      // If not selected, select this folder and all its children
      const namespacesToAdd = getAllNamespaces(folder);

      // Create a new set to avoid duplicates
      const uniqueNamespaces = new Set([...selectedFolders]);
      namespacesToAdd.forEach((ns) => uniqueNamespaces.add(ns));

      newSelectedFolders = Array.from(uniqueNamespaces);
    }

    setSelectedFolders(newSelectedFolders);
  };

  // Render a single folder item
  const renderFolder = (folder: FolderNode, depth: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders[folder.name] || false;
    const isSelected = isFolderSelected(folder);
    const isPartiallySelected = isFolderPartiallySelected(folder);

    return (
      <div key={folder.name} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer`}
          style={{ marginLeft: `${depth * 0.75}rem` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleFolder(e, folder.name)}
              className="mr-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isExpanded ? (
                <FiChevronDown size={16} />
              ) : (
                <FiChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="mr-1 w-4"></span>
          )}

          <div
            className="flex items-center flex-grow"
            onClick={() => handleFolderSelect(folder)}
          >
            <span className="mr-2 text-indigo-600">
              {isSelected ? <FiFolderPlus size={18} /> : <FiFolder size={18} />}
            </span>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                className="mr-2 h-4 w-4 text-indigo-600 rounded"
                onChange={() => handleFolderSelect(folder)}
              />
              <span
                className={`${
                  isSelected
                    ? "font-medium text-indigo-700"
                    : isPartiallySelected
                    ? "font-medium text-indigo-500"
                    : "text-gray-800"
                } ${depth > 0 ? "text-sm" : ""}`}
              >
                {folder.name}
              </span>
            </label>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {folder.children!.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-auto max-h-[70vh]">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Document Sources
      </h2>
      <div className="space-y-1">
        {folderHierarchy.map((folder) => renderFolder(folder))}
      </div>
    </div>
  );
};

export default FolderStructure;
