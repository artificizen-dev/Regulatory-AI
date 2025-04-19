import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../utils/constants";
import { useAuth } from "../../providers/AuthContext";
import { Table, Space, Button, Modal, Tag, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  DocumentFile,
  DocumentsResponse,
  PreviousDocumentsProps,
} from "../../interfaces";

const PreviousDocuments: React.FC<PreviousDocumentsProps> = ({
  refreshKey,
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const userId = localStorage.getItem("user_id");
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchDocuments = async (page = 1, pageSize = 10) => {
    setLoading(true);
    const offset = (page - 1) * pageSize;

    try {
      const response = await axios.get<DocumentsResponse>(
        `${backendURL}/api/uploaded-documents?limit=${pageSize}&offset=${offset}&user_id=${userId}`,
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
        data: { file_id: documentToDelete, user_id: userId },
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

  const getFileName = (record: DocumentFile): string => {
    // If document_name exists, use it (primary source)
    if (record.document_name) {
      const parts = record.document_name.split("/");
      return parts[parts.length - 1];
    }

    // Fallback to extracting from bucket_path if it exists
    if (record.bucket_path) {
      try {
        const url = new URL(record.bucket_path);
        const pathParts = url.pathname.split("/");
        return pathParts[pathParts.length - 1];
      } catch (e) {
        // If bucket_path is not a valid URL, just use the last part
        const parts = record.bucket_path.split("/");
        return parts[parts.length - 1];
      }
    }

    return "Unknown";
  };

  const getFileUrl = (record: DocumentFile): string => {
    // Use bucket_path directly if it's a URL (which it should be in the new format)
    if (record.bucket_path && record.bucket_path.startsWith("http")) {
      return record.bucket_path;
    }

    // Fallback: construct URL from bucket_path if it's not a full URL
    if (record.bucket_path) {
      return `https://storage.googleapis.com/buildrfi-bucket/${record.bucket_path}`;
    }

    return "";
  };

  const getColumns = () => {
    type ColumnType = {
      title: string;
      key: string;
      dataIndex?: string;
      ellipsis?: boolean;
      align?: "left" | "right" | "center";
      width?: number;
      render?: (text: any, record: DocumentFile) => React.ReactNode;
    };

    const baseColumns: ColumnType[] = [
      {
        title: "Document",
        key: "document",
        ellipsis: true,
        render: (_, record: DocumentFile) => (
          <div className="flex items-center">
            <FileTextOutlined
              style={{
                fontSize: "20px",
                color: "#6366f1",
                marginRight: "12px",
              }}
            />
            <div className="overflow-hidden">
              <div className="font-medium truncate max-w-xs">
                {getFileName(record)}
              </div>
              <div className="text-xs text-gray-500">ID: {record.id}</div>
            </div>
          </div>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        align: "right",
        width: windowWidth < 640 ? 100 : 120,
        render: (_, record: DocumentFile) => (
          <div className="flex items-center justify-end space-x-1">
            <Button
              type="text"
              icon={<EyeOutlined />}
              href={getFileUrl(record)}
              target="_blank"
              rel="noopener noreferrer"
              size={windowWidth < 640 ? "small" : "middle"}
              title="View"
              className="p-1"
            />
            <Button
              type="text"
              icon={<DownloadOutlined />}
              href={getFileUrl(record)}
              target="_blank"
              download
              size={windowWidth < 640 ? "small" : "middle"}
              title="Download"
              className="p-1"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record.id)}
              size={windowWidth < 640 ? "small" : "middle"}
              title="Delete"
              className="p-1"
            />
          </div>
        ),
      },
    ];

    if (windowWidth >= 640) {
      baseColumns.splice(1, 0, {
        title: "Type",
        key: "document_type",
        dataIndex: "document_type",
        width: 120,
        render: (text: string) => (
          <Tag color="blue">{text ? text.toUpperCase() : "UNKNOWN"}</Tag>
        ),
      });
    }

    if (windowWidth >= 1024) {
      baseColumns.splice(2, 0, {
        title: "Namespace",
        key: "namespace",
        dataIndex: "namespace",
        width: 150,
      });
    }

    return baseColumns;
  };

  const renderMobileCard = (record: DocumentFile) => {
    return (
      <div className="bg-white rounded p-4 border border-gray-200 mb-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <FileTextOutlined
              style={{
                fontSize: "24px",
                color: "#6366f1",
                marginRight: "12px",
              }}
            />
            <div>
              <div className="font-medium text-sm truncate max-w-xs">
                {getFileName(record)}
              </div>
              <div className="text-xs text-gray-500">ID: {record.id}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <Tag color="blue" className="mr-2">
              {record.document_type
                ? record.document_type.toUpperCase()
                : "UNKNOWN"}
            </Tag>
            <span className="text-xs text-gray-500">{record.namespace}</span>
          </div>

          <Space size="small">
            <Button
              type="text"
              icon={<EyeOutlined />}
              href={getFileUrl(record)}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            />
            <Button
              type="text"
              icon={<DownloadOutlined />}
              href={getFileUrl(record)}
              download
              size="small"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record.id)}
              size="small"
            />
          </Space>
        </div>
      </div>
    );
  };

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
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          Your Documents
        </h2>

        {/* Mobile card view (extra small screens only) */}
        {windowWidth < 480 ? (
          <div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center">
                <FileTextOutlined
                  style={{
                    fontSize: "40px",
                    color: "#d9d9d9",
                    marginBottom: "12px",
                    display: "block",
                  }}
                />
                <Typography.Title
                  level={5}
                  className="font-medium text-gray-700 mb-2"
                >
                  No documents found
                </Typography.Title>
                <Typography.Text type="secondary">
                  Upload your first document to get started
                </Typography.Text>
              </div>
            ) : (
              <div>
                {documents.map((record) => (
                  <div key={record.id}>{renderMobileCard(record)}</div>
                ))}
                <div className="flex justify-center mt-4">
                  <Button
                    type="primary"
                    disabled={pagination.current === 1}
                    onClick={() =>
                      fetchDocuments(
                        (pagination.current || 1) - 1,
                        pagination.pageSize
                      )
                    }
                  >
                    Previous
                  </Button>
                  <span className="mx-4 flex items-center">
                    Page {pagination.current} of{" "}
                    {Math.ceil(
                      (pagination.total || 0) / (pagination.pageSize || 10)
                    )}
                  </span>
                  <Button
                    type="primary"
                    disabled={
                      (pagination.current || 1) >=
                      Math.ceil(
                        (pagination.total || 0) / (pagination.pageSize || 10)
                      )
                    }
                    onClick={() =>
                      fetchDocuments(
                        (pagination.current || 1) + 1,
                        pagination.pageSize
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Table view for small screens and up
          <div className="overflow-x-auto table-no-gap">
            <style>
              {`
                .table-no-gap .ant-table-cell {
                  padding-left: 8px !important;
                  padding-right: 8px !important;
                }
                .table-no-gap .ant-table-thead > tr > th {
                  padding-left: 8px !important;
                  padding-right: 8px !important;
                }
              `}
            </style>
            <Table
              columns={getColumns()}
              dataSource={documents}
              rowKey="id"
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
              locale={locale}
              scroll={{ x: windowWidth < 640 ? 480 : "max-content" }}
              size={windowWidth < 768 ? "small" : "middle"}
              bordered={false}
            />
          </div>
        )}

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
