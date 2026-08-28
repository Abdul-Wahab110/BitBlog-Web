import React, { useState, useEffect } from 'react';
import { Inbox, Eye, Trash2 } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';

export const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  useEffect(() => {
    ApiService.getContactMessages()
      .then(res => {
        if (res && res.data) setMessages(res.data);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Inbox size={22} color="var(--color-secondary)" /> Contact Messages Inbox
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Inquiries and editorial feedback submitted by readers</p>
      </div>

      {loading ? (
        <LoadingState message="Fetching contact inbox messages..." />
      ) : messages.length === 0 ? (
        <EmptyState title="No Contact Messages" description="Your contact inbox is currently empty." />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
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
                <tr key={m.message_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{m.name} ({m.email})</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{m.subject || 'General Inquiry'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>{m.message}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => setSelectedMsg(m)} title="View Full Message" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-secondary)' }}>
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-overlay)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '550px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{selectedMsg.subject || 'Contact Inquiry'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              From: {selectedMsg.name} ({selectedMsg.email})
            </p>
            <div style={{ backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {selectedMsg.message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedMsg(null)} style={{ backgroundColor: 'var(--color-primary)', color: '#FFF', padding: '0.45rem 1rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
