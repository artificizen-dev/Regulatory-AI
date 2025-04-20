import React, { useEffect, useState } from "react";
import { SystemPrompt, SystemPromptModalProps } from "../../interfaces";
import systemPrompts from "../../data/systemPromptsData";
import ReactMarkdown from "react-markdown";

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  product = "buildGenius",
  setSystemPrompt,
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<SystemPrompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [displayContent, setDisplayContent] = useState("");

  useEffect(() => {
    if (product && systemPrompts[product]) {
      const promptContent = systemPrompts[product].content;
      setCurrentPrompt(systemPrompts[product]);
      setEditedContent(promptContent);
      setDisplayContent(promptContent);
      if (setSystemPrompt) {
        setSystemPrompt(promptContent);
      }
    } else {
      setCurrentPrompt(null);
      setEditedContent("");
      setDisplayContent("");
    }
  }, [product, setSystemPrompt]);

  if (!isOpen || !currentPrompt) return null;

  const formatContent = (content: string) => {
    return content
      .replace(/^Purpose\s*$/gm, "### Purpose")
      .replace(/^Tone & Style\s*$/gm, "### Tone & Style")
      .replace(/^Response Structure\s*$/gm, "### Response Structure")
      .replace(/^Folder Filtering\s*$/gm, "### Folder Filtering")
      .replace(
        /^When Information Is Missing\s*$/gm,
        "### When Information Is Missing"
      )
      .replace(/^Example\s*$/gm, "### Example")
      .replace(/^Mission\s*$/gm, "### Mission")
      .replace(/^Interaction Flow\s*$/gm, "### Interaction Flow")
      .replace(/^Citation style\s*→\s*(.*)$/gm, "### Citation Style\n$1")
      .replace(/^- /gm, "* ")
      .replace(/^\* /gm, "- ")
      .replace(/([^-])• /gm, "$1- ");
  };

  const handleSaveChanges = () => {
    if (setSystemPrompt) {
      setSystemPrompt(editedContent);
    }
    setDisplayContent(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(displayContent);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {currentPrompt.title}
              </h3>
              <div className="flex gap-2">
                {!isEditing && (
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    onClick={() => setIsEditing(true)}
                  >
                    <span>Edit</span>
                  </button>
                )}
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-2">
              {isEditing ? (
                <div className="overflow-y-auto max-h-[70vh]">
                  <textarea
                    className="w-full h-[60vh] p-4 border border-gray-300 rounded-md font-mono text-sm"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    spellCheck="false"
                  />
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[70vh] bg-gray-50 p-4 rounded-md">
                  <div className="markdown-content prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {formatContent(displayContent)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm md:px-4 md:py-2 px-2 py-1 bg-indigo-600 text-base font-medium !text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm md:px-4 md:py-2 px-2 py-1 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptModal;
