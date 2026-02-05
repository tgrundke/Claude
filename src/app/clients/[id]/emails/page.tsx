"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEmails } from "@/hooks/use-emails";
import { useClients } from "@/hooks/use-clients";
import { useDeployment } from "@/hooks/use-deployment";
import { defaultEmailTemplates } from "@/data/email-templates";
import { renderEmailTemplate } from "@/lib/email-engine";
import { EMAIL_STATUS_COLORS } from "@/types/email";
import type { EmailStatus } from "@/types/email";
import { cn } from "@/lib/utils";

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function EmailsPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { emails, addEmail, updateEmail, deleteEmail, updateStatus, sendAllReady } = useEmails(clientId);
  const { getClient } = useClients();
  const { items: deploymentItems } = useDeployment(clientId);
  const client = getClient(clientId);

  const [showCompose, setShowCompose] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showGoConfirm, setShowGoConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<EmailStatus>("draft");

  const resetForm = () => {
    setTo("");
    setCc("");
    setSubject("");
    setBody("");
    setStatus("draft");
    setShowCompose(false);
    setEditingId(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!client) return;
    const template = defaultEmailTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const rendered = renderEmailTemplate(template, client, deploymentItems);
    setSubject(rendered.subject);
    setBody(rendered.body);

    // Auto-fill recipient
    if (template.type === "outgoing_provider_notification") {
      setTo(client.currentProvider.contactEmail);
    } else {
      setTo(client.primaryContact.email);
    }
  };

  const handleSave = () => {
    if (editingId) {
      updateEmail(editingId, { to, cc, bcc: "", subject, body, status });
    } else {
      addEmail({
        templateId: null,
        to,
        cc,
        bcc: "",
        subject,
        body,
        status,
        linkedDeploymentItemId: null,
        scheduledSendDate: null,
        sentAt: null,
      });
    }
    resetForm();
  };

  const startEdit = (emailId: string) => {
    const email = emails.find((e) => e.id === emailId);
    if (!email) return;
    setEditingId(emailId);
    setTo(email.to);
    setCc(email.cc);
    setSubject(email.subject);
    setBody(email.body);
    setStatus(email.status);
    setShowCompose(true);
  };

  const handleGo = async () => {
    setSending(true);
    // Mark all drafts as ready first
    const readyEmails = emails.filter((e) => e.status === "draft" || e.status === "ready");
    for (const email of readyEmails) {
      if (email.status === "draft") {
        updateStatus(email.id, "ready");
      }
    }

    // Simulate sending
    let count = 0;
    for (const email of readyEmails) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateStatus(email.id, "sent");
      count++;
      setSentCount(count);
    }
    setSending(false);
    setShowGoConfirm(false);
  };

  const readyCount = emails.filter((e) => e.status === "draft" || e.status === "ready").length;
  const sentEmailCount = emails.filter((e) => e.status === "sent").length;

  return (
    <div>
      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Email sending is simulated in this version. In production, this will connect to your email provider (SMTP/API).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
          <p className="text-xs text-gray-500">Total Emails</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{readyCount}</p>
          <p className="text-xs text-gray-500">Pending / Ready</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{sentEmailCount}</p>
          <p className="text-xs text-gray-500">Sent</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { resetForm(); setShowCompose(true); }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Compose Email
            </button>
            {readyCount > 0 && (
              <button
                onClick={() => setShowGoConfirm(true)}
                className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-lg transition-all hover:shadow-xl"
              >
                GO - Send All ({readyCount})
              </button>
            )}
          </div>
        </div>

        {/* GO Confirmation */}
        {showGoConfirm && (
          <div className="p-6 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-bold text-green-800 mb-3">Ready to Send?</h3>
            {sending ? (
              <div>
                <p className="text-sm text-green-700 mb-3">Sending emails... {sentCount} / {readyCount}</p>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${readyCount > 0 ? (sentCount / readyCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-green-700 mb-3">The following {readyCount} email(s) will be sent:</p>
                <ul className="space-y-2 mb-4">
                  {emails
                    .filter((e) => e.status === "draft" || e.status === "ready")
                    .map((e) => (
                      <li key={e.id} className="text-sm text-green-800">
                        <strong>To:</strong> {e.to} - <strong>Subject:</strong> {e.subject}
                      </li>
                    ))}
                </ul>
                <div className="flex gap-3">
                  <button
                    onClick={handleGo}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
                  >
                    Confirm & Send All
                  </button>
                  <button
                    onClick={() => setShowGoConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Compose Form */}
        {showCompose && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              {editingId ? "Edit Email" : "Compose New Email"}
            </h3>

            {/* Template Selector */}
            {!editingId && (
              <div className="mb-4">
                <label className={labelCls}>Start from Template</label>
                <select
                  className={inputCls}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select a template...</option>
                  {defaultEmailTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>To *</label>
                  <input className={inputCls} type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
                </div>
                <div>
                  <label className={labelCls}>CC</label>
                  <input className={inputCls} value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Subject *</label>
                <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Body</label>
                <textarea className={inputCls} rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as EmailStatus)}>
                  <option value="draft">Draft</option>
                  <option value="ready">Ready to Send</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                {editingId ? "Update" : "Save Email"}
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="p-6 border-b border-gray-200 bg-white">
            {(() => {
              const email = emails.find((e) => e.id === showPreview);
              if (!email) return null;
              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Email Preview</h3>
                    <button onClick={() => setShowPreview(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>To:</strong> {email.to}</p>
                    {email.cc && <p className="text-sm"><strong>CC:</strong> {email.cc}</p>}
                    <p className="text-sm"><strong>Subject:</strong> {email.subject}</p>
                    <hr className="my-2" />
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{email.body}</pre>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Email List */}
        <div className="p-4">
          {emails.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-2">No emails yet.</p>
              <p className="text-xs text-gray-400">Compose an email or use a template to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {emails.map((email) => (
                <div key={email.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", EMAIL_STATUS_COLORS[email.status])}>
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{email.subject || "(No subject)"}</p>
                    <p className="text-xs text-gray-500">To: {email.to}</p>
                    {email.sentAt && <p className="text-xs text-gray-400">Sent: {new Date(email.sentAt).toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setShowPreview(email.id)} className="text-xs text-gray-600 hover:text-gray-800">Preview</button>
                    {email.status !== "sent" && (
                      <>
                        <button onClick={() => startEdit(email.id)} className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={() => deleteEmail(email.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
