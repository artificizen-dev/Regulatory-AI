// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { backendURL } from "../../utils/constants";
// import Navbar from "../../components/Navbar/Navbar";
// import {
//   FiMenu,
//   FiX,
//   FiPlus,
//   FiCopy,
//   FiFile,
//   FiExternalLink,
//   FiFilter,
// } from "react-icons/fi";
// import { useNavigate, useLocation } from "react-router-dom";
// import ReactMarkdown from "react-markdown";
// import {
//   ChatMessage,
//   ChatRoom,
//   ChatRoomsResponse,
//   MessagesResponse,
//   QueryRequest,
//   RFIResponse,
//   SourcesResponse,
// } from "../../interfaces";
// import FolderStructure from "../../components/chat/FolderStructure";

// // Product type for the tabs
// type Product = "buildRFI" | "buildGenius" | "buildRFD";

// const Chat: React.FC = () => {
//   const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
//   const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [rfiResponses, setRfiResponses] = useState<RFIResponse[]>([]);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [product, setProduct] = useState<Product>("buildRFI");
//   const [folderSidebarOpen, setFolderSidebarOpen] = useState(false);
//   const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const chatroomId = params.get("chatroom_id");
//     const productParam = params.get("product") as Product | null;

//     if (chatroomId) {
//       setActiveChatRoomId(chatroomId);
//     }

//     if (
//       productParam &&
//       ["buildRFI", "buildGenius", "buildRFD"].includes(productParam)
//     ) {
//       setProduct(productParam);
//     }
//   }, [location]);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const chatroomId = params.get("chatroom_id");

//     if (!chatroomId) {
//       createChatRoom();
//     } else {
//       fetchChatRooms();
//     }
//   }, []);

//   const createChatRoom = async () => {
//     try {
//       const userId = localStorage.getItem("user_id");

//       if (!userId) {
//         console.error("User ID not found in local storage");
//         return;
//       }

//       const response = await axios.post(`${backendURL}/api/chatrooms`, {
//         user_id: userId,
//       });

//       if (response.data && response.data.chatroom_id) {
//         const newChatroomId = response.data.chatroom_id;
//         setActiveChatRoomId(newChatroomId);

//         // Update URL with the new chatroom_id and product
//         navigate(`/chat?chatroom_id=${newChatroomId}&product=${product}`);

//         fetchChatRooms();
//       }
//     } catch (error) {
//       console.error("Error creating chat room:", error);
//     }
//   };

//   const fetchChatRooms = async () => {
//     try {
//       const userId = localStorage.getItem("user_id");
//       if (!userId) {
//         console.error("User ID not found in local storage");
//         return;
//       }

//       const response = await axios.get<ChatRoomsResponse>(
//         `${backendURL}/api/user-chatrooms/${userId}?limit=10&offset=0`
//       );

//       if (response.data && response.data.chatrooms) {
//         setChatRooms(response.data.chatrooms);

//         if (!activeChatRoomId && response.data.chatrooms.length > 0) {
//           const firstChatroomId = response.data.chatrooms[0].id;
//           setActiveChatRoomId(firstChatroomId);

//           navigate(`/chat?chatroom_id=${firstChatroomId}&product=${product}`);

//           fetchMessages(firstChatroomId);
//         } else if (activeChatRoomId) {
//           fetchMessages(activeChatRoomId);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching chat rooms:", error);
//     }
//   };

//   useEffect(() => {
//     if (activeChatRoomId) {
//       fetchMessages(activeChatRoomId);
//     }
//   }, [activeChatRoomId]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, rfiResponses]);

//   const fetchMessages = async (chatRoomId: string) => {
//     try {
//       const response = await axios.get<MessagesResponse>(
//         `${backendURL}/api/chatroom-messages/${chatRoomId}`
//       );

//       if (response.data && response.data.messages) {
//         setMessages(response.data.messages);
//         setRfiResponses([]);
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim() || !activeChatRoomId) return;

//     const queryText = inputMessage;
//     setInputMessage("");
//     setLoading(true);

