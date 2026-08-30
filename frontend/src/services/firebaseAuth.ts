import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '../config/firebase';

const API_BASE_URL = '/api';

export class FirebaseAuthService {

  public static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const user = result.user;

      const syncRes = await fetch(`${API_BASE_URL}/auth/firebase-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          profileImage: user.photoURL || undefined,
          uid: user.uid,
          emailVerified: user.emailVerified,
        }),
      });

      const data = await syncRes.json();
      if (!syncRes.ok || !data.success) {
        throw new Error(data.message || 'Failed to synchronize with server.');
      }

      return data.data;
    } catch (error: any) {
      console.error('[Firebase Auth] Google Sign-In error:', error);
      let msg = error.message || 'Google sign-in failed. Please try again.';

      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Google sign-in window was closed before completing login.';
      } else if (error.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/unauthorized-domain') {
        msg = 'Current domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).';
      } else if (error.code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-in is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.';
      } else if (error.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please check your internet connection.';
      }

      throw new Error(msg);
    }
  }

  public static async registerWithEmail(name: string, email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const user = userCredential.user;

      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
      }

      await sendEmailVerification(user);

      return {
        user,
        email: user.email,
        emailVerified: user.emailVerified,
      };
    } catch (error: any) {
      console.error('[Firebase Auth] Registration error:', error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid Gmail / Email address.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      throw new Error(msg);
    }
  }

  public static async checkVerificationStatus(name?: string) {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No active registration session found. Please sign in.');
    }

    await user.reload();

    if (!user.emailVerified) {
      return {
        verified: false,
        message: 'Your email is not verified yet. Please open your Gmail, click the verification link, and then press this button again.',
      };
    }

    const syncRes = await fetch(`${API_BASE_URL}/auth/firebase-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: name || user.displayName || user.email?.split('@')[0],
        uid: user.uid,
        emailVerified: true,
      }),
    });

    const data = await syncRes.json();
    if (!syncRes.ok || !data.success) {
      throw new Error(data.message || 'Failed to activate verified reader account.');
    }

    return {
      verified: true,
      session: data.data,
    };
  }

  public static async resendVerificationEmail() {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error('Please sign in or register to resend verification email.');
    }
    await sendEmailVerification(user);
    return { message: 'A fresh Google verification link has been dispatched to your Gmail!' };
  }

  public static async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const user = userCredential.user;

      if (!user.emailVerified) {

        try {
          await sendEmailVerification(user);
        } catch (e) {

        }

        const unverifiedErr: any = new Error(
          'Your Gmail address has not been verified yet. We have just resent a verification link to your Gmail. Please click the link in your email to activate your account.'
        );
        unverifiedErr.code = 'EMAIL_NOT_VERIFIED';
        throw unverifiedErr;
      }

      const syncRes = await fetch(`${API_BASE_URL}/auth/firebase-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          profileImage: user.photoURL || undefined,
          uid: user.uid,
          emailVerified: true,
        }),
      });

      const data = await syncRes.json();
      if (!syncRes.ok || !data.success) {
        throw new Error(data.message || 'Failed to sign in.');
      }

      return data.data;
    } catch (error: any) {
      console.error('[Firebase Auth] Login error:', error);
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        throw error;
      }
      let msg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = 'Invalid email or password credentials.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      throw new Error(msg);
    }
  }

  public static async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      return { message: 'Password reset link sent to your email.' };
    } catch (error: any) {
      console.error('[Firebase Auth] Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  }

  public static async signOut() {
    try {
      await signOut(firebaseAuth);
    } catch (e) {
      console.warn('Firebase sign out notice:', e);
    }
  }
}

