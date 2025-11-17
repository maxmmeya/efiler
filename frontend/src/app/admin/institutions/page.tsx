'use client';

import { AppLayout } from '@/components/app-layout';
import { Building2 } from 'lucide-react';

export default function InstitutionsPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Institutions Management</h1>
          <p className="text-gray-600 mt-1">Manage registered institutions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Institutions Management
          </h3>
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </AppLayout>
  );
}