//     try {
//       const userId = localStorage.getItem("user_id");
//       if (!userId) {
//         console.error("User ID not found in local storage");
//         setLoading(false);
//         return;
//       }

//       const tempUserMessage: ChatMessage = {
//         id: "temp-" + Date.now().toString(),
//         role: "user",
//         content: queryText,
//         timestamp: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, tempUserMessage]);

//       const assistantMessageId = "assistant-" + Date.now().toString();
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: assistantMessageId,
//           role: "assistant",
//           content: "Generating response...",
//           timestamp: new Date().toISOString(),
//         },
//       ]);
//       setIsStreaming(true);

//       const queryRequest: QueryRequest = {
//         query: queryText,
//         user_id: parseInt(userId),
//         chatroom_id: activeChatRoomId,
//         namespace: selectedFolders.length > 0 ? selectedFolders : [],
//         product: product,
//       };

//       const response = await fetch(`${backendURL}/api/query-with-chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(queryRequest),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const reader = response.body!.getReader();
//       const decoder = new TextDecoder();
//       let streamedContent = "";

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         streamedContent += chunk;

//         // Update the streaming message
//         setMessages((prev) => {
//           const updatedMessages = [...prev];
//           const assistantMsgIndex = updatedMessages.findIndex(
//             (msg) => msg.id === assistantMessageId
//           );

//           if (assistantMsgIndex !== -1) {
//             updatedMessages[assistantMsgIndex] = {
//               ...updatedMessages[assistantMsgIndex],
//               content: streamedContent,
//             };
//           }

//           return updatedMessages;
//         });

//         scrollToBottom();
//       }
//       setIsStreaming(false);
//       await fetchResources();
//     } catch (error) {
//       console.error("Error processing query:", error);
//       // Show error message
//       const errorMessage: ChatMessage = {
//         id: "error-" + Date.now().toString(),
//         role: "assistant",
//         content:
//           "An error occurred while processing your request. Please try again.",
//         timestamp: new Date().toISOString(),
//       };
//       setMessages((prev) => {
//         // Remove the "Generating response..." message if it exists
//         const filteredMessages = prev.filter(
//           (msg) => !msg.content.includes("Generating response...")
//         );
//         return [...filteredMessages, errorMessage];
//       });
//       setIsStreaming(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createNewChatRoom = async () => {
//     try {
//       const userId = localStorage.getItem("user_id");

//       if (!userId) {
//         console.error("User ID not found in local storage");
//         return;
//       }

//       const response = await axios.post(`${backendURL}/api/chatrooms`, {
//         user_id: userId,
//       });

//       if (response.data && response.data.chatroom_id) {
//         const newChatroomId = response.data.chatroom_id;

//         // Update URL with the new chatroom_id and product
//         navigate(`/chat?chatroom_id=${newChatroomId}&product=${product}`);

//         // Add new chat room to the list
//         const newChatRoom: ChatRoom = {
//           id: newChatroomId,
//           title: "New Chat",
//           created_at: new Date().toISOString(),
//         };

//         setChatRooms((prev) => [newChatRoom, ...prev]);
//         setActiveChatRoomId(newChatroomId);
//         setMessages([]);
//         setRfiResponses([]);
//         setSidebarOpen(false);
//       }
//     } catch (error) {
//       console.error("Error creating new chat room:", error);
//     }
//   };

//   // Handle product tab change
//   const handleProductChange = (newProduct: Product) => {
//     if (product !== newProduct) {
//       setProduct(newProduct);

