import React, { useState, useEffect } from "react";
import { 
  FolderArchive, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Mail, 
  FileText, 
  CheckSquare, 
  Square, 
  RefreshCw,
  Eye,
  Trash2,
  X
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";
import { getApiUrl } from "../utils/serverBase";

const DOC_TYPES = [
  "ALL",
  "Offer Letter",
  "Appointment Letter",
  "Increment Letter",
  "Salary Slip",
  "FNF Settlement",
  "Termination Letter"
];

export default function DocumentVault() {
  const { fetchAllDocuments, bulkDownloadZip, deleteDocument, employees } = useEmployee();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocs, setSelectedDocs] = useState([]);
  
  // PDF Preview Modal
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetchAllDocuments({
        type: selectedType,
        email: selectedEmployeeEmail,
        search: searchTerm
      });
      setDocuments(res.data || []);
      setSelectedDocs([]);
    } catch (err) {
      console.error(err);
      alert("Failed to load documents: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [selectedType, selectedEmployeeEmail]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDocs();
  };

  const toggleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(d => ({ docType: d.docType, _id: d._id })));
    }
  };

  const toggleSelectDoc = (doc) => {
    const exists = selectedDocs.some(d => d._id === doc._id);
    if (exists) {
      setSelectedDocs(selectedDocs.filter(d => d._id !== doc._id));
    } else {
      setSelectedDocs([...selectedDocs, { docType: doc.docType, _id: doc._id }]);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocs.length === 0) {
      return alert("Please select at least one document to download.");
    }
    try {
      setLoading(true);
      await bulkDownloadZip(selectedDocs);
    } catch (err) {
      alert("Bulk download failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete this ${doc.docType} record for ${doc.employeeName}?`)) return;
    try {
      setLoading(true);
      await deleteDocument(doc.docType, doc._id);
      await loadDocs();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = (doc) => {
    const url = `${getApiUrl()}/documents/preview/${encodeURIComponent(doc.docType)}/${doc._id}`;
    setPreviewTitle(`${doc.docType} - ${doc.employeeName} (${doc.refNo})`);
    setPreviewUrl(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-600">
                  <FolderArchive size={26} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Document Vault & Audit Hub</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Filter, inspect, preview and bulk download every generated letter</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDocs}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>

              <button
                onClick={handleBulkDownload}
                disabled={selectedDocs.length === 0 || loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
                  selectedDocs.length > 0 && !loading
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25 active:scale-95"
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                <Download size={18} />
                <span>Bulk Download ({selectedDocs.length})</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Document Type Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Document Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              >
                {DOC_TYPES.map(t => (
                  <option key={t} value={t}>{t === 'ALL' ? 'All Document Types' : t}</option>
                ))}
              </select>
            </div>

            {/* Filter by Registered Employee */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Filter by Employee</label>
              <select
                value={selectedEmployeeEmail}
                onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp.email}>{emp.name} ({emp.email})</option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Search Keywords</label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search by Employee name, email, or reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
                <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Document Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleSelectAll} 
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition"
                >
                  {selectedDocs.length > 0 && selectedDocs.length === documents.length ? (
                    <CheckSquare size={16} className="text-orange-600" />
                  ) : (
                    <Square size={16} className="text-slate-400" />
                  )}
                  Select All
                </button>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-medium text-slate-500">
                  Showing <strong>{documents.length}</strong> matching records
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">Gathering generated records...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-base font-bold text-slate-700">No documents found</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the filters or generating a new letter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="w-12 px-6 py-3.5"></th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Document Type</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Employee Details</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Reference / ID</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Issue Date</th>
                      <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Email Status</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {documents.map((doc) => {
                      const isSelected = selectedDocs.some(d => d._id === doc._id);
                      return (
                        <tr key={`${doc.docType}-${doc._id}`} className={`hover:bg-orange-50/30 transition ${isSelected ? 'bg-orange-50/50' : ''}`}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectDoc(doc)}
                              className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                              <FileText size={12} />
                              {doc.docType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-sm text-slate-900">{doc.employeeName}</div>
                            <div className="text-xs text-slate-500">{doc.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-600">
                            {doc.refNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                            {new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              doc.status === 'Sent' || doc.status === 'Completed' || doc.status === 'Issued'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(doc)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-bold text-slate-700 transition"
                              >
                                <Eye size={14} />
                                View PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(doc)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-700 transition"
                                title="Remove record from vault"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PDF Modal Viewer */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                <span className="font-bold text-sm">{previewTitle}</span>
              </div>
              <button
                onClick={() => setPreviewUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100">
              <iframe
                src={previewUrl}
                title="Document PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}