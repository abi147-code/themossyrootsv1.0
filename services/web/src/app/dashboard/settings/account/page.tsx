'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, resolveAssetUrl } from '@/lib/api';

type AccountResponse = {
  name: string | null;
  email: string;
  avatarUrl?: string | null;
};

type ToastState =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

async function fetchAccountProfile(token: string, signal?: AbortSignal): Promise<AccountResponse> {
  const response = await apiFetch('/api/account', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as AccountResponse & { message?: string };

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to load account details.');
  }

  return {
    ...payload,
    avatarUrl: resolveAssetUrl(payload.avatarUrl) ?? null,
  };
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { token, loading, refresh, user, logout } = useAuth();

  const [formName, setFormName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetAvatarSelection = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, []);

  const applyAccountState = useCallback((payload: AccountResponse) => {
    setFormName(payload.name ?? '');
    setEmail(payload.email);
    setAvatarUrl(resolveAssetUrl(payload.avatarUrl) ?? null);
  }, []);

  useEffect(() => {
    if (!token || loading) {
      return;
    }

    const controller = new AbortController();
    setInitializing(true);
    setProfileError(null);

    fetchAccountProfile(token, controller.signal)
      .then((payload) => {
        applyAccountState(payload);
        resetAvatarSelection();
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('[Settings] Account fetch failed', error);
        setProfileError(error instanceof Error ? error.message : 'Unable to load account details.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setInitializing(false);
        }
      });

    return () => controller.abort();
  }, [token, loading, applyAccountState, resetAvatarSelection]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(
    () => () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarPreview]
  );

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });

    if (!file) {
      setAvatarFile(null);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    const trimmedName = formName.trim();
    if (!trimmedName) {
      setProfileError('Your full name is required.');
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError(null);

      const formData = new FormData();
      formData.append('name', trimmedName);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatarUrl) {
        formData.append('avatarPath', avatarUrl);
      }

      const response = await apiFetch('/api/account', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        user?: {
          name?: string | null;
          email: string;
          avatarUrl?: string | null;
        };
      };

      if (!response.ok) {
        throw new Error(result?.message || 'Failed to save account settings.');
      }

      if (result.user) {
        applyAccountState({
          name: result.user.name ?? null,
          email: result.user.email,
          avatarUrl: resolveAssetUrl(result.user.avatarUrl) ?? null,
        });
      }

      resetAvatarSelection();
      setToast({ type: 'success', message: result.message || 'Account updated successfully.' });
      await refresh();
    } catch (err) {
      console.error('[Settings] Account update failed', err);
      const message = err instanceof Error ? err.message : 'Failed to save account settings.';
      setProfileError(message);
      setToast({ type: 'error', message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation must match.');
      return;
    }

    try {
      setPasswordSaving(true);
      const response = await apiFetch('/api/account/password', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to update password.');
      }

      setToast({ type: 'success', message: payload.message || 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('[Settings] Password update failed', err);
      const message = err instanceof Error ? err.message : 'Failed to update password.';
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Current password is required.');
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await apiFetch('/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: deletePassword,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to delete account.');
      }

      logout();
      router.replace('/login');
    } catch (err) {
      console.error('[Settings] Account deletion failed', err);
      const message = err instanceof Error ? err.message : 'Failed to delete account.';
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const initials = useMemo(() => {
    const source = formName || email || user?.email || '';
    return source ? source.charAt(0).toUpperCase() : 'U';
  }, [formName, email, user?.email]);

  const displayAvatar = avatarPreview || avatarUrl || null;

  const isPasswordButtonDisabled =
    passwordSaving || !currentPassword || !newPassword || !confirmPassword;

  if (loading || !token) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-8 text-slate-900">
      {toast ? (
        <div
          className={`pointer-events-none fixed left-1/2 top-6 z-30 -translate-x-1/2 transform rounded-2xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <Link
        href="/dashboard/settings"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:text-emerald-500"
      >
        &larr; Back to Settings
      </Link>

      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-700/80">Account</p>
        <h1 className="text-3xl font-semibold text-slate-900">Profile details</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Keep your contact details and avatar up to date. These values are shared across invoices, emails, and future
          brand assets.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-50">
        {initializing ? (
          <p className="text-sm text-slate-600">Loading your account details...</p>
        ) : (
          <form className="space-y-8" onSubmit={handleProfileSubmit}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 flex-shrink-0">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Account avatar"
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-3xl font-semibold text-slate-700">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Avatar
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800 transition hover:bg-emerald-200"
                  >
                    Upload image
                  </button>
                  {avatarFile ? (
                    <span className="text-xs text-slate-500">
                      Selected: <span className="text-slate-700">{avatarFile.name}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">PNG, JPG, GIF or WEBP up to 5 MB.</span>
                  )}
                  {avatarFile ? (
                    <button
                      type="button"
                      onClick={resetAvatarSelection}
                      className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500 transition hover:text-rose-400"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  placeholder="Jordan Moss"
                  value={formName}
                  onChange={(event) => {
                    if (profileError) setProfileError(null);
                    setFormName(event.target.value);
                  }}
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  readOnly
                  className="mt-3 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                />
              </div>
            </div>

            {profileError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {profileError}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-200"
              >
                {profileSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-50">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700/80">Password</p>
          <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
          <p className="text-sm text-slate-600">
            Update your password with a secure combination. You&apos;ll stay signed in after the change.
          </p>
        </header>

        <form className="mt-6 space-y-6" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label
                className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                htmlFor="currentPassword"
              >
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label
                className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                htmlFor="newPassword"
              >
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label
                className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                required
              />
            </div>
          </div>

          {passwordError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {passwordError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPasswordButtonDisabled}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              {passwordSaving ? 'Updating...' : 'Change password'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-lg shadow-rose-100">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-600/80">Danger zone</p>
          <h2 className="text-lg font-semibold text-rose-800">Delete account</h2>
          <p className="text-sm text-rose-700">
            Permanently remove your CRM data. This action cannot be undone and will log you out immediately.
          </p>
        </header>

        {!deleteOpen ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(true);
                setDeleteError(null);
              }}
              className="rounded-xl border border-rose-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-rose-700 transition hover:bg-rose-100"
            >
              Delete account
            </button>
          </div>
        ) : (
          <form className="mt-6 space-y-6" onSubmit={handleDeleteAccount}>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-[0.3em] text-rose-600/80"
                htmlFor="deletePassword"
              >
                Confirm with password
              </label>
              <input
                id="deletePassword"
                name="deletePassword"
                type="password"
                placeholder="Enter your current password"
                value={deletePassword}
                onChange={(event) => {
                  setDeletePassword(event.target.value);
                  if (deleteError) setDeleteError(null);
                }}
                className="mt-3 w-full rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm text-rose-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                required
              />
            </div>

            {deleteError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {deleteError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="rounded-xl border border-rose-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-rose-700 transition hover:bg-rose-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleteLoading}
                className="rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm delete'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
