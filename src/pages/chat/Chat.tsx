import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendURL } from "../../utils/constants";
import Navbar from "../../components/Navbar/Navbar";
import {
  FiMenu,
  FiX,
  FiPlus,
  FiCopy,
  FiFile,
  FiExternalLink,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";

interface ChatRoom {
  id: string;
  title: string;
  created_at: string;
}

interface ChatRoomsResponse {
  chatrooms: ChatRoom[];
  total: number;
  limit: number;
  offset: number;
}

interface Source {
  open_in: string;
  chunk_num: number;
  file_name: string;
  file_type: string;
  source_url: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  metadata?: {
    sources?: Source[];
  };
  timestamp: string;
}

interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

interface QueryRequest {
  query: string;
  user_id: number;
  chatroom_id: string;
  namespace: string;
}

interface RFIResponse {
  content: string;
  type: string;
}

const Chat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfiResponses, setRfiResponses] = useState<RFIResponse[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract chatroom_id from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatroomId = params.get("chatroom_id");
    if (chatroomId) {
      setActiveChatRoomId(chatroomId);
    }
  }, [location]);

  // Create a new chat room when component mounts if no chatroom_id in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatroomId = params.get("chatroom_id");

    if (!chatroomId) {
      createChatRoom();
    } else {
      fetchChatRooms();
    }
  }, []);

  const createChatRoom = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      const response = await axios.post(`${backendURL}/api/chatrooms`, {
        user_id: userId,
      });

      if (response.data && response.data.chatroom_id) {
        const newChatroomId = response.data.chatroom_id;
        setActiveChatRoomId(newChatroomId);

        // Update URL with the new chatroom_id
        navigate(`/chat?chatroom_id=${newChatroomId}`);

        fetchChatRooms();
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      const response = await axios.get<ChatRoomsResponse>(
        `${backendURL}/api/user-chatrooms/${userId}?limit=10&offset=0`
      );

      if (response.data && response.data.chatrooms) {
        setChatRooms(response.data.chatrooms);

        // If no active chat room is set and we have chat rooms, set the first one
        if (!activeChatRoomId && response.data.chatrooms.length > 0) {
          const firstChatroomId = response.data.chatrooms[0].id;
          setActiveChatRoomId(firstChatroomId);

          // Update URL with the first chatroom_id
          navigate(`/chat?chatroom_id=${firstChatroomId}`);

          fetchMessages(firstChatroomId);
        } else if (activeChatRoomId) {
          fetchMessages(activeChatRoomId);
        }
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  // Fetch messages when active chat room changes
  useEffect(() => {
    if (activeChatRoomId) {
      fetchMessages(activeChatRoomId);
    }
  }, [activeChatRoomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, rfiResponses]);

  const fetchMessages = async (chatRoomId: string) => {
    try {
      const response = await axios.get<MessagesResponse>(
        `${backendURL}/api/chatroom-messages/${chatRoomId}`
      );

      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
        // Clear RFI responses when loading a new chat
        setRfiResponses([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChatRoomId) return;

    // Store the input for later use and clear the input field
    const queryText = inputMessage;
    setInputMessage("");
    setLoading(true);

    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID not found in local storage");
        setLoading(false);
        return;
      }

      // Add a temporary user message to the UI for immediate feedback
      const tempUserMessage: ChatMessage = {
        id: "temp-" + Date.now().toString(),
        role: "user",
        content: queryText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);

      // Add a placeholder message for the assistant response
      const assistantMessageId = "assistant-" + Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "Generating response...",
          timestamp: new Date().toISOString(),
        },
      ]);

      // Set streaming state
      setIsStreaming(true);

      // Prepare the query request
      const queryRequest: QueryRequest = {
        query: queryText,
        user_id: parseInt(userId),
        chatroom_id: activeChatRoomId,
        namespace: "buildRFI",
      };

      // Use fetch for streaming response
      const response = await fetch(`${backendURL}/api/query-with-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryRequest),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;

        // Update the streaming message
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const assistantMsgIndex = updatedMessages.findIndex(
            (msg) => msg.id === assistantMessageId
          );

          if (assistantMsgIndex !== -1) {
            updatedMessages[assistantMsgIndex] = {
              ...updatedMessages[assistantMsgIndex],
              content: streamedContent,
            };
          }

          return updatedMessages;
        });

        // Scroll to bottom as content streams in
        scrollToBottom();
      }

      // Once streaming is complete, fetch messages to get the final message with metadata (sources)
      setIsStreaming(false);
      await fetchMessages(activeChatRoomId);
    } catch (error) {
      console.error("Error processing query:", error);
      // Show error message
      const errorMessage: ChatMessage = {
        id: "error-" + Date.now().toString(),
        role: "assistant",
        content:
          "An error occurred while processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        // Remove the "Generating response..." message if it exists
        const filteredMessages = prev.filter(
          (msg) => !msg.content.includes("Generating response...")
        );
        return [...filteredMessages, errorMessage];
      });
      setIsStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  const createNewChatRoom = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      const response = await axios.post(`${backendURL}/api/chatrooms`, {
        user_id: userId,
      });

      if (response.data && response.data.chatroom_id) {
        const newChatroomId = response.data.chatroom_id;

        // Update URL with the new chatroom_id
        navigate(`/chat?chatroom_id=${newChatroomId}`);

        // Add new chat room to the list
        const newChatRoom: ChatRoom = {
          id: newChatroomId,
          title: "New Chat",
          created_at: new Date().toISOString(),
        };

        setChatRooms((prev) => [newChatRoom, ...prev]);
        setActiveChatRoomId(newChatroomId);
        setMessages([]);
        setRfiResponses([]);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating new chat room:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string) => {
    console.log(fileType);
    return <FiFile className="mr-2" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main content - fixed layout with proper spacing */}
      <div className="pt-16 w-full flex justify-center">
        <div className="w-full max-w-4xl px-4">
          {/* Main container with fixed height calculation */}
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Header - only shown when no messages */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <h1 className="text-4xl font-bold">RegulatoryAI - BuildRFI</h1>
                <p className="text-gray-600 mt-2">
                  Transforming building control requests into formal RFIs
                </p>
              </div>
            )}

            {/* Hamburger menu for mobile */}
            {!sidebarOpen && (
              <button
                className="fixed top-20 left-4 z-50 p-2 rounded-full bg-indigo-600 text-white shadow-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
            )}

            {/* Sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed z-40"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            {/* Sidebar */}
            <div
              className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg">Conversations</h2>
                <div className="flex items-center">
                  <button
                    onClick={createNewChatRoom}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors mr-2"
                    title="New conversation"
                  >
                    <FiPlus size={20} />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100%-64px)]">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                      activeChatRoomId === room.id
                        ? "bg-indigo-50 border-l-4 border-indigo-500"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveChatRoomId(room.id);
                      navigate(`/chat?chatroom_id=${room.id}`);
                      setSidebarOpen(false);
                    }}
                  >
                    <p className="font-medium truncate">
                      {room.title || "New Chat"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(room.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main chat area with fixed structure */}
            <div className="flex flex-col flex-grow overflow-hidden">
              {/* Messages container with proper spacing and scrolling */}
              <div className="flex-grow overflow-y-auto py-4">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`px-2 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-800 shadow"
                        }`}
                      >
                        <div className="prose max-w-none markdown-content">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>

                        {/* Source links for assistant messages */}
                        {message.role === "assistant" &&
                          message.metadata?.sources &&
                          message.metadata.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Sources:
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {message.metadata.sources.map(
                                  (source, index) => (
                                    <div
                                      key={index}
                                      className="bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-colors"
                                    >
                                      <a
                                        href={source.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                                      >
                                        {getFileIcon(source.file_type)}
                                        <span className="flex-grow truncate mr-2">
                                          {source.file_name}
                                        </span>
                                        <FiExternalLink size={14} />
                                      </a>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 mx-2">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator (only show when not streaming) */}
                  {loading && !isStreaming && (
                    <div className="text-center py-6">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* RFI responses */}
              {rfiResponses.length > 0 && (
                <div className="bg-gray-100 rounded-lg p-4 md:p-6 shadow-md mb-4 mx-2">
                  <div className="mb-3 pb-3 border-b border-gray-300">
                    <span className="font-bold">Query:</span>{" "}
                    {messages.length > 0
                      ? messages.find((m) => m.role === "user")?.content ||
                        "Leaky Pipes"
                      : "Leaky Pipes"}
                  </div>

                  {rfiResponses.map((response, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">
                          BuildRFI - {response.type}
                        </span>
                        <button
                          onClick={() => handleCopyText(response.content)}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded flex items-center text-sm"
                          title="Copy to clipboard"
                        >
                          Copy <FiCopy size={14} className="ml-1" />
                        </button>
                      </div>
                      <div className="prose max-w-none">
                        <ReactMarkdown>{response.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto bg-white rounded-lg shadow-lg border border-gray-200 mx-2 mb-4">
                <textarea
                  className="w-full p-3 resize-none outline-none border-0 focus:ring-0 text-gray-800"
                  placeholder="Describe your issue or missing document..."
                  rows={3}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                ></textarea>
                <div className="flex justify-end p-2 bg-gray-50 border-t border-gray-100">
                  <button
                    className={`${
                      !inputMessage.trim() || loading
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white px-4 py-2 rounded-lg font-medium flex items-center`}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading}
                  >
                    Send <span className="ml-1">&#10148;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
