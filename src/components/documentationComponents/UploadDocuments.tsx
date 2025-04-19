// import React, { useState, useRef, useCallback, useEffect } from "react";
// import axios from "axios";
// import { backendURL } from "../../utils/constants";
// import { useAuth } from "../../providers/AuthContext";
// import { useDropzone } from "react-dropzone";
// import { FiUpload, FiFile, FiX } from "react-icons/fi";

// interface UploadDocumentsProps {
//   onUploadSuccess: () => void;
// }

// interface UploadFile extends File {
//   id: string;
//   preview?: string;
// }

// const UploadDocuments: React.FC<UploadDocumentsProps> = ({
//   onUploadSuccess,
// }) => {
//   const [files, setFiles] = useState<UploadFile[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const { handleSuccess, handleError } = useAuth();
//   const cancelFileUploadRef = useRef<null | (() => void)>(null);
//   const userId = localStorage.getItem("user_id");

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     if (acceptedFiles && acceptedFiles.length > 0) {
//       const newFiles = acceptedFiles.map((file) =>
//         Object.assign(file, {
//           id: Math.random().toString(36).substring(2),
//           preview: URL.createObjectURL(file),
//         })
//       ) as UploadFile[];

//       setFiles((prev) => [...prev, ...newFiles]);
//     }
//   }, []);

//   const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
//     onDrop,
//     accept: {
//       "application/pdf": [".pdf"],
//       "application/msword": [".doc"],
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
//         [".docx"],
//     },
//     noClick: false,
//     noKeyboard: true,
//   });

//   // Clean up object URLs to avoid memory leaks
//   useEffect(() => {
//     return () => {
//       files.forEach((file) => {
//         if (file.preview) {
//           URL.revokeObjectURL(file.preview);
//         }
//       });
//     };
//   }, [files]);

//   const removeFile = (fileId: string) => {
//     setFiles((prevFiles) => {
//       // Find the file being removed
//       const fileToRemove = prevFiles.find((file) => file.id === fileId);

//       // Revoke the object URL to prevent memory leaks
//       if (fileToRemove?.preview) {
//         URL.revokeObjectURL(fileToRemove.preview);
//       }

//       // Return the filtered array
//       return prevFiles.filter((file) => file.id !== fileId);
//     });
//   };

//   // Create a mock implementation of upload progress for demonstration
//   const simulateProgressUpdates = (onProgress: (progress: number) => void) => {
//     const totalSteps = 20; // This will create a smoother progress animation
//     let currentStep = 0;

//     const interval = setInterval(() => {
//       currentStep += 1;
//       const progress = Math.min(
//         Math.round((currentStep / totalSteps) * 100),
//         99
//       );
//       onProgress(progress);

//       if (currentStep >= totalSteps) {
//         clearInterval(interval);
//       }
//     }, 300); // Update every 300ms

//     return () => clearInterval(interval);
//   };

//   const uploadFiles = async () => {
//     if (files.length === 0) {
//       handleError("Please select at least one file to upload");
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);

//     const formData = new FormData();
//     files.forEach((file) => {
//       formData.append("files", file);
//     });

//     // if (userId) {
//     //   formData.append("user_id", userId);
//     // }

//     try {
//       const cancelTokenSource = axios.CancelToken.source();
//       cancelFileUploadRef.current = cancelTokenSource.cancel;

//       // Create a more realistic progress simulation
//       const cancelProgress = simulateProgressUpdates((progress) => {
//         setUploadProgress(progress);
//       });

//       // Make the actual upload request
//       const response = await axios.post(
//         `${backendURL}/api/upload-document?namespace=buildRFI&user_id=${userId}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           onUploadProgress: (progressEvent) => {
//             // This is still here but we're using our simulation for a smoother experience
//             // In a real environment, you'd want to use this instead
//             if (progressEvent.total) {
//               const progress = Math.round(
//                 (progressEvent.loaded * 100) / progressEvent.total
//               );
//               // Only update if progress is increasing
//               if (progress > uploadProgress) {
//                 setUploadProgress(progress);
//               }
//             }
//           },
//           cancelToken: cancelTokenSource.token,
//         }
//       );

//       if (response) {
//         cancelProgress();
//       }

//       // Set progress to 100% on completion
//       setUploadProgress(100);

//       // Show success and reset state
//       handleSuccess("Documents uploaded successfully");

//       // Clear the files array and revoke object URLs
//       files.forEach((file) => {
//         if (file.preview) {
//           URL.revokeObjectURL(file.preview);
//         }
//       });
//       setFiles([]);

//       // Notify parent component of successful upload
//       onUploadSuccess();

//       // Reset progress after a short delay (for UI feedback)
//       setTimeout(() => {
//         setUploadProgress(0);
//       }, 1000);
//     } catch (error) {
//       if (axios.isCancel(error)) {
//         handleError("Upload cancelled");
//       } else {
//         const errorMessage =
//           axios.isAxiosError(error) && error.response?.data?.message
//             ? error.response.data.message
//             : "Failed to upload documents";

