'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Document {
  id: number;
  filename: string;
  originalFilename: string;
  documentType: string;
  fileSize: number;
  status: string;
  createdAt: string;
  uploadedBy: {
    id: number;
    username: string;
    email: string;
  };
}

export default function ApprovalsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    try {
      // This endpoint should be created in the backend to filter documents
      // For now, we'll use a placeholder
      const response = await api.get('/documents');
      // Filter for documents that need approval
      const pending = response.data.filter(
        (doc: Document) => doc.status === 'SUBMITTED' || doc.status === 'UNDER_REVIEW'
      );
      setDocuments(pending);
    } catch (error) {
      toast.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId: number) => {
    if (!confirm('Are you sure you want to approve this document?')) {
      return;
    }

    setProcessingId(documentId);
    try {
      await api.post(`/approvals/${documentId}/approve`, {
        comments: 'Approved',
      });
      toast.success('Document approved successfully');
      loadPendingDocuments();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to approve document');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (documentId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) {
      return;
    }

    setProcessingId(documentId);
    try {
      await api.post(`/approvals/${documentId}/reject`, {
        comments: reason,
      });
      toast.success('Document rejected');
      loadPendingDocuments();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to reject document');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve submitted documents</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading pending approvals...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
            <p className="text-gray-600">All documents have been processed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.originalFilename}
                          </div>
                          <div className="text-xs text-gray-500">ID: {doc.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{doc.uploadedBy?.username || '-'}</div>
                      <div className="text-xs text-gray-500">{doc.uploadedBy?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.documentType || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatFileSize(doc.fileSize)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {doc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownload(doc.id, doc.originalFilename)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleApprove(doc.id)}
                          disabled={processingId === doc.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(doc.id)}
                          disabled={processingId === doc.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
