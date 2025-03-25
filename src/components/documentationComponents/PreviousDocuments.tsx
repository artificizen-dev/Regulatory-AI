import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../utils/constants";
import { useAuth } from "../../providers/AuthContext";
import { Table, Space, Button, Modal, Tag } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

interface PreviousDocumentsProps {
  refreshKey: number;
}

interface DocumentFile {
  document_name: string;
  id: number;
  bucket_path: string;
  document_type: string;
  namespace: string;
}

interface DocumentsResponse {
  status_code: number;
  files: DocumentFile[];
  total: number;
  limit: number;
  offset: number;
}

const PreviousDocuments: React.FC<PreviousDocumentsProps> = ({
  refreshKey,
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const { handleSuccess, handleError } = useAuth();

  const fetchDocuments = async (page = 1, pageSize = 10) => {
    setLoading(true);
    const offset = (page - 1) * pageSize;

    try {
      const response = await axios.get<DocumentsResponse>(
        `${backendURL}/api/uploaded-documents?limit=${pageSize}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status_code === 200) {
        setDocuments(response.data.files || []);
        setPagination({
          ...pagination,
          current: page,
          pageSize: pageSize,
          total: response.data.total,
        });
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to fetch documents";

      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(pagination.current, pagination.pageSize);
  }, [refreshKey]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchDocuments(newPagination.current || 1, newPagination.pageSize);
  };

  const showDeleteModal = (id: number) => {
    setDocumentToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDocumentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete === null) return;

    try {
      await axios.delete(`${backendURL}/api/delete-uploaded-document`, {
        data: { file_id: documentToDelete },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      handleSuccess("Document deleted successfully");
      fetchDocuments(pagination.current, pagination.pageSize);
      setDeleteModalVisible(false);
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to delete document";

      handleError(errorMessage);
    } finally {
      setDocumentToDelete(null);
    }
  };

  const getFileNameFromPath = (path: string): string => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  const columns = [
    {
      title: "Document",
      key: "document",
      render: (record: DocumentFile) => (
        <div className="flex items-center">
          <FileTextOutlined
            style={{ fontSize: "20px", color: "#6366f1", marginRight: "12px" }}
          />
          <div>
            <div className="font-medium">
              {getFileNameFromPath(record.document_name)}
            </div>
            <div className="text-xs text-gray-500">ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "document_type",
      key: "document_type",
      render: (document_type: string) => (
        <Tag color="blue">{document_type.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Namespace",
      dataIndex: "namespace",
      key: "namespace",
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (record: DocumentFile) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            href={record.bucket_path}
            target="_blank"
            rel="noopener noreferrer"
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            href={record.bucket_path}
            download
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record.id)}
          />
        </Space>
      ),
    },
  ];

  const locale = {
    emptyText: (
      <div className="py-12 text-center">
        <FileTextOutlined
          style={{
            fontSize: "48px",
            color: "#d9d9d9",
            marginBottom: "16px",
            display: "block",
          }}
        />
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          No documents found
        </h3>
        <p className="text-gray-500">
          Upload your first document to get started
        </p>
      </div>
    ),
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Your Documents</h2>

        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          locale={locale}
        />

        <Modal
          title="Confirm Delete"
          open={deleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <p>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default PreviousDocuments;
