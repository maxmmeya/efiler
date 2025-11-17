'use client';

import { AppLayout } from '@/components/app-layout';
import { FileText } from 'lucide-react';

export default function FormsPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Forms Management</h1>
          <p className="text-gray-600 mt-1">Create and manage dynamic forms</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Forms Management
          </h3>
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </AppLayout>
  );
}
