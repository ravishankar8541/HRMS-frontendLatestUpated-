import { Link, useLocation } from 'react-router-dom';

export default function VaultEditNotice() {
  const { state } = useLocation();
  if (!state?.vaultDocument) return null;
  return <div className="no-print mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
    Editing a copy of the saved document. Save or generate to create a revised version; the original PDF stays in the vault.
    <Link to="/documents" className="ml-3 font-semibold underline">Back to Document Vault</Link>
  </div>;
}
