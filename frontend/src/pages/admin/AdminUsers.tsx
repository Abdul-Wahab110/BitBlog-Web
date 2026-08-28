import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Loader2,
  Edit,
  Upload,
  Save,
  Globe,
  Tag,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();
  const isAdmin = currentUser?.role === 'Admin';

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Editor' | 'Author' | 'User'>('User');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [editWebsite, setEditWebsite] = useState('');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editAuthorTags, setEditAuthorTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // New User Form Fields
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Editor' | 'Author' | 'User'>('User');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');

  const isSystemAdmin = (u: any) => {
    if (!u) return false;
    return (
      u.username === 'admin' ||
      u.email === 'admin@bitblog.com' ||
      u.user_id === 1 ||
      (u.name && u.name.toLowerCase() === 'system administrator')
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminUsers();
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUser: any, newRole: string) => {
    if (!isAdmin) {
      alert('Access Denied: Only System Administrator can modify user roles.');
      return;
    }
    if (isSystemAdmin(targetUser)) {
      alert('Protected Role: System Administrator (Website Owner) role cannot be modified.');
      return;
    }
    try {
      await ApiService.updateUserRole(targetUser.user_id, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (targetUser: any) => {
    if (!isAdmin) {
      alert('Access Denied: Only System Administrator can modify user status.');
      return;
    }
    if (isSystemAdmin(targetUser)) {
      alert('Protected Status: System Administrator (Website Owner) status cannot be suspended.');
      return;
    }
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await ApiService.updateUserStatus(targetUser.user_id, nextStatus);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string, targetUser: any) => {
    if (!isAdmin) {
      alert('Access Denied: Only System Administrator can delete user accounts.');
      return;
    }
    if (isSystemAdmin(targetUser)) {
      alert('Protected Account: System Administrator (Website Owner) cannot be deleted.');
      return;
    }
    const isConfirmed = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user '${userName}'? This action cannot be undone.`,
      confirmText: 'Yes, Delete User',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await ApiService.deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!isAdmin) {
      setCreateError('Access Denied: Only System Administrator can create new accounts.');
      return;
    }

    if (!newName.trim() || !newUsername.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('Please complete all required fields.');
      return;
    }

    if (newPassword.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    setCreating(true);

    try {
      const payload = {
        name: newName.trim(),
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        status: newStatus,
      };

      const res = await ApiService.createAdminUser(payload);
      if (res && res.success) {
        setCreateSuccess(`Account for '${newName}' created successfully with role ${newRole}!`);
        // Reset form
        setNewName('');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewConfirmPassword('');
        setNewRole('User');
        setNewStatus('ACTIVE');

        await fetchUsers();

        setTimeout(() => {
          setCreateModalOpen(false);
          setCreateSuccess(null);
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed to create user account');
      }
    } catch (err: any) {
      setCreateError(err.message || 'An error occurred while creating user');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (u: any) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditBio(u.bio || '');
    setEditProfileImage(u.profile_image || '');
    setEditRole(u.role || 'User');
    setEditStatus(u.status || 'ACTIVE');
    setEditWebsite(u.website || '');
    setEditShortDescription(u.short_description || '');
    setEditAuthorTags(u.author_tags || []);
    setEditTagInput('');
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditPassword('');
    setEditModalOpen(true);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Supported: JPG, PNG, WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit.');
      return;
    }
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleSaveEditedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);

    try {
      let finalAvatar = editProfileImage;
      if (editImageFile) {
        const uploadRes = await ApiService.uploadAvatar(editImageFile);
        if (uploadRes && uploadRes.success && uploadRes.data) {
          finalAvatar = uploadRes.data.profile_image || uploadRes.data.url;
        }
      }

      // Update Profile Details (Including optional password reset)
      await ApiService.updateAdminUserProfile(editingUser.user_id, {
        name: editName.trim(),
        bio: editBio.trim(),
        profile_image: finalAvatar,
        website: editWebsite.trim(),
        short_description: editShortDescription.trim(),
        author_tags: editAuthorTags,
        password: editPassword.trim() ? editPassword.trim() : undefined,
      });

      // Update Role & Status if Admin and not system admin
      if (isAdmin && !isSystemAdmin(editingUser)) {
        if (editRole !== editingUser.role) {
          await ApiService.updateUserRole(editingUser.user_id, editRole);
        }
        if (editStatus !== editingUser.status) {
          await ApiService.updateUserStatus(editingUser.user_id, editStatus);
        }
      }

      await fetchUsers();
      setEditModalOpen(false);
      setActionMessage({ text: `User '${editName}' profile and details updated successfully!`, type: 'success' });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to update user profile', type: 'error' });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            User Management & RBAC Roles
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Manage system accounts, create administrative accounts, assign roles, and control access permissions
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setCreateSuccess(null);
              setCreateModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            <PlusCircle size={16} /> Create New Account
          </button>
        )}
      </div>

      {actionMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${actionMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            borderRadius: 'var(--radius-md)',
            color: actionMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--color-card)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--color-muted)" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name, username, or email..."
            style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Filter Role:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Author">Author</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingState message="Fetching system user records from Oracle DB..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No Users Found" description="No user records match your query." />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>User</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assigned Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Articles</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const targetIsSystemAdmin = isSystemAdmin(user);
                return (
                  <tr key={user.user_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <UserAvatar
                          src={user.profile_image}
                          name={user.name}
                          size={34}
                        />
                        <div>
                          <span>{user.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isAdmin && !targetIsSystemAdmin ? (
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user, e.target.value)}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Author">Author</option>
                          <option value="User">User</option>
                        </select>
                      ) : (
                        <span
                          style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: user.role === 'Admin' ? 'rgba(139, 92, 246, 0.15)' : 'var(--color-surface-alt)',
                            color: user.role === 'Admin' ? '#8b5cf6' : 'var(--color-text-secondary)',
                            border: `1px solid ${user.role === 'Admin' ? 'rgba(139, 92, 246, 0.3)' : 'var(--color-border)'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          {user.role === 'Admin' && <Shield size={12} />}
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{user.post_count || 0}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isAdmin && !targetIsSystemAdmin ? (
                        <button
                          onClick={() => handleStatusToggle(user)}
                          style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: user.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)',
                          }}
                        >
                          {user.status}
                        </button>
                      ) : (
                        <span
                          style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: user.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)',
                            display: 'inline-block',
                          }}
                        >
                          {user.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          title="Edit User Profile & Role"
                          style={{
                            padding: '0.3rem 0.6rem',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit size={13} /> Edit
                        </button>

                        {targetIsSystemAdmin ? (
                          <span
                            title="Protected System Administrator & Website Owner"
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--color-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.15rem 0.35rem',
                            }}
                          >
                            <Lock size={12} color="var(--color-secondary)" />
                          </span>
                        ) : isAdmin && currentUser?.user_id !== user.user_id ? (
                          <button
                            onClick={() => handleDeleteUser(user.user_id, user.name, user)}
                            title="Delete User"
                            style={{
                              padding: '0.35rem',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-danger)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Create User Modal */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create User Modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 12, 28, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setCreateModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-surface-alt)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield size={20} color="var(--color-secondary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  Create User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'transparent', padding: '0.35rem', color: 'var(--color-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {createError && (
                <div
                  role="alert"
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-danger)',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div
                  role="status"
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid var(--color-success)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-success)',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{createSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateUserSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="johndoe"
                      required
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Role Assignment *
                    </label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as any)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                      <option value="User">User (Reader)</option>
                      <option value="Author">Author (Writer)</option>
                      <option value="Editor">Editor (Moderator)</option>
                      <option value="Admin">Admin (Full Control)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={newConfirmPassword}
                      onChange={e => setNewConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Account Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    padding: '0.65rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 2px 8px var(--color-secondary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <PlusCircle size={16} />}
                  <span>{creating ? 'Creating User...' : `Create ${newRole} Account`}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit User Profile Modal */}
      {editModalOpen && editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit User Profile Modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 12, 28, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setEditModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-surface-alt)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Edit size={18} color="var(--color-secondary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Edit Profile: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSaveEditedUser}>
                {/* Profile Image & Avatar Upload Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <UserAvatar
                    src={editImagePreview || editProfileImage}
                    name={editName || editingUser.name}
                    size={64}
                  />

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Profile Image / Avatar
                    </label>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={handleEditFileSelect}
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        <Upload size={13} /> Choose New Photo
                      </button>
                      {(editProfileImage || editImagePreview) && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditProfileImage('');
                            setEditImagePreview(null);
                            setEditImageFile(null);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.8rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-danger)',
                            color: 'var(--color-danger)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.35rem', display: 'block' }}>
                      JPG, PNG, or WEBP (Max 5 MB)
                    </span>
                  </div>
                </div>

                {/* Name & Username */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Username (Read Only)
                    </label>
                    <input
                      type="text"
                      value={editingUser.username}
                      disabled
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem', opacity: 0.65, backgroundColor: 'var(--color-surface-alt)' }}
                    />
                  </div>
                </div>

                {/* Role & Status (Editable for Admin) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Assigned Role
                    </label>
                    <select
                      value={editRole}
                      disabled={!isAdmin || isSystemAdmin(editingUser)}
                      onChange={e => setEditRole(e.target.value as any)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Author">Author</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Account Status
                    </label>
                    <select
                      value={editStatus}
                      disabled={!isAdmin || isSystemAdmin(editingUser)}
                      onChange={e => setEditStatus(e.target.value as any)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                {/* Password Reset Option for Admin */}
                <div style={{ marginBottom: '1rem', backgroundColor: 'var(--color-surface-alt)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '0.3rem', color: 'var(--color-secondary)' }}>
                    Reset User Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Leave empty to keep existing password, or enter new password (min 6 chars)..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.86rem' }}
                  />
                  <span style={{ fontSize: '0.73rem', color: 'var(--color-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Tip: Enter a new password here only if you want to override/reset this user's password.
                  </span>
                </div>

                {/* Professional Tagline / Headline */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Headline / Short Description
                  </label>
                  <input
                    type="text"
                    value={editShortDescription}
                    onChange={e => setEditShortDescription(e.target.value)}
                    placeholder="e.g. Senior Tech Columnist & Cloud Architect"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Biography */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Author Biography
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Write a brief biographical profile..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Author Tags / Expertise */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Author Expertise Tags
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={editTagInput}
                      onChange={e => setEditTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (editTagInput.trim() && !editAuthorTags.includes(editTagInput.trim())) {
                            setEditAuthorTags([...editAuthorTags, editTagInput.trim()]);
                            setEditTagInput('');
                          }
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editTagInput.trim() && !editAuthorTags.includes(editTagInput.trim())) {
                          setEditAuthorTags([...editAuthorTags, editTagInput.trim()]);
                          setEditTagInput('');
                        }
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Add Tag
                    </button>
                  </div>
                  {editAuthorTags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {editAuthorTags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            backgroundColor: 'var(--color-surface-alt)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setEditAuthorTags(editAuthorTags.filter(t => t !== tag))}
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-muted)' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Website */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={e => setEditWebsite(e.target.value)}
                    placeholder="https://example.com"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      color: '#FFFFFF',
                      padding: '0.6rem 1.4rem',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 2px 8px var(--color-secondary-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                    }}
                  >
                    {savingEdit ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                    <span>{savingEdit ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
