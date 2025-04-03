export interface ChatRoom {
  id: string;
  title: string;
  created_at: string;
}

export interface ChatRoomsResponse {
  chatrooms: ChatRoom[];
  total: number;
  limit: number;
  offset: number;
}

export interface Source {
  open_in: string;
  page_num?: number;
  file_name: string;
  file_type: string;
  source_url: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  metadata?: {
    sources?: Source[];
  };
  timestamp: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface QueryRequest {
  query: string;
  user_id: number;
  chatroom_id: string;
  namespace: string[] | string;
  product: string;
}

export interface RFIResponse {
  content: string;
  type: string;
}

export interface FolderNode {
  name: string;
  children?: FolderNode[];
  namespaces?: string[];
  namespace?: string;
}

export interface FolderStructureProps {
  onSelectionChange: (selectedFolders: string[]) => void;
  initialSelected?: string[];
}

export interface SourcesResponse {
  status_code: number;
  message: string;
  sources: Source[];
}
