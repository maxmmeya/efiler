'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalDocuments: number;
  totalInstitutions: number;
  pendingApprovals: number;
  approvedDocuments: number;
  rejectedDocuments: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDocuments: 0,
    totalInstitutions: 0,
    pendingApprovals: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // These endpoints should be created in the backend
      // For now, using placeholder data
      const [usersRes, docsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/documents').catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const docs = docsRes.data || [];

      setStats({
        totalUsers: users.length,
        totalDocuments: docs.length,
        totalInstitutions: 0, // Placeholder
        pendingApprovals: docs.filter((d: any) => d.status === 'SUBMITTED').length,
        approvedDocuments: docs.filter((d: any) => d.status === 'APPROVED').length,
        rejectedDocuments: docs.filter((d: any) => d.status === 'REJECTED').length,
      });
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} rounded-full p-3`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and statistics</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="bg-blue-600"
              />
              <StatCard
                title="Total Documents"
                value={stats.totalDocuments}
                icon={FileText}
                color="bg-purple-600"
              />
              <StatCard
                title="Institutions"
                value={stats.totalInstitutions}
                icon={Building2}
                color="bg-indigo-600"
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                icon={Clock}
                color="bg-yellow-600"
              />
              <StatCard
                title="Approved Documents"
                value={stats.approvedDocuments}
                icon={CheckCircle}
                color="bg-green-600"
              />
              <StatCard
                title="Rejected Documents"
                value={stats.rejectedDocuments}
                icon={XCircle}
                color="bg-red-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
                <p className="text-gray-500 text-sm">No recent activity to display</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <a
                    href="/admin/users"
                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Manage Users</span>
                    </div>
                  </a>
                  <a
                    href="/admin/institutions"
                    className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        Manage Institutions
                      </span>
                    </div>
                  </a>
                  <a
                    href="/backoffice/document-types"
                    className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        Manage Document Types
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
