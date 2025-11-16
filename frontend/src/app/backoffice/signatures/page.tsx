"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/app-layout";
import { FileCheck, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignaturesPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      // Load documents that are approved and can be signed
      const response = await api.get('/documents/my-documents');
      const approvedDocs = response.data.filter(
        (doc: any) => doc.status === 'APPROVED' || doc.status === 'SIGNED'
      );
      setDocuments(approvedDocs);
    } catch (error) {
      console.error('Failed to load documents', error);
      toast.error('Failed to load documents');
    }
  };

  const handleSign = async (documentId: number) => {
    setLoading(true);
    try {
      await api.post(`/signatures/sign/${documentId}`);
      toast.success('Document signed successfully');
      loadDocuments();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to sign document');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'APPROVED':
        return <FileCheck className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return 'text-green-600 bg-green-50';
      case 'APPROVED':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Digital Signatures</h2>
              <p className="mt-1 text-sm text-gray-600">
                Sign approved documents with digital signatures
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Documents Available for Signing</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Document Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {document.documentNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{document.originalFilename}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {document.documentType || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.status)}
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
                      {document.status === 'APPROVED' && (
                        <button
                          onClick={() => handleSign(document.id)}
                          disabled={loading}
                          className="text-primary hover:text-primary/80 disabled:opacity-50"
                        >
                          Sign Document
                        </button>
                      )}
                      {document.status === 'SIGNED' && (
                        <Link
                          href={`/backoffice/signatures/${document.id}`}
                          className="text-primary hover:underline"
                        >
                          View Signatures
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No documents available for signing
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
