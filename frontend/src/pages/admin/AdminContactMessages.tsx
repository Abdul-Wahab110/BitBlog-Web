import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Eye,
  Mail,
  Calendar,
  Send,
  Trash2,
  Copy,
  CheckCircle2,
  X,
  MessageSquare,
  ExternalLink,
  Reply,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminContactMessages: React.FC = () => {
  const confirm = useConfirm();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  // Reply Compose Modal State
  const [replyModalMsg, setReplyModalMsg] = useState<any | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await ApiService.getContactMessages();
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openReplyModal = (msg: any) => {
    setReplyModalMsg(msg);
    setReplySubject(`Re: ${msg.subject || 'Editorial Inquiry'}`);
    setReplyBody(`Dear ${msg.name},\n\nThank you for reaching out to BitBlog editorial team.\n\nIn response to your inquiry regarding:\n"${msg.message.slice(0, 120)}${msg.message.length > 120 ? '...' : ''}"\n\n`);
    setCopied(false);
  };

  const handleSendEmailReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalMsg || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await ApiService.replyContactMessage(replyModalMsg.message_id, {
        toEmail: replyModalMsg.email,
        recipientName: replyModalMsg.name,
        subject: replySubject,
        replyMessage: replyBody,
        originalMessage: replyModalMsg.message,
      });

      if (res && res.success) {
        setToastMsg(`🎉 Official reply successfully delivered directly to ${replyModalMsg.email}'s Gmail inbox!`);
        setTimeout(() => setToastMsg(null), 5500);
        setReplyModalMsg(null);
        fetchMessages();
      } else {
        throw new Error(res?.message || 'Failed to deliver email');
      }
    } catch (err: any) {
      console.warn('Backend email dispatch error, falling back to local mailto:', err);
      // Fallback: Copy to clipboard & launch mailto client
      if (navigator.clipboard) {
        navigator.clipboard.writeText(replyBody);
      }
      const mailtoUrl = `mailto:${encodeURIComponent(replyModalMsg.email)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
      window.location.href = mailtoUrl;

      setToastMsg(`Note: ${err.message || 'Email client launched'}. Text copied to clipboard.`);
      setTimeout(() => setToastMsg(null), 5500);
      setReplyModalMsg(null);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCopyReply = () => {
    if (!replyModalMsg) return;
    const fullText = `To: ${replyModalMsg.email}\nSubject: ${replySubject}\n\n${replyBody}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDeleteMessage = async (id: number, senderName: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Contact Message',
      message: `Are you sure you want to delete the message from "${senderName}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      type: 'danger',
    });

    if (!isConfirmed) return;

    try {
      await ApiService.deleteContactMessage(id);
      setToastMsg(`Message from ${senderName} permanently deleted from database.`);
      setTimeout(() => setToastMsg(null), 3000);
      setSelectedMsg(null);
      fetchMessages();
    } catch (err: any) {
      console.error('Failed to delete message:', err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          <Inbox size={22} color="var(--color-secondary)" /> Contact Messages Inbox
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Inquiries and editorial feedback submitted by readers</p>
      </div>

      {toastMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          {toastMsg}
        </div>
      )}

      {loading ? (
        <LoadingState message="Fetching contact inbox messages..." />
      ) : messages.length === 0 ? (
        <EmptyState title="No Contact Messages" description="Your contact inbox is currently empty." />
      ) : (
        <div className="cms-table-wrapper">
          <table className="cms-responsive-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Sender</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subject</th>
                <th style={{ padding: '0.75rem 1rem' }}>Message Snippet</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m.message_id} className="cms-table-row">
                  <td className="cms-td-author" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Sender</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.94rem' }}>{m.name}</div>
                      <a
                        href={`mailto:${m.email}`}
                        style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}
                      >
                        <Mail size={12} /> {m.email}
                      </a>
                    </div>
                  </td>

                  <td className="cms-td-title" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Subject</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                      {m.subject || 'General Inquiry'}
                    </span>
                  </td>

                  <td className="cms-td-title" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Message</span>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-surface)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--color-secondary)',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}
                    >
                      "{m.message}"
                    </div>
                  </td>

                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                    <span className="cms-mobile-label">Date</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      <span>
                        {new Date(m.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="cms-td-actions" style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div className="cms-actions-group">
                      <button
                        type="button"
                        onClick={() => setSelectedMsg(m)}
                        title="View Full Message"
                        className="cms-btn-view"
                      >
                        <Eye size={14} /> <span>Read Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openReplyModal(m)}
                        className="cms-btn-edit"
                        title="Compose and Send Email Reply"
                      >
                        <Reply size={14} /> <span>Reply</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.message_id, m.name)}
                        className="cms-btn-delete"
                        title="Delete message"
                      >
                        <Trash2 size={14} /> <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMsg && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '550px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-xl)', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{selectedMsg.subject || 'Contact Inquiry'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span>From: <strong>{selectedMsg.name}</strong></span>
              <a href={`mailto:${selectedMsg.email}`} style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                ({selectedMsg.email})
              </a>
            </p>
            <div style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap', maxHeight: '350px', overflowY: 'auto' }}>
              {selectedMsg.message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const m = selectedMsg;
                  setSelectedMsg(null);
                  openReplyModal(m);
                }}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Reply size={14} /> Reply to {selectedMsg.name}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMsg(null)}
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '0.5rem 1.35rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose & Send Reply Modal */}
      {replyModalMsg && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '580px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-xl)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Reply size={18} color="var(--color-secondary)" /> Reply to Reader
              </h3>
              <button
                type="button"
                onClick={() => setReplyModalMsg(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendEmailReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                  RECIPIENT
                </label>
                <div style={{ padding: '0.55rem 0.85rem', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {replyModalMsg.name} <span style={{ color: 'var(--color-secondary)' }}>&lt;{replyModalMsg.email}&gt;</span>
                </div>
              </div>

              <div>
                <label htmlFor="reply-subject" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                  EMAIL SUBJECT
                </label>
                <input
                  id="reply-subject"
                  type="text"
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.55rem 0.85rem', fontSize: '0.88rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label htmlFor="reply-body" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                  YOUR RESPONSE
                </label>
                <textarea
                  id="reply-body"
                  rows={7}
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  required
                  placeholder="Type your official editorial reply here..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', lineHeight: 1.5, boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleCopyReply}
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    color: copied ? 'var(--color-success)' : 'var(--color-text)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {copied ? <CheckCircle2 size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied Full Reply!' : 'Copy Reply Text'}</span>
                </button>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setReplyModalMsg(null)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      padding: '0.5rem 1.1rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={sendingReply}
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.55rem 1.45rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: sendingReply ? 'not-allowed' : 'pointer',
                      opacity: sendingReply ? 0.75 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <Send size={14} className={sendingReply ? 'animate-spin' : ''} />
                    <span>{sendingReply ? 'Delivering to Gmail...' : 'Send Direct to Gmail'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
