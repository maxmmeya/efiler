"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Share2, Users, User, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ShareDocumentPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [shareType, setShareType] = useState<"user" | "institution" | "all">("user");
  const [users, setUsers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const currentUser = authService.getUser();
    if (!currentUser?.roles.includes('ROLE_BACK_OFFICE') && !currentUser?.roles.includes('ROLE_ADMINISTRATOR')) {
      router.push('/portal/dashboard');
      return;
    }

    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [docsRes, usersRes, instRes] = await Promise.all([
        api.get('/documents/my-documents'),
        api.get('/users'),
        api.get('/institutions')
      ]);

      setDocuments(docsRes.data);
      setUsers(usersRes.data || []);
      setInstitutions(instRes.data || []);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDocument) {
      toast.error('Please select a document');
      return;
    }

    try {
      let endpoint = '';
      let payload: any = {
        documentId: selectedDocument,
        message,
      };

      if (shareType === 'user') {
        if (!selectedUserId) {
          toast.error('Please select a user');
          return;
        }
        endpoint = '/document-shares/share-with-user';
        payload.sharedWithUserId = selectedUserId;
      } else if (shareType === 'institution') {
        if (!selectedInstitutionId) {
          toast.error('Please select an institution');
          return;
        }
        endpoint = '/document-shares/share-with-institution';
        payload.institutionId = selectedInstitutionId;
      } else {
        endpoint = '/document-shares/share-with-all';
      }

      await api.post(endpoint, payload);
      toast.success('Document shared successfully');

      // Reset form
      setSelectedDocument(null);
      setSelectedUserId("");
      setSelectedInstitutionId("");
      setMessage("");
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to share document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <Link href="/backoffice/dashboard" className="text-xl font-bold text-primary">
                Back Office
              </Link>
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

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Share Document</h2>
              <p className="mt-1 text-sm text-gray-600">
                Share approved documents with users or institutions
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleShare} className="space-y-6">
            {/* Document Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Document
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedDocument || ""}
                onChange={(e) => setSelectedDocument(Number(e.target.value))}
                required
              >
                <option value="">-- Select a document --</option>
                {documents.filter(doc => doc.status === 'APPROVED' || doc.status === 'SIGNED').map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.documentNumber} - {doc.originalFilename}
                  </option>
                ))}
              </select>
            </div>

            {/* Share Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Share With
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setShareType("user")}
                  className={`flex items-center justify-center space-x-2 rounded-lg border-2 p-4 ${
                    shareType === "user"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Specific User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareType("institution")}
                  className={`flex items-center justify-center space-x-2 rounded-lg border-2 p-4 ${
                    shareType === "institution"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Institution</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareType("all")}
                  className={`flex items-center justify-center space-x-2 rounded-lg border-2 p-4 ${
                    shareType === "all"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Globe className="h-5 w-5" />
                  <span>All Users</span>
                </button>
              </div>
            </div>

            {/* User Selection */}
            {shareType === "user" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select User
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required={shareType === "user"}
                >
                  <option value="">-- Select a user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Institution Selection */}
            {shareType === "institution" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Institution
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  required={shareType === "institution"}
                >
                  <option value="">-- Select an institution --</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for the recipients..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/backoffice/dashboard"
                className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/90"
              >
                Share Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
