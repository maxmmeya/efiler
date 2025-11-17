"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/app-layout";
import { Shield, CheckCircle, XCircle, Clock, FileText, User, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignatureDetailsPage() {
  const params = useParams();
  const documentId = params.documentId;
  const [document, setDocument] = useState<any>(null);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<any>(null);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadDocument();
    loadSignatures();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to load document', error);
    }
  };

  const loadSignatures = async () => {
    try {
      const response = await api.get(`/signatures/document/${documentId}`);
      setSignatures(response.data);
      if (response.data.length > 0) {
        setSelectedSignature(response.data[0]);
        loadVerificationHistory(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load signatures', error);
    }
  };

  const loadVerificationHistory = async (signatureId: number) => {
    try {
      const response = await api.get(`/signatures/${signatureId}/verification-history`);
      setVerificationHistory(response.data);
    } catch (error) {
      console.error('Failed to load verification history', error);
    }
  };

  const handleVerify = async (signatureId: number) => {
    setVerifying(true);
    try {
      const response = await api.post(`/signatures/verify/${signatureId}`);
      toast.success('Signature verified successfully');
      loadVerificationHistory(signatureId);
      setSelectedSignature({ ...selectedSignature, ...response.data });
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to verify signature');
    } finally {
      setVerifying(false);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'VALID':
        return 'text-green-600 bg-green-50';
      case 'INVALID':
      case 'CERTIFICATE_EXPIRED':
      case 'CERTIFICATE_REVOKED':
      case 'DOCUMENT_MODIFIED':
      case 'TRUST_CHAIN_BROKEN':
        return 'text-red-600 bg-red-50';
      case 'VERIFICATION_FAILED':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'VALID':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'INVALID':
      case 'CERTIFICATE_EXPIRED':
      case 'CERTIFICATE_REVOKED':
      case 'DOCUMENT_MODIFIED':
      case 'TRUST_CHAIN_BROKEN':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/backoffice/signatures" className="text-sm text-primary hover:underline">
            ← Back to Signatures
          </Link>
          <div className="mt-4 flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Signature Details</h2>
              <p className="mt-1 text-sm text-gray-600">
                View and verify digital signatures for this document
              </p>
            </div>
          </div>
        </div>

        {/* Document Info */}
        {document && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Document Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Document Number</p>
                <p className="mt-1 text-sm text-gray-900">{document.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Filename</p>
                <p className="mt-1 text-sm text-gray-900">{document.originalFilename}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-green-600 bg-green-50">
                    {document.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Checksum</p>
                <p className="mt-1 text-xs font-mono text-gray-900">{document.checksum?.substring(0, 32)}...</p>
              </div>
            </div>
          </div>
        )}

        {/* Signatures List */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Digital Signatures ({signatures.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {signatures.map((signature) => (
              <div
                key={signature.id}
                className={`cursor-pointer p-6 hover:bg-gray-50 ${selectedSignature?.id === signature.id ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedSignature(signature);
                  loadVerificationHistory(signature.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Signed by {signature.signedBy?.firstName} {signature.signedBy?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(signature.signedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      signature.status === 'VALID' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {signature.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerify(signature.id);
                      }}
                      disabled={verifying}
                      className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Algorithm</p>
                    <p className="font-medium text-gray-900">{signature.signatureAlgorithm}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hash</p>
                    <p className="font-mono text-xs text-gray-900">{signature.signatureHash?.substring(0, 16)}...</p>
                  </div>
                  <div>
                    <p className="text-gray-500">IP Address</p>
                    <p className="font-medium text-gray-900">{signature.ipAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification History */}
        {selectedSignature && verificationHistory.length > 0 && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Verification History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Verified At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Verified By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Checks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {verificationHistory.map((verification) => (
                    <tr key={verification.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {new Date(verification.verifiedAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {verification.verifiedBy?.username || 'System'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {getResultIcon(verification.result)}
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getResultColor(verification.result)}`}>
                            {verification.result}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <span className={`text-xs ${verification.certificateValid ? 'text-green-600' : 'text-red-600'}`}>
                            {verification.certificateValid ? '✓' : '✗'} Cert
                          </span>
                          <span className={`text-xs ${verification.signatureIntact ? 'text-green-600' : 'text-red-600'}`}>
                            {verification.signatureIntact ? '✓' : '✗'} Sig
                          </span>
                          <span className={`text-xs ${verification.documentUnmodified ? 'text-green-600' : 'text-red-600'}`}>
                            {verification.documentUnmodified ? '✓' : '✗'} Doc
                          </span>
                          <span className={`text-xs ${verification.trustChainValid ? 'text-green-600' : 'text-red-600'}`}>
                            {verification.trustChainValid ? '✓' : '✗'} Trust
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{verification.details}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
