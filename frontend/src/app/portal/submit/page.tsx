"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { DocumentUpload } from "@/components/document-upload";
import { toast } from "sonner";
import Link from "next/link";

export default function SubmitPage() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await api.get('/forms/public/active');
      setForms(response.data);
    } catch (error) {
      console.error('Failed to load forms', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedForm) {
      toast.error('Please select a form');
      return;
    }

    try {
      await api.post(`/forms/${selectedForm.id}/submit`, {
        data: JSON.stringify(formData),
      });

      toast.success('Form submitted successfully');
      router.push('/portal/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to submit form');
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">New Submission</h2>
          <p className="mt-1 text-sm text-gray-600">
            Select a form and fill in the required information
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Form
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  const form = forms.find(f => f.id === parseInt(e.target.value));
                  setSelectedForm(form);
                  setFormData({});
                }}
              >
                <option value="">-- Select a form --</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedForm && (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedForm.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedForm.description}
                  </p>
                </div>

                {/* Dynamic Form Fields - Simplified Example */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Documents
                  </label>
                  <DocumentUpload
                    documentType={selectedForm.formCode}
                    onUploadComplete={(doc) => {
                      setFormData({
                        ...formData,
                        documents: [...(formData.documents || []), doc.id],
                      });
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link
                    href="/portal/dashboard"
                    className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/90"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