//         handleError(errorMessage);
//       }
//     } finally {
//       setUploading(false);
//       cancelFileUploadRef.current = null;
//     }
//   };

//   const cancelUpload = () => {
//     if (cancelFileUploadRef.current) {
//       cancelFileUploadRef.current();
//     }
//   };

//   // Create a custom click handler for the dropzone to ensure it works on first click
//   const handleDropzoneClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     open();
//   };

//   return (
//     <div className="w-full">
//       <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Upload Documents
//         </h2>

//         <div
//           {...getRootProps({
//             onClick: (e) => e.stopPropagation(), // Prevent parent click propagation
//           })}
//           className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
//             isDragActive
//               ? "border-indigo-500 bg-indigo-50"
//               : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
//           }`}
//         >
//           <input {...getInputProps()} />

//           <div className="flex flex-col items-center justify-center">
//             <FiUpload className="text-5xl text-gray-400 mb-4" />
//             <h3 className="text-xl font-medium mb-2">
//               Upload Document for Evaluation
//             </h3>
//             <p className="text-gray-500 mb-4">
//               Drag and drop your document here, or click to browse
//             </p>
//             <button
//               type="button"
//               onClick={handleDropzoneClick}
//               className="bg-indigo-600 hover:bg-indigo-700 !text-white px-6 py-3 mb-2 rounded-md font-medium transition-colors inline-flex items-center"
//             >
//               Browse Files
//             </button>
//             <p className="text-sm text-gray-500 mt-4">
//               Supported formats: PDF, DOC, DOCX
//             </p>
//           </div>
//         </div>