//       // Update URL with new product
//       if (activeChatRoomId) {
//         navigate(`/chat?chatroom_id=${activeChatRoomId}&product=${newProduct}`);
//       }
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleCopyText = (text: string) => {
//     navigator.clipboard.writeText(text);
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const getFileIcon = (fileType: string) => {
//     console.log(fileType);
//     return <FiFile className="mr-2" />;
//   };

//   // Update the fetchResources function to handle sources differently
//   const fetchResources = async () => {
//     try {
//       if (activeChatRoomId) {
//         const response = await axios.get<SourcesResponse>(
//           `${backendURL}/api/chatroom/${activeChatRoomId}/last-sources`
//         );

//         if (
//           response.data &&
//           response.data.sources &&
//           response.data.sources.length > 0
//         ) {
//           setMessages((prev) => {
//             const updatedMessages = [...prev];
//             // Find the most recent assistant message
//             const lastAssistantIndex = updatedMessages
//               .map((msg, i) => ({ role: msg.role, index: i }))
//               .filter((item) => item.role === "assistant")
//               .pop()?.index;

//             if (lastAssistantIndex !== undefined) {
//               // Add sources to the message metadata if not already there
//               if (!updatedMessages[lastAssistantIndex].metadata) {
//                 updatedMessages[lastAssistantIndex].metadata = { sources: [] };
//               }
//               if (!updatedMessages[lastAssistantIndex].metadata.sources) {
//                 updatedMessages[lastAssistantIndex].metadata.sources = [];
//               }

//               // Add the new sources
//               updatedMessages[lastAssistantIndex].metadata.sources =
//                 response.data.sources;
//             }

//             return updatedMessages;
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching resources:", error);
//     }
//   };

//   useEffect(() => {
//     if (activeChatRoomId) {
//       fetchResources();
//     }
//   }, [activeChatRoomId]);

//   return (
//     <div className="min-h-screen">
//       <Navbar />

//       {/* Main content - fixed layout with proper spacing */}
//       <div className="pt-16 w-full flex justify-center">
//         <div className="w-full max-w-4xl px-4">
//           {/* Main container with fixed height calculation */}
//           <div className="flex flex-col h-[calc(100vh-64px)]">
//             {/* Header - only shown when no messages */}
//             {messages.length === 0 && (
//               <div className="text-center py-8">
//                 <h1 className="text-4xl font-bold">RegulatoryAI - {product}</h1>
//                 <p className="text-gray-600 mt-2">
//                   Transforming building control requests into formal RFIs
//                 </p>
//               </div>
//             )}

//             {/* Hamburger menu for mobile */}
//             {!sidebarOpen && (
//               <button
//                 className="fixed top-20 left-4 z-50 p-2 rounded-full bg-indigo-600 !text-white shadow-lg flex"
//                 onClick={() => setSidebarOpen(true)}
//               >
//                 <FiMenu size={24} />
//               </button>
//             )}

//             {/* Filter button to open folder structure */}
//             <div className="fixed top-20 right-4 z-50 flex items-center">
//               <button
//                 className="p-2 rounded-full bg-indigo-600 !text-white shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
//                 onClick={() => setFolderSidebarOpen(true)}
//                 title="Filter by folders"
//               >
//                 <FiFilter size={20} />
//                 <span className="hidden md:inline text-sm font-medium mr-1">
//                   Filters
//                 </span>
//               </button>
//               {/* Optional badge to show when filters are active */}
//               {selectedFolders.length > 0 && (
//                 <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
//                   {selectedFolders.length}
//                 </div>
//               )}
//             </div>

//             {/* Sidebar overlay */}
//             {(sidebarOpen || folderSidebarOpen) && (
//               <div
//                 className="fixed"
//                 onClick={() => {
//                   setSidebarOpen(false);
//                   setFolderSidebarOpen(false);
//                 }}
//               ></div>
//             )}

//             {/* Sidebar */}
//             <div
//               className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
//                 sidebarOpen ? "translate-x-0" : "-translate-x-full"
//               }`}
//             >
//               <div className="flex justify-between items-center p-4 border-b">
//                 <h2 className="font-bold text-lg !mb-0">Conversations</h2>
//                 <div className="flex items-center">
//                   <button
//                     onClick={createNewChatRoom}
//                     className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors mr-2"
//                     title="New conversation"
//                   >
//                     <FiPlus size={20} />
//                   </button>
//                   <button
//                     onClick={() => setSidebarOpen(false)}
//                     className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
//                   >
//                     <FiX size={20} />
//                   </button>
//                 </div>
//               </div>

//               <div className="overflow-y-auto h-[calc(100%-64px)]">
//                 {chatRooms.map((room) => (
//                   <div
//                     key={room.id}
//                     className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
//                       activeChatRoomId === room.id
//                         ? "bg-indigo-50 border-l-4 border-indigo-500"
//                         : ""
//                     }`}
//                     onClick={() => {
//                       setActiveChatRoomId(room.id);
//                       navigate(
//                         `/chat?chatroom_id=${room.id}&product=${product}`
//                       );
//                       setSidebarOpen(false);
//                     }}
//                   >
//                     <p className="font-medium truncate !mb-0">
//                       {room.title || "New Chat"}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {formatDate(room.created_at)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div
//               className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
//                 folderSidebarOpen ? "translate-x-0" : "translate-x-full"
//               }`}
//             >
//               <div className="flex justify-between items-center p-4 border-b">
//                 <h2 className="font-bold text-lg !mb-0">Filter by Folders</h2>
//                 <button
//                   onClick={() => setFolderSidebarOpen(false)}
//                   className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <FiX size={20} />
//                 </button>
//               </div>

//               <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
//                 <FolderStructure
//                   onSelectionChange={setSelectedFolders}
//                   initialSelected={selectedFolders}
//                 />

//                 {selectedFolders.length > 0 && (
//                   <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
//                     <p className="text-sm font-medium text-indigo-700 mb-2">
//                       {selectedFolders.length} folder
//                       {selectedFolders.length !== 1 ? "s" : ""} selected
//                     </p>
//                     <button
//                       onClick={() => {
//                         // Force a complete reset of selectedFolders
//                         const emptyArray: string[] = [];
//                         setSelectedFolders(emptyArray);
//                         // Force re-render of folder selection UI
//                         setTimeout(() => {
//                           setFolderSidebarOpen(false);
//                           setTimeout(() => {
//                             setFolderSidebarOpen(true);
//                           }, 50);
//                         }, 50);
//                       }}
//                       className="w-full py-2 px-4 bg-indigo-600 !text-white rounded hover:bg-indigo-700 transition-colors"
//                     >
//                       Clear Selection
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex flex-col flex-grow overflow-hidden">
//               <div className="flex-grow overflow-y-auto py-4">
//                 <div className="space-y-6">
//                   {messages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`px-2 ${
//                         message.role === "user" ? "text-right" : "text-left"
//                       }`}
//                     >
//                       <div
//                         className={`inline-block max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 ${
//                           message.role === "user"
//                             ? "bg-indigo-600 text-white"
//                             : "bg-white text-gray-800 shadow"
//                         }`}
//                       >
//                         <div className="prose max-w-none markdown-content">
//                           <ReactMarkdown>{message.content}</ReactMarkdown>
//                         </div>

//                         {message.role === "assistant" &&
//                           message.metadata?.sources &&
//                           message.metadata.sources.length > 0 && (
//                             <div className="mt-4 pt-3 border-t border-gray-200">
//                               <p className="text-sm font-medium text-gray-700 mb-2">
//                                 Sources:
//                               </p>
//                               <div className="grid grid-cols-1 gap-2">
//                                 {message.metadata.sources.map(
//                                   (source, index) => (
//                                     <div
//                                       key={index}
//                                       className="bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-colors"
//                                     >
//                                       <a
//                                         href={source.source_url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="flex items-center text-indigo-600 hover:text-indigo-800"
//                                       >
//                                         {getFileIcon(source.file_type)}
//                                         <span className="flex-grow truncate mr-2">
//                                           {source.file_name}
//                                         </span>
//                                         <FiExternalLink size={14} />
//                                       </a>
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1 mx-2">
//                         {new Date(message.timestamp).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </div>
//                     </div>
//                   ))}

//                   {loading && !isStreaming && (
//                     <div className="text-center py-6">
//                       <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
//                     </div>
//                   )}

//                   <div ref={messagesEndRef} />
//                 </div>
//               </div>

//               {rfiResponses.length > 0 && (
//                 <div className="bg-gray-100 rounded-lg p-4 md:p-6 shadow-md mb-4 mx-2">
//                   <div className="mb-3 pb-3 border-b border-gray-300">
//                     <span className="font-bold">Query:</span>{" "}
//                     {messages.length > 0
//                       ? messages.find((m) => m.role === "user")?.content ||
//                         "Leaky Pipes"
//                       : "Leaky Pipes"}
//                   </div>

//                   {rfiResponses.map((response, index) => (
//                     <div
//                       key={index}
//                       className="bg-white rounded-lg p-4 mb-3 shadow-sm"
//                     >
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-bold">
//                           {product} - {response.type}
//                         </span>
//                         <button
//                           onClick={() => handleCopyText(response.content)}
//                           className="text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded flex items-center text-sm"
//                           title="Copy to clipboard"
//                         >
//                           Copy <FiCopy size={14} className="ml-1" />
//                         </button>
//                       </div>
//                       <div className="prose max-w-none">
//                         <ReactMarkdown>{response.content}</ReactMarkdown>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-auto mx-2 mb-4">
//                 <div className="mb-2">
//                   <div className="flex justify-center">
//                     <button
//                       onClick={() => handleProductChange("buildRFI")}
//                       className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
//                         product === "buildRFI"
//                           ? "border-indigo-600 text-indigo-600"
//                           : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                       }`}
//                     >
//                       BuildRFI
//                     </button>
//                     <button
//                       onClick={() => handleProductChange("buildGenius")}
//                       className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
//                         product === "buildGenius"
//                           ? "border-indigo-600 text-indigo-600"
//                           : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                       }`}
//                     >
//                       BuildGenius
//                     </button>
//                     <button
//                       onClick={() => handleProductChange("buildRFD")}
//                       className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
//                         product === "buildRFD"
//                           ? "border-indigo-600 text-indigo-600"
//                           : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                       }`}
//                     >
//                       BuildRFD
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex overflow-hidden">
//                   <input
//                     type="text"
//                     className="flex-grow p-3 outline-none border-0 focus:ring-0 text-gray-800"
//                     placeholder={`Describe your issue or missing document for ${product}${
//                       selectedFolders.length > 0
//                         ? " (filtered by " +
//                           selectedFolders.length +
//                           " folder" +
//                           (selectedFolders.length !== 1 ? "s" : "") +
//                           ")"
//                         : ""
//                     }...`}
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     disabled={loading}
//                   />
//                   <div className="bg-gray-50 p-2 flex items-center">
//                     <button
//                       className={`${
//                         !inputMessage.trim() || loading
//                           ? "bg-indigo-400 cursor-not-allowed"
//                           : "bg-indigo-600 hover:bg-indigo-700"
//                       } !text-white px-4 py-2 rounded-lg font-medium flex items-center`}
//                       onClick={handleSendMessage}
//                       disabled={!inputMessage.trim() || loading}
//                     >
//                       Send <span className="ml-1">&#10148;</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;

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
  FiFilter,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ChatMessage,
  ChatRoom,
  ChatRoomsResponse,
  MessagesResponse,
  QueryRequest,
  RFIResponse,
  SourcesResponse,
} from "../../interfaces";
import FolderStructure from "../../components/chat/FolderStructure";
import VoiceInput from "../../components/chat/VoiceInput";

// Product type for the tabs
type Product = "buildRFI" | "buildGenius" | "buildRFD";

const Chat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfiResponses, setRfiResponses] = useState<RFIResponse[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [product, setProduct] = useState<Product>("buildRFI");
  const [folderSidebarOpen, setFolderSidebarOpen] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  // New state for product switching
  const [productSwitching, setProductSwitching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatroomId = params.get("chatroom_id");
    const productParam = params.get("product") as Product | null;

    if (chatroomId) {
      setActiveChatRoomId(chatroomId);
    }

    if (
      productParam &&
      ["buildRFI", "buildGenius", "buildRFD"].includes(productParam)
    ) {
      setProduct(productParam);
    }
  }, [location]);

  useEffect(() => {
    createChatRoom();
    fetchChatRooms();
  }, []);

  const createChatRoom = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      // Get product from URL or use current state
      const params = new URLSearchParams(location.search);
      const productParam = params.get("product") as Product | null;
      const currentProduct = productParam || product;

      const response = await axios.post(`${backendURL}/api/chatrooms`, {
        user_id: userId,
      });

      if (response.data && response.data.chatroom_id) {
        const newChatroomId = response.data.chatroom_id;
        setActiveChatRoomId(newChatroomId);

        // Create a title that includes the product
        const title = currentProduct ? `${currentProduct} Chat` : "New Chat";

        // Add the room to the local state
        const newChatRoom: ChatRoom = {
          id: newChatroomId,
          title: title,
          created_at: new Date().toISOString(),
        };

        setChatRooms((prev) => [newChatRoom, ...prev]);

        // Update URL with the new chatroom_id and product
        navigate(
          `/chat?chatroom_id=${newChatroomId}&product=${currentProduct}`
        );
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

        if (!activeChatRoomId && response.data.chatrooms.length > 0) {
          const firstChatroomId = response.data.chatrooms[0].id;
          setActiveChatRoomId(firstChatroomId);

          navigate(`/chat?chatroom_id=${firstChatroomId}&product=${product}`);

          fetchMessages(firstChatroomId);
        } else if (activeChatRoomId) {
          fetchMessages(activeChatRoomId);
        }
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

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
        setRfiResponses([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    console.log("Handle send message called");
    if (!inputMessage.trim() || !activeChatRoomId) return;

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

      const tempUserMessage: ChatMessage = {
        id: "temp-" + Date.now().toString(),
        role: "user",
        content: queryText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);

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
      setIsStreaming(true);

      const queryRequest: QueryRequest = {
        query: queryText,
        user_id: parseInt(userId),
        chatroom_id: activeChatRoomId,
        namespace: selectedFolders.length > 0 ? selectedFolders : [],
        product: product,
      };

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

        scrollToBottom();
      }
      setIsStreaming(false);
      await fetchResources();
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

        // Update URL with the new chatroom_id and product
        navigate(`/chat?chatroom_id=${newChatroomId}&product=${product}`);

        // Add new chat room to the list with product in title
        const newChatRoom: ChatRoom = {
          id: newChatroomId,
          title: product ? `${product} Chat` : "New Chat",
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

  // Create a new chat room for product change
  const createNewChatRoomForProduct = async (
    newProduct: Product
  ): Promise<void> => {
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

        // Update URL with the new chatroom_id and product
        navigate(`/chat?chatroom_id=${newChatroomId}&product=${newProduct}`);

        // Add new chat room to the list
        const newChatRoom: ChatRoom = {
          id: newChatroomId,
          title: `${newProduct} Chat`, // Better title reflecting the product
          created_at: new Date().toISOString(),
        };

        setChatRooms((prev) => [newChatRoom, ...prev]);
        setActiveChatRoomId(newChatroomId);
        setMessages([]);
        setRfiResponses([]);

        // Optionally close sidebars if they're open
        setSidebarOpen(false);
        setFolderSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating new chat room for product change:", error);
    }
  };

  // Handle product tab change
  const handleProductChange = (newProduct: Product) => {
    if (product !== newProduct) {
      setProduct(newProduct);
      setProductSwitching(true); // Start loading

      // Create a new chat room when switching tabs
      createNewChatRoomForProduct(newProduct).finally(() => {
        setProductSwitching(false); // End loading regardless of outcome
      });
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

  // Function to determine which product a chat room belongs to
  const getChatRoomProduct = (room: ChatRoom): Product | null => {
    // Check if the title contains product information
    const title = room.title || "";
    if (title.includes("buildRFI")) return "buildRFI";
    if (title.includes("buildGenius")) return "buildGenius";
    if (title.includes("buildRFD")) return "buildRFD";

    return null; // No product found
  };

  const getFileIcon = (fileType: string) => {
    console.log(fileType);
    return <FiFile className="mr-2" />;
  };

  // Update the fetchResources function to handle sources differently
  const fetchResources = async () => {
    try {
      if (activeChatRoomId) {
        const response = await axios.get<SourcesResponse>(
          `${backendURL}/api/chatroom/${activeChatRoomId}/last-sources`
        );

        if (
          response.data &&
          response.data.sources &&
          response.data.sources.length > 0
        ) {
          setMessages((prev) => {
            const updatedMessages = [...prev];
            // Find the most recent assistant message
            const lastAssistantIndex = updatedMessages
              .map((msg, i) => ({ role: msg.role, index: i }))
              .filter((item) => item.role === "assistant")
              .pop()?.index;

            if (lastAssistantIndex !== undefined) {
              // Add sources to the message metadata if not already there
              if (!updatedMessages[lastAssistantIndex].metadata) {
                updatedMessages[lastAssistantIndex].metadata = { sources: [] };
              }
              if (!updatedMessages[lastAssistantIndex].metadata.sources) {
                updatedMessages[lastAssistantIndex].metadata.sources = [];
              }

              // Add the new sources
              updatedMessages[lastAssistantIndex].metadata.sources =
                response.data.sources;
            }

            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const handleTranscriptionReceived = (text: string) => {
    console.log("Transcription received:", text);
    if (text && text.trim()) {
      // First set the input message
      setInputMessage(text);

      const messageToSend = text;

      console.log("About to send message:", messageToSend);

      // Small delay to allow UI to update first
      setTimeout(() => {
        // Directly invoke handleSendMessage with the transcribed text
        const userId = localStorage.getItem("user_id");
        if (!userId || !activeChatRoomId) {
          console.error("Missing user ID or active chatroom");
          return;
        }

        // Create a temporary user message
        const tempUserMessage: ChatMessage = {
          id: "temp-" + Date.now().toString(),
          role: "user",
          content: messageToSend,
          timestamp: new Date().toISOString(),
        };

        // Add the user message to the conversation
        setMessages((prev) => [...prev, tempUserMessage]);
        setInputMessage(""); // Clear input field
        setLoading(true);

        // Create assistant message placeholder
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
        setIsStreaming(true);

        const queryRequest: QueryRequest = {
          query: messageToSend,
          user_id: parseInt(userId),
          chatroom_id: activeChatRoomId,
          namespace: selectedFolders.length > 0 ? selectedFolders : [],
          product: product,
        };

        console.log("Sending transcribed message to API");

        fetch(`${backendURL}/api/query-with-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryRequest),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.body!.getReader();
          })
          .then(async (reader) => {
            const decoder = new TextDecoder();
            let streamedContent = "";

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              streamedContent += chunk;

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

              scrollToBottom();
            }
            setIsStreaming(false);
            return fetchResources();
          })
          .catch((error) => {
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
              const filteredMessages = prev.filter(
                (msg) => !msg.content.includes("Generating response...")
              );
              return [...filteredMessages, errorMessage];
            });
            setIsStreaming(false);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    }
  };

  useEffect(() => {
    if (activeChatRoomId) {
      fetchResources();
    }
  }, [activeChatRoomId]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Main content - fixed layout with proper spacing */}
      <div className="pt-16 w-full flex justify-center">
        <div className="w-full max-w-4xl px-4">
          {/* Main container with fixed height calculation */}
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Header - only shown when no messages */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <h1 className="text-4xl font-bold">RegulatoryAI - {product}</h1>
                <p className="text-gray-600 mt-2">
                  Transforming building control requests into formal RFIs
                </p>
              </div>
            )}

            {/* Hamburger menu for mobile */}
            {!sidebarOpen && (
              <button
                className="fixed top-20 left-4 z-50 p-2 rounded-full bg-indigo-600 !text-white shadow-lg flex"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
            )}

            {/* Filter button to open folder structure */}
            <div className="fixed top-20 right-4 z-50 flex items-center">
              <button
                className="p-2 rounded-full bg-indigo-600 !text-white shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                onClick={() => setFolderSidebarOpen(true)}
                title="Filter by folders"
              >
                <FiFilter size={20} />
                <span className="hidden md:inline text-sm font-medium mr-1">
                  Filters
                </span>
              </button>
              {/* Optional badge to show when filters are active */}
              {selectedFolders.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {selectedFolders.length}
                </div>
              )}
            </div>

            {/* Sidebar overlay */}
            {(sidebarOpen || folderSidebarOpen) && (
              <div
                className="fixed"
                onClick={() => {
                  setSidebarOpen(false);
                  setFolderSidebarOpen(false);
                }}
              ></div>
            )}

            {/* Sidebar */}
            <div
              className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg !mb-0">Conversations</h2>
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
                {chatRooms.map((room) => {
                  const roomProduct = getChatRoomProduct(room);
                  return (
                    <div
                      key={room.id}
                      className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                        activeChatRoomId === room.id
                          ? "bg-indigo-50 border-l-4 border-indigo-500"
                          : ""
                      }`}
                      onClick={() => {
                        setActiveChatRoomId(room.id);
                        // If we know the product for this room, update the product state
                        if (roomProduct) {
                          setProduct(roomProduct);
                        }
                        navigate(
                          `/chat?chatroom_id=${room.id}&product=${
                            roomProduct || product
                          }`
                        );
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate !mb-0">
                          {room.title || "New Chat"}
                        </p>
                        {roomProduct && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              roomProduct === "buildRFI"
                                ? "bg-blue-100 text-blue-800"
                                : roomProduct === "buildGenius"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {roomProduct.replace("build", "")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(room.created_at)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                folderSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg !mb-0">Filter by Folders</h2>
                <button
                  onClick={() => setFolderSidebarOpen(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
                <FolderStructure
                  onSelectionChange={setSelectedFolders}
                  initialSelected={selectedFolders}
                />

                {selectedFolders.length > 0 && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-700 mb-2">
                      {selectedFolders.length} folder
                      {selectedFolders.length !== 1 ? "s" : ""} selected
                    </p>
                    <button
                      onClick={() => {
                        // Force a complete reset of selectedFolders
                        const emptyArray: string[] = [];
                        setSelectedFolders(emptyArray);
                        // Force re-render of folder selection UI
                        setTimeout(() => {
                          setFolderSidebarOpen(false);
                          setTimeout(() => {
                            setFolderSidebarOpen(true);
                          }, 50);
                        }, 50);
                      }}
                      className="w-full py-2 px-4 bg-indigo-600 !text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col flex-grow overflow-hidden">
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

                  {loading && !isStreaming && (
                    <div className="text-center py-6">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

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
                          {product} - {response.type}
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

              <div className="mt-auto mx-2 mb-4">
                <div className="mb-2">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleProductChange("buildRFI")}
                      className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                        product === "buildRFI"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } ${productSwitching ? "opacity-50 cursor-wait" : ""}`}
                      disabled={productSwitching}
                    >
                      BuildRFI
                    </button>
                    <button
                      onClick={() => handleProductChange("buildGenius")}
                      className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                        product === "buildGenius"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } ${productSwitching ? "opacity-50 cursor-wait" : ""}`}
                      disabled={productSwitching}
                    >
                      BuildGenius
                    </button>
                    <button
                      onClick={() => handleProductChange("buildRFD")}
                      className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                        product === "buildRFD"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } ${productSwitching ? "opacity-50 cursor-wait" : ""}`}
                      disabled={productSwitching}
                    >
                      BuildRFD
                    </button>
                  </div>

                  {/* Loading indicator while switching products */}
                  {productSwitching && (
                    <div className="text-center py-2">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
                      <span className="ml-2 text-xs text-gray-600">
                        Creating new chat...
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex items-center overflow-hidden">
                  <input
                    type="text"
                    className="flex-grow p-3 outline-none border-0 focus:ring-0 text-gray-800"
                    placeholder={`Describe your issue or missing document for ${product}${
                      selectedFolders.length > 0
                        ? " (filtered by " +
                          selectedFolders.length +
                          " folder" +
                          (selectedFolders.length !== 1 ? "s" : "") +
                          ")"
                        : ""
                    }...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <div className="bg-gray-50 p-2 flex items-center">
                    <button
                      className={`${
                        !inputMessage.trim() || loading
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } !text-white px-4 py-2 rounded-lg font-medium flex items-center`}
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || loading}
                    >
                      Send <span className="ml-1">&#10148;</span>
                    </button>
                  </div>
                  <div className="ml-2">
                    <VoiceInput
                      onTranscriptionReceived={handleTranscriptionReceived}
                      disabled={loading}
                    />
                  </div>
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
