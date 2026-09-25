import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getApiUrl } from '../utils/serverBase';

export default function DocumentPreview({ type, id, onClose, onSend, busy = false, archived = false }) {
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let url;
    api.get(`${getApiUrl()}/documents/${archived ? "preview" : "source"}/${encodeURIComponent(type)}/${id}`, {
      responseType: 'blob', signal: controller.signal,
    }).then(response => {
      url = URL.createObjectURL(response.data);
      setPdf({url, snapshotId: response.headers['x-document-id']});
    }).catch(async error => {
      if (controller.signal.aborted) return;
      let message = 'Unable to load PDF';
      try { message = JSON.parse(await error.response.data.text()).message || message; } catch { /* fallback */ }
      setError(message);
    });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [type, id, archived]);
  return <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={`${type} PDF preview`}>
    <div className="bg-white text-black rounded-xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden">
      <div className="p-4 border-b flex justify-between gap-4 items-center"><div><h2 className="font-bold text-lg">{type} — PDF preview</h2><p className="text-sm">This stored PDF is used for download, email attachment and the audit hub.</p></div><button type="button" onClick={onClose} className="border rounded px-3 py-2">Close</button></div>
      {error ? <p role="alert" className="p-6">{error}</p> : pdf ? <iframe title={`${type} PDF`} src={pdf.url} className="flex-1 w-full bg-white"/> : <p role="status" className="p-6">Preparing PDF…</p>}
      <div className="p-4 border-t flex gap-3">
        {pdf && <a href={pdf.url} download={`${type.replaceAll(' ','_')}.pdf`} className="border border-black rounded px-4 py-2">Download PDF</a>}
        {pdf && onSend && <button disabled={busy} type="button" onClick={()=>onSend(pdf.snapshotId)} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">{busy?'Sending…':'Email this PDF'}</button>}
      </div>
    </div>
  </div>;
}
