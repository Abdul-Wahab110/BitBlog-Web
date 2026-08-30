import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Tag,
  Shield,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ApiService } from '../../services/api';
import { UserAvatar } from '../../components/common/UserAvatar';
import { SeoHead } from '../../components/common/SeoHead';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  // Active Tab: 'profile' | 'security'
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Fields State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [shortDescription, setShortDescription] = useState(user?.short_description || '');
  const [profileImage, setProfileImage] = useState<string>(user?.profile_image || user?.profileImage || '');
  const [authorTags, setAuthorTags] = useState<string[]>(user?.author_tags || []);
  const [tagInput, setTagInput] = useState('');

  // Social Links
  const [socialLinks, setSocialLinks] = useState<{
    twitter?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  }>(user?.social_links || {});

  // Direct Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Status Alerts
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load latest full profile from backend on mount
  useEffect(() => {
    ApiService.getUserProfile()
      .then(res => {
        if (res && res.data) {
          const u = res.data;
          setName(u.name || '');
          setBio(u.bio || '');
          setWebsite(u.website || '');
          setShortDescription(u.short_description || '');
          setProfileImage(u.profile_image || '');
          if (u.author_tags && Array.isArray(u.author_tags)) {
            setAuthorTags(u.author_tags);
          }
          if (u.social_links) {
            setSocialLinks(u.social_links);
          }
          updateUser({
            name: u.name,
            bio: u.bio,
            profile_image: u.profile_image,
            website: u.website,
            author_tags: u.author_tags,
            social_links: u.social_links,
            short_description: u.short_description,
          });
        }
      })
      .catch(() => { });
  }, []);

  // Handle direct file selection & client-side validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Supported formats: JPG, PNG, WEBP.');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit.`);
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  // Upload image to server immediately or upon save
  const handleUploadImageNow = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const res = await ApiService.uploadAvatar(imageFile);
      if (res && res.success && res.data) {
        const uploadedUrl = res.data.profile_image || res.data.url;
        setProfileImage(uploadedUrl);
        setImagePreview(null);
        setImageFile(null);
        updateUser({ profile_image: uploadedUrl });
        setSuccessMsg('Profile image uploaded and synced successfully!');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        throw new Error(res?.message || 'Failed to upload profile image');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading profile image to server');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setProfileImage('');
  };

  // Add / Remove Author Tags
  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !authorTags.includes(clean)) {
      setAuthorTags([...authorTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAuthorTags(authorTags.filter(t => t !== tagToRemove));
  };

  // Save General Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = profileImage;

      // If user selected a new file but didn't click upload button separately, upload it first
      if (imageFile) {
        const uploadRes = await ApiService.uploadAvatar(imageFile);
        if (uploadRes && uploadRes.success && uploadRes.data) {
          finalImageUrl = uploadRes.data.profile_image || uploadRes.data.url;
          setProfileImage(finalImageUrl);
          setImageFile(null);
          setImagePreview(null);
        }
      }

      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        profile_image: finalImageUrl,
        website: website.trim(),
        short_description: shortDescription.trim(),
        author_tags: authorTags,
        social_links: socialLinks,
      };

      const res = await ApiService.updateUserProfile(payload);
      if (res && res.success) {
        updateUser({
          name: name.trim(),
          bio: bio.trim(),
          profile_image: finalImageUrl,
          website: website.trim(),
          short_description: shortDescription.trim(),
          author_tags: authorTags,
          social_links: socialLinks,
        });
        setSuccessMsg('Your profile has been saved successfully!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(res?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving your profile');
    } finally {
      setSaving(false);
    }
  };

  // Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Please provide your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setChangingPass(true);

    try {
      const res = await ApiService.updateUserPassword({
        currentPassword,
        newPassword,
      });

      if (res && res.success) {
        setSuccessMsg('Your password has been changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(res?.message || 'Failed to update password');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating password. Please check your current password.');
    } finally {
      setChangingPass(false);
    }
  };

  const displayAvatar = imagePreview || profileImage;

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '3rem' }}>
      <SeoHead
        title={`Personal Profile & Account | ${siteName}`}
        description="Manage your profile image, biography, social links, author tags, and account security."
        robots="noindex, nofollow"
      />

      {/* Header Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.6rem',
              marginBottom: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <User size={22} color="var(--color-secondary)" /> Account & Profile Settings
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Manage your personal identity, avatar image, author credentials, and login security
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface-alt)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            width: '100%',
            maxWidth: '380px',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: activeTab === 'profile' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={14} /> <span>Profile & Identity</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: activeTab === 'security' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'security' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'security' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Lock size={14} /> <span>Password & Security</span>
          </button>
        </div>
      </header>

      {/* Global Status Alerts */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile}>
          {/* Main Grid: Avatar Card + Profile Details Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Left Column: Profile Picture & Avatar Uploader */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Profile Picture</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                Displayed across stories, editorial bylines, and discussion comments
              </p>

              {/* Large Avatar Preview with Clean Initials Fallback */}
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <UserAvatar
                  src={displayAvatar}
                  name={name || user?.name || 'User'}
                  size={120}
                  showOnline={true}
                  style={{
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '3px solid var(--color-secondary)',
                  }}
                />
              </div>

              {/* Image Information Badge */}
              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    backgroundColor: 'var(--color-surface-alt)',
                    color: 'var(--color-text-secondary)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {displayAvatar ? 'Custom Image Active' : 'Generated Initials Fallback'}
                </span>
              </div>

              {/* Upload & Management Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '280px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px var(--color-secondary-glow)',
                  }}
                >
                  <Upload size={15} /> Choose Photo (JPG/PNG/WEBP)
                </button>

                {imageFile && (
                  <button
                    type="button"
                    onClick={handleUploadImageNow}
                    disabled={uploadingImage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1rem',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Save Chosen Image Now
                      </>
                    )}
                  </button>
                )}

                {displayAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--color-danger)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} /> Remove Photo (Use Initials)
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '1rem' }}>
                Direct file upload supported. Maximum file size: 5 MB.
              </p>
            </div>

            {/* Right Column: Identity & Contact Fields */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.15rem',
                boxSizing: 'border-box',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.1rem' }}>Account Identity</h2>

              {/* Full Name */}
              <div>
                <label htmlFor="profile-fullname" style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Full Name *
                </label>
                <input
                  id="profile-fullname"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              {/* Username (Locked) */}
              <div>
                <label
                  htmlFor="profile-username"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}
                >
                  <span>Username</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    <Shield size={11} style={{ display: 'inline', marginRight: '2px' }} /> Permanent handle
                  </span>
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={user?.username || ''}
                  disabled
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', opacity: 0.7, cursor: 'not-allowed', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              {/* Email Address (Locked) */}
              <div>
                <label
                  htmlFor="profile-email"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}
                >
                  <span>Email Address</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    <Shield size={11} style={{ display: 'inline', marginRight: '2px' }} /> Primary login
                  </span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', opacity: 0.7, cursor: 'not-allowed', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              {/* Role & Account Level (Locked) */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Assigned Platform Role
                </label>
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>{user?.role || 'User'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Role managed by Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Bio & Author Settings Card */}
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.1rem' }}>Biography & Author Profile</h2>

            {/* Short Tagline / Description */}
            <div>
              <label htmlFor="profile-tagline" style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Professional Tagline / Headline
              </label>
              <input
                id="profile-tagline"
                type="text"
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder={`e.g. Senior Cloud Architect & Tech Columnist at ${siteName}`}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Extended Biography */}
            <div>
              <label htmlFor="profile-bio" style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                About You / Full Biography
              </label>
              <textarea
                id="profile-bio"
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share your background, areas of expertise, journalistic mission, and recent achievements..."
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', lineHeight: '1.5', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Author Tags / Topics of Interest */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} /> Author Topics & Expertise Tags
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type topic tag and press Enter..."
                  style={{ flex: 1, minWidth: '200px', padding: '0.55rem 0.75rem', fontSize: '0.85rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFF',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Add Tag
                </button>
              </div>

              {authorTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {authorTags.map(t => (
                    <span
                      key={t}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        backgroundColor: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-secondary)',
                        color: 'var(--color-secondary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-danger)',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Website & Social Links Grid */}
            <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Public Website & Social Channels</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {/* Website */}
                <div>
                  <label htmlFor="social-website" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <Globe size={14} color="var(--color-secondary)" /> Personal Website / Portfolio
                  </label>
                  <input
                    id="social-website"
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                {/* Twitter / X */}
                <div>
                  <label htmlFor="social-twitter" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <Twitter size={14} color="#1DA1F2" /> Twitter / X Profile
                  </label>
                  <input
                    id="social-twitter"
                    type="text"
                    value={socialLinks.twitter || ''}
                    onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://x.com/username or @username"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label htmlFor="social-github" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <Github size={14} /> GitHub Profile
                  </label>
                  <input
                    id="social-github"
                    type="text"
                    value={socialLinks.github || ''}
                    onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="https://github.com/username"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="social-linkedin" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <Linkedin size={14} color="#0A66C2" /> LinkedIn Profile
                  </label>
                  <input
                    id="social-linkedin"
                    type="text"
                    value={socialLinks.linkedin || ''}
                    onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              <KeyRound size={16} color="var(--color-secondary)" /> <span>Change Password</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem 2rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px var(--color-secondary-glow)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Password & Security Tab */
        <form onSubmit={handleSavePassword}>
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '580px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <KeyRound size={20} color="var(--color-secondary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Change Account Password</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Ensure your account uses a secure password of at least 6 characters.
            </p>

            {/* Current Password */}
            <div>
              <label htmlFor="current-pass" style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Current Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="current-pass"
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  required
                  style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-pass" style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-pass"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters..."
                  required
                  style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-pass" style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Confirm New Password *
              </label>
              <input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password..."
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={changingPass}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.65rem 1.75rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px var(--color-secondary-glow)',
                }}
              >
                {changingPass ? (
                  <>
                    <Loader2 size={15} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound size={15} /> Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
