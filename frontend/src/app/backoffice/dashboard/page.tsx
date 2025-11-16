"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/app-layout";
import { CheckCircle, XCircle, Clock, FileCheck } from "lucide-react";
import Link from "next/link";

export default function BackOfficeDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setPendingApprovals(response.data);
    } catch (error) {
      console.error('Failed to load pending approvals', error);
    }
  };

  const handleApproval = async (approvalId: number, action: string) => {
    try {
      await api.post(`/approvals/${approvalId}/action`, {
        action,
        comments: '',
      });
      loadPendingApprovals();
    } catch (error) {
      console.error('Failed to process approval', error);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Back Office Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve document submissions
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Signatures Pending</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Submitter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Current Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {approval.formSubmission?.submissionNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {approval.formSubmission?.submittedBy?.username || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      Step {approval.currentStepOrder}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(approval.startedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleApproval(approval.id, 'APPROVE')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(approval.id, 'REJECT')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                      <Link
                        href={`/backoffice/approvals/${approval.id}`}
                        className="text-primary hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
