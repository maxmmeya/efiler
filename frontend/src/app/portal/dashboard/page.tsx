"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FileText, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function PortalDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const currentUser = authService.getUser();
    setUser(currentUser);
    loadSubmissions();
  }, [router]);

  const loadSubmissions = async () => {
    try {
      const response = await api.get('/forms/submissions/my-submissions');
      const data = response.data;
      setSubmissions(data);

      // Calculate stats
      setStats({
        totalSubmissions: data.length,
        pending: data.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length,
        approved: data.filter((s: any) => s.status === 'APPROVED').length,
        rejected: data.filter((s: any) => s.status === 'REJECTED').length,
      });
    } catch (error) {
      console.error('Failed to load submissions', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50';
      case 'REJECTED':
        return 'text-red-600 bg-red-50';
      case 'UNDER_REVIEW':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-primary">E-Filing Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={() => authService.logout()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your document submissions and track their status
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/portal/submit"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
          >
            <Upload className="mr-2 h-5 w-5" />
            New Submission
          </Link>
          <Link
            href="/portal/documents"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="mr-2 h-5 w-5" />
            My Documents
          </Link>
          <Link
            href="/portal/institutional-documents"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="mr-2 h-5 w-5" />
            Institutional Documents
          </Link>
        </div>

        {/* Recent Submissions */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Submission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Form
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
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
                {submissions.slice(0, 10).map((submission) => (
                  <tr key={submission.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {submission.submissionNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {submission.form?.name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        href={`/portal/submissions/${submission.id}`}
                        className="text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
