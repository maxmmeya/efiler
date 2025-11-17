'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import Link from 'next/link';

interface Form {
  id: number;
  name: string;
  description: string;
  formCode: string;
  schema: string;
  uiSchema: string;
  validationRules: string;
  approvalWorkflowId: number | null;
  isActive: boolean;
  version: number;
  createdAt: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formCode: '',
    schema: '{"type":"object","properties":{}}',
    uiSchema: '{}',
    validationRules: '{}',
    approvalWorkflowId: null as number | null,
    isActive: true,
  });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await api.get('/forms');
      setForms(response.data);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (form?: Form) => {
    if (form) {
      setEditingForm(form);
      setFormData({
        name: form.name,
        description: form.description || '',
        formCode: form.formCode || '',
        schema: form.schema || '{"type":"object","properties":{}}',
        uiSchema: form.uiSchema || '{}',
        validationRules: form.validationRules || '{}',
        approvalWorkflowId: form.approvalWorkflowId,
        isActive: form.isActive,
      });
    } else {
      setEditingForm(null);
      setFormData({
        name: '',
        description: '',
        formCode: '',
        schema: '{"type":"object","properties":{}}',
        uiSchema: '{}',
        validationRules: '{}',
        approvalWorkflowId: null,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingForm(null);
  };

  const validateJSON = (jsonString: string, fieldName: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      toast.error(`Invalid JSON in ${fieldName}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON fields
    if (!validateJSON(formData.schema, 'Schema')) return;
    if (!validateJSON(formData.uiSchema, 'UI Schema')) return;
    if (!validateJSON(formData.validationRules, 'Validation Rules')) return;

    try {
      if (editingForm) {
        await api.put(`/forms/${editingForm.id}`, formData);
        toast.success('Form updated successfully');
      } else {
        await api.post('/forms', formData);
        toast.success('Form created successfully');
      }
      handleCloseModal();
      loadForms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save form');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await api.delete(`/forms/${id}`);
      toast.success('Form deleted successfully');
      loadForms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete form');
    }
  };

  const handleToggleActive = async (form: Form) => {
    try {
      await api.put(`/forms/${form.id}`, {
        ...form,
        isActive: !form.isActive,
      });
      toast.success(`Form ${!form.isActive ? 'activated' : 'deactivated'} successfully`);
      loadForms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update form');
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Forms Management</h1>
            <p className="text-gray-600 mt-1">Create and manage dynamic forms</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Form
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-600">Get started by creating your first form.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{form.name}</div>
                      <div className="text-sm text-gray-500">{form.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {form.formCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{form.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(form)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          form.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {form.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/forms/${form.id}/preview`}
                          className="text-green-600 hover:text-green-900"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleOpenModal(form)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingForm ? 'Edit Form' : 'Create New Form'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Form Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Form Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.formCode}
                      onChange={(e) => setFormData({ ...formData, formCode: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="e.g., VISA_APPLICATION"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Schema (JSON) *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Define the form structure using JSON Schema format
                  </p>
                  <textarea
                    rows={8}
                    required
                    value={formData.schema}
                    onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                    placeholder='{"type":"object","properties":{"fieldName":{"type":"string","title":"Field Label"}}}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UI Schema (JSON)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Customize how form fields are rendered
                  </p>
                  <textarea
                    rows={5}
                    value={formData.uiSchema}
                    onChange={(e) => setFormData({ ...formData, uiSchema: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                    placeholder='{"fieldName":{"ui:widget":"textarea"}}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validation Rules (JSON)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Define custom validation logic
                  </p>
                  <textarea
                    rows={4}
                    value={formData.validationRules}
                    onChange={(e) => setFormData({ ...formData, validationRules: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                    placeholder='{}'
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active (form will be visible to users)
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingForm ? 'Update Form' : 'Create Form'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
