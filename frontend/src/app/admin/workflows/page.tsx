'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { GitBranch, Plus, Edit, Trash2, X, Settings } from 'lucide-react';
import Link from 'next/link';

interface Workflow {
  id: number;
  name: string;
  description: string;
  workflowCode: string;
  steps: ApprovalStep[];
  isActive: boolean;
  requiresDigitalSignature: boolean;
  createdAt: string;
}

interface ApprovalStep {
  id: number;
  stepName: string;
  stepOrder: number;
  description: string;
  requiresAllApprovers: boolean;
  isFinalStep: boolean;
  requiresSignature: boolean;
  autoApproveHours: number | null;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workflowCode: '',
    isActive: true,
    requiresDigitalSignature: false,
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await api.get('/workflows');
      setWorkflows(response.data);
    } catch (error) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (workflow?: Workflow) => {
    if (workflow) {
      setEditingWorkflow(workflow);
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
        workflowCode: workflow.workflowCode || '',
        isActive: workflow.isActive,
        requiresDigitalSignature: workflow.requiresDigitalSignature,
      });
    } else {
      setEditingWorkflow(null);
      setFormData({
        name: '',
        description: '',
        workflowCode: '',
        isActive: true,
        requiresDigitalSignature: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWorkflow(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingWorkflow) {
        await api.put(`/workflows/${editingWorkflow.id}`, formData);
        toast.success('Workflow updated successfully');
      } else {
        await api.post('/workflows', formData);
        toast.success('Workflow created successfully');
      }
      handleCloseModal();
      loadWorkflows();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save workflow');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      await api.delete(`/workflows/${id}`);
      toast.success('Workflow deleted successfully');
      loadWorkflows();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete workflow');
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      await api.put(`/workflows/${workflow.id}`, {
        ...workflow,
        isActive: !workflow.isActive,
      });
      toast.success(`Workflow ${!workflow.isActive ? 'activated' : 'deactivated'} successfully`);
      loadWorkflows();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update workflow');
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Workflows Management</h1>
            <p className="text-gray-600 mt-1">Configure approval workflows and stages</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Workflow
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <GitBranch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-600">Get started by creating your first approval workflow.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <button
                          onClick={() => handleToggleActive(workflow)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            workflow.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </button>
                        {workflow.requiresDigitalSignature && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Digital Signature Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Code: {workflow.workflowCode}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/workflows/${workflow.id}/steps`}
                        className="text-green-600 hover:text-green-900"
                        title="Manage Steps"
                      >
                        <Settings size={18} />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(workflow)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Steps visualization */}
                  {workflow.steps && workflow.steps.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Approval Steps:</h4>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {workflow.steps
                          .sort((a, b) => a.stepOrder - b.stepOrder)
                          .map((step, index) => (
                            <div key={step.id} className="flex items-center">
                              <div className="flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 min-w-[180px]">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-blue-900">
                                    Step {step.stepOrder}
                                  </span>
                                  {step.isFinalStep && (
                                    <span className="text-xs text-green-600 font-medium">Final</span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-900">{step.stepName}</p>
                                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                                {step.requiresSignature && (
                                  <span className="inline-block mt-2 text-xs text-purple-600">
                                    🔏 Signature Required
                                  </span>
                                )}
                              </div>
                              {index < workflow.steps.length - 1 && (
                                <div className="flex-shrink-0 mx-2 text-gray-400">→</div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                  Created on {new Date(workflow.createdAt).toLocaleDateString()} •{' '}
                  {workflow.steps?.length || 0} approval step(s)
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="e.g., Standard Approval Process"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Workflow Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.workflowCode}
                    onChange={(e) => setFormData({ ...formData, workflowCode: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="e.g., STD_APPROVAL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Describe the purpose and flow of this workflow"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresDigitalSignature}
                      onChange={(e) =>
                        setFormData({ ...formData, requiresDigitalSignature: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Require Digital Signature
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active (workflow can be assigned to forms)
                    </label>
                  </div>
                </div>

                {!editingWorkflow && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      After creating the workflow, you can add approval steps and configure approvers.
                    </p>
                  </div>
                )}

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
                    {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
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
