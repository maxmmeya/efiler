'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChecklistItem {
  id?: number;
  label: string;
  description: string;
  displayOrder: number;
  itemType: 'CHECKBOX' | 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'DATE' | 'NUMBER';
  isRequired: boolean;
  isActive: boolean;
  options?: string;
}

interface DocumentType {
  id: number;
  name: string;
  description: string;
  code: string;
}

export default function ChecklistManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const documentTypeId = params.id;
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [formData, setFormData] = useState<ChecklistItem>({
    label: '',
    description: '',
    displayOrder: 1,
    itemType: 'CHECKBOX',
    isRequired: false,
    isActive: true,
    options: '',
  });

  useEffect(() => {
    loadData();
  }, [documentTypeId]);

  const loadData = async () => {
    try {
      const [typeResponse, itemsResponse] = await Promise.all([
        api.get(`/document-types/${documentTypeId}`),
        api.get(`/document-types/${documentTypeId}/checklist-items`),
      ]);
      setDocumentType(typeResponse.data);
      setChecklistItems(itemsResponse.data);
    } catch (error) {
      toast.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem && editingItem.id) {
        await api.put(`/document-types/checklist-items/${editingItem.id}`, formData);
        toast.success('Checklist item updated successfully');
      } else {
        await api.post(`/document-types/${documentTypeId}/checklist-items`, formData);
        toast.success('Checklist item added successfully');
      }

      setShowModal(false);
      setEditingItem(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to save checklist item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      description: item.description || '',
      displayOrder: item.displayOrder,
      itemType: item.itemType,
      isRequired: item.isRequired,
      isActive: item.isActive,
      options: item.options || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) {
      return;
    }

    try {
      await api.delete(`/document-types/checklist-items/${id}`);
      toast.success('Checklist item deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to delete checklist item');
    }
  };

  const resetForm = () => {
    const maxOrder = Math.max(...checklistItems.map(item => item.displayOrder), 0);
    setFormData({
      label: '',
      description: '',
      displayOrder: maxOrder + 1,
      itemType: 'CHECKBOX',
      isRequired: false,
      isActive: true,
      options: '',
    });
  };

  const itemTypeOptions = [
    { value: 'CHECKBOX', label: 'Checkbox (Yes/No)' },
    { value: 'TEXT', label: 'Text Input' },
    { value: 'TEXTAREA', label: 'Text Area' },
    { value: 'SELECT', label: 'Dropdown' },
    { value: 'RADIO', label: 'Radio Buttons' },
    { value: 'DATE', label: 'Date Picker' },
    { value: 'NUMBER', label: 'Number Input' },
  ];

  const needsOptions = formData.itemType === 'SELECT' || formData.itemType === 'RADIO';

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/backoffice/document-types')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Document Types
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {documentType?.name} - Checklist
              </h1>
              <p className="text-gray-600 mt-1">
                Manage checklist items for {documentType?.name}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Checklist Item
            </button>
          </div>
        </div>

        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading checklist...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {checklistItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No checklist items found</p>
                <p className="text-sm mt-1">Add items to create a checklist for this document type</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {checklistItems
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500">
                              #{item.displayOrder}
                            </span>
                            <h3 className="text-base font-medium text-gray-900">{item.label}</h3>
                            {item.isRequired && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                            {!item.isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {itemTypeOptions.find((opt) => opt.value === item.itemType)?.label}
                            </span>
                            {item.options && (
                              <span className="text-gray-500">
                                Options: {JSON.parse(item.options).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => item.id && handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Edit Checklist Item' : 'Add Checklist Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Type *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.itemType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          itemType: e.target.value as ChecklistItem['itemType'],
                        })
                      }
                    >
                      {itemTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {needsOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required={needsOptions}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.options}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                      placeholder="e.g., Option 1, Option 2, Option 3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter options separated by commas
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
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