//         {files.length > 0 && (
//           <div className="mt-6">
//             <h3 className="text-lg font-medium mb-3">
//               Selected Files ({files.length})
//             </h3>
//             <ul className="space-y-2">
//               {files.map((file) => (
//                 <li
//                   key={file.id}
//                   className="flex items-center justify-between bg-gray-50 rounded-md p-3 border border-gray-200"
//                 >
//                   <div className="flex items-center">
//                     <FiFile className="text-indigo-500 mr-3" />
//                     <div>
//                       <p className="font-medium !mb-0">{file.name}</p>
//                       <p className="text-sm text-gray-500 !mb-0">
//                         {(file.size / 1024).toFixed(2)} KB
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(file.id)}
//                     className="text-gray-500 hover:text-red-500 transition-colors"
//                     aria-label="Remove file"
//                   >
//                     <FiX size={20} />
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {uploading && (
//           <div className="mt-6">
//             <div className="flex justify-between mb-2">
//               <span className="text-sm font-medium">Uploading...</span>
//               <span className="text-sm font-medium">{uploadProgress}%</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div
//                 className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//           </div>
//         )}

//         <div className="mt-6 flex justify-center space-x-4">
//           {uploading ? (
//             <button
//               type="button"
//               onClick={cancelUpload}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
//               disabled={!uploading}
//             >
//               Cancel Upload
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={uploadFiles}
//               className={`${
//                 files.length === 0
//                   ? "bg-indigo-400 cursor-not-allowed"
//                   : "bg-indigo-600 hover:bg-indigo-700"
//               } !text-white px-8 py-3 rounded-md font-medium transition-colors`}
//               disabled={files.length === 0 || uploading}
//             >
//               Upload Documents
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadDocuments;

import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../utils/constants";
import { useAuth } from "../../providers/AuthContext";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiFile, FiX, FiPlus } from "react-icons/fi";
import CreateNamespaceModal from "./CreateNamespaceModal";

interface UploadDocumentsProps {
  onUploadSuccess: () => void;
}

interface UploadFile extends File {
  id: string;
  preview?: string;
}

interface Namespace {
  id: string;
  name: string;
  is_global?: boolean;
}

const UploadDocuments: React.FC<UploadDocumentsProps> = ({
  onUploadSuccess,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSuccess, handleError } = useAuth();
  const cancelFileUploadRef = useRef<null | (() => void)>(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const fetchNamespaces = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${backendURL}/api/namespaces?&user_id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.namespaces) {
        setNamespaces(response.data.namespaces);
        // If namespaces exist, select the first one by default
        if (response.data.namespaces.length > 0) {
          setSelectedNamespace(response.data.namespaces[0].name);
        }
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to fetch namespaces";

      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          id: Math.random().toString(36).substring(2),
          preview: URL.createObjectURL(file),
        })
      ) as UploadFile[];

      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    noClick: false,
    noKeyboard: true,
  });

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const removeFile = (fileId: string) => {
    setFiles((prevFiles) => {
      // Find the file being removed
      const fileToRemove = prevFiles.find((file) => file.id === fileId);

      // Revoke the object URL to prevent memory leaks
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      // Return the filtered array
      return prevFiles.filter((file) => file.id !== fileId);
    });
  };

  // Create a mock implementation of upload progress for demonstration
  const simulateProgressUpdates = (onProgress: (progress: number) => void) => {
    const totalSteps = 20; // This will create a smoother progress animation
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(
        Math.round((currentStep / totalSteps) * 100),
        99
      );
      onProgress(progress);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
      }
    }, 300); // Update every 300ms

    return () => clearInterval(interval);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      handleError("Please select at least one file to upload");
      return;
    }

    if (!selectedNamespace) {
      handleError("Please select a namespace");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const cancelTokenSource = axios.CancelToken.source();
      cancelFileUploadRef.current = cancelTokenSource.cancel;

      // Create a more realistic progress simulation
      const cancelProgress = simulateProgressUpdates((progress) => {
        setUploadProgress(progress);
      });

      // Make the actual upload request
      const response = await axios.post(
        `${backendURL}/api/upload-document?namespace=${selectedNamespace}&user_id=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          onUploadProgress: (progressEvent) => {
            // This is still here but we're using our simulation for a smoother experience
            // In a real environment, you'd want to use this instead
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // Only update if progress is increasing
              if (progress > uploadProgress) {
                setUploadProgress(progress);
              }
            }
          },
          cancelToken: cancelTokenSource.token,
        }
      );

      if (response) {
        cancelProgress();
      }

      // Set progress to 100% on completion
      setUploadProgress(100);

      // Show success and reset state
      handleSuccess("Documents uploaded successfully");

      // Clear the files array and revoke object URLs
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);

      // Notify parent component of successful upload
      onUploadSuccess();

      // Reset progress after a short delay (for UI feedback)
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      if (axios.isCancel(error)) {
        handleError("Upload cancelled");
      } else {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Failed to upload documents";

        handleError(errorMessage);
      }
    } finally {
      setUploading(false);
      cancelFileUploadRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (cancelFileUploadRef.current) {
      cancelFileUploadRef.current();
    }
  };

  // Create a custom click handler for the dropzone to ensure it works on first click
  const handleDropzoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    open();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNamespaceCreated = () => {
    fetchNamespaces();
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Documents
        </h2>

        {/* Namespace Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="namespace"
              className="block text-sm font-medium text-gray-700"
            >
              Select Namespace
            </label>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <FiPlus className="mr-1" size={16} /> Create New
            </button>
          </div>
          <div className="relative">
            <select
              id="namespace"
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              disabled={isLoading || uploading}
            >
              {namespaces.length === 0 ? (
                <option value="">No namespaces available</option>
              ) : (
                <>
                  <option value="">Select a namespace</option>

                  {/* Global Namespaces Group */}
                  <optgroup label="Global Namespaces">
                    {namespaces
                      .filter((namespace) => namespace.is_global)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((namespace) => (
                        <option key={namespace.id} value={namespace.name}>
                          {namespace.name}
                        </option>
                      ))}
                  </optgroup>

                  {/* User-Created Namespaces Group (if any exist) */}
                  {namespaces.some((namespace) => !namespace.is_global) && (
                    <optgroup label="Your Namespaces">
                      {namespaces
                        .filter((namespace) => !namespace.is_global)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((namespace) => (
                          <option key={namespace.id} value={namespace.name}>
                            {namespace.name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
            {isLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {namespaces.length > 0
              ? `${namespaces.length} namespaces available`
              : "Loading namespaces..."}
          </p>
        </div>

        <div
          {...getRootProps({
            onClick: (e) => e.stopPropagation(), // Prevent parent click propagation
          })}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center">
            <FiUpload className="text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Upload Document for Evaluation
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your document here, or click to browse
            </p>
            <button
              type="button"
              onClick={handleDropzoneClick}
              className="bg-indigo-600 hover:bg-indigo-700 !text-white px-6 py-3 mb-2 rounded-md font-medium transition-colors inline-flex items-center"
            >
              Browse Files
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">
              Selected Files ({files.length})
            </h3>
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between bg-gray-50 rounded-md p-3 border border-gray-200"
                >
                  <div className="flex items-center">
                    <FiFile className="text-indigo-500 mr-3" />
                    <div>
                      <p className="font-medium !mb-0">{file.name}</p>
                      <p className="text-sm text-gray-500 !mb-0">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Remove file"
                  >
                    <FiX size={20} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploading && (
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center space-x-4">
          {uploading ? (
            <button
              type="button"
              onClick={cancelUpload}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              disabled={!uploading}
            >
              Cancel Upload
            </button>
          ) : (
            <button
              type="button"
              onClick={uploadFiles}
              className={`${
                files.length === 0 || !selectedNamespace
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } !text-white px-8 py-3 rounded-md font-medium transition-colors`}
              disabled={files.length === 0 || !selectedNamespace || uploading}
            >
              Upload Documents
            </button>
          )}
        </div>
      </div>

      {/* Create Namespace Modal */}
      <CreateNamespaceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleNamespaceCreated}
      />
    </div>
  );
};

export default UploadDocuments;
