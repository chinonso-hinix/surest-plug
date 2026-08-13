import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, SiteSettings } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  settings: SiteSettings | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (fullName: string, email: string, pass: string, confirmPass: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changeUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  updateProfileData: (data: { fullName?: string; phone?: string; profileImage?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (err: any): string => {
  const code = err?.code || '';
  const message = err?.message || '';

  if (
    code === 'auth/popup-closed-by-user' ||
    message.includes('auth/popup-closed-by-user')
  ) {
    return 'Google sign-in popup was closed before completing. Please try again.';
  }
  if (
    code === 'auth/cancelled-popup-request' ||
    message.includes('auth/cancelled-popup-request')
  ) {
    return 'Google sign-in request was cancelled. Please try again.';
  }
  if (
    code === 'auth/popup-blocked' ||
    message.includes('auth/popup-blocked')
  ) {
    return 'The sign-in popup was blocked by your browser. Please allow popups or try again.';
  }
  if (
    code === 'auth/unauthorized-domain' ||
    message.includes('auth/unauthorized-domain')
  ) {
    return 'This domain is not authorized for Google Sign-In in Firebase. Please add this domain under Firebase Console > Authentication > Settings > Authorized domains.';
  }
  if (
    code === 'auth/account-exists-with-different-credential' ||
    message.includes('auth/account-exists-with-different-credential')
  ) {
    return 'An account already exists with the same email address using a different sign-in method. Please log in using your password.';
  }
  if (
    code === 'auth/operation-not-allowed' ||
    message.includes('auth/operation-not-allowed') ||
    message.includes('operation-not-allowed')
  ) {
    return 'The selected sign-in provider is not enabled in your Firebase project. Please check Firebase Console > Authentication > Sign-in method.';
  }
  if (
    code === 'auth/email-already-in-use' ||
    message.includes('auth/email-already-in-use')
  ) {
    return 'An account with this email address already exists. Please log in instead.';
  }
  if (
    code === 'auth/invalid-email' ||
    message.includes('auth/invalid-email')
  ) {
    return 'Please enter a valid email address.';
  }
  if (
    code === 'auth/weak-password' ||
    message.includes('auth/weak-password')
  ) {
    return 'Password is too weak. Minimum 6 characters required.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    message.includes('auth/invalid-credential') ||
    message.includes('auth/user-not-found') ||
    message.includes('auth/wrong-password')
  ) {
    return 'Invalid email address or password. Please verify your credentials and try again.';
  }
  if (
    code === 'auth/user-disabled' ||
    message.includes('auth/user-disabled')
  ) {
    return 'This user account has been disabled. Please contact support for assistance.';
  }
  if (
    code === 'auth/too-many-requests' ||
    message.includes('auth/too-many-requests')
  ) {
    return 'Too many failed attempts. Please try again later or reset your password.';
  }
  if (
    code === 'auth/network-request-failed' ||
    message.includes('auth/network-request-failed')
  ) {
    return 'Network request failed. Please check your internet connection and try again.';
  }

  if (message && !message.startsWith('Firebase:')) {
    return message;
  }

  return err?.message || 'An authentication error occurred. Please try again.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res.settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const isAdminEmail = (email?: string | null): boolean => {
    if (!email) return false;
    return email.trim().toLowerCase() === 'chinonsochinix@gmail.com';
  };

  const fetchUserProfile = async (fbUser: FirebaseUser): Promise<User | null> => {
    // Attempt to fetch profile via API first or Firestore doc
    try {
      const res = await api.getMe();
      if (res && res.user) {
        return res.user;
      }
    } catch (apiErr) {
      // ignore
    }

    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

      const email = fbUser.email || '';
      const autoAdmin = isAdminEmail(email);

      if (snap.exists()) {
        const data = snap.data() as any;
        const assignedRole = autoAdmin ? 'admin' : (data.role || 'user');
        
        // If role changed to admin due to autoAdmin check, update Firestore
        if (autoAdmin && data.role !== 'admin') {
          updateDoc(userRef, { role: 'admin' }).catch(() => {});
        }

        const profileUser: User = {
          id: fbUser.uid,
          name: data.fullName || data.name || fbUser.displayName || (email ? email.split('@')[0] : 'User'),
          email: email || data.email,
          phone: data.phone || '',
          role: assignedRole,
          status: data.status || 'active',
          balance: typeof data.balance === 'number' ? data.balance : 0,
          profileImage: data.profileImage || fbUser.photoURL || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        return profileUser;
      } else {
        const now = new Date().toISOString();
        const initialRole = autoAdmin ? 'admin' : 'user';
        const defaultProfile = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || (email ? email.split('@')[0] : 'User'),
          name: fbUser.displayName || (email ? email.split('@')[0] : 'User'),
          email: email,
          phone: '',
          role: initialRole,
          status: 'active',
          balance: 0,
          profileImage: fbUser.photoURL || '',
          createdAt: now,
          updatedAt: now
        };
        try {
          await setDoc(userRef, defaultProfile);
        } catch (e) {
          // ignore offline write errors
        }
        return {
          id: fbUser.uid,
          name: defaultProfile.fullName,
          email: email || '',
          phone: '',
          role: initialRole,
          status: 'active',
          balance: 0,
          profileImage: fbUser.photoURL || '',
          createdAt: now,
          updatedAt: now
        };
      }
    } catch (err: any) {
      console.warn('Note on Firestore user profile sync:', err?.message || err);
      const email = fbUser.email || '';
      return {
        id: fbUser.uid,
        name: fbUser.displayName || (email ? email.split('@')[0] : 'User'),
        email: email,
        phone: '',
        role: isAdminEmail(email) ? 'admin' : 'user',
        status: 'active',
        balance: 0,
        profileImage: fbUser.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const profile = await fetchUserProfile(auth.currentUser);
      setUser(profile);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Safety fallback: Ensure app loading screen strictly completes in under 2.5 seconds maximum
    const maxLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const profile = await fetchUserProfile(result.user);
          if (profile) {
            setUser(profile);
          }
        }
      })
      .catch((err) => {
        console.warn('Google redirect result note:', err?.message || err);
      });

    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (currentUser) {
        // Real-time listener for Firestore user profile (e.g. balance, role updates)
        const userRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeDoc = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const email = currentUser.email || data.email;
              const autoAdmin = isAdminEmail(email);
              const assignedRole = autoAdmin ? 'admin' : (data.role || 'user');

              setUser({
                id: currentUser.uid,
                name: data.fullName || data.name || currentUser.displayName || 'User',
                email: email,
                phone: data.phone || '',
                role: assignedRole,
                status: data.status || 'active',
                balance: typeof data.balance === 'number' ? data.balance : 0,
                profileImage: data.profileImage || currentUser.photoURL || '',
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              });
            } else {
              fetchUserProfile(currentUser).then(setUser);
            }
            setIsLoading(false);
            clearTimeout(maxLoadingTimer);
          },
          (err) => {
            console.warn('Note on Firestore user snapshot:', err?.message || err);
            fetchUserProfile(currentUser).then((p) => {
              setUser(p);
              setIsLoading(false);
              clearTimeout(maxLoadingTimer);
            });
          }
        );
      } else {
        setUser(null);
        setIsLoading(false);
        clearTimeout(maxLoadingTimer);
      }
    });

    return () => {
      clearTimeout(maxLoadingTimer);
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await fetchUserProfile(userCred.user);

      if (!profile) {
        throw new Error('Could not load user profile after login.');
      }

      if (profile.status === 'suspended') {
        await signOut(auth);
        throw new Error('Your account has been suspended. Please contact support.');
      }

      setUser(profile);
      return profile;
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Incorrect password. Please verify your credentials or click "Forgot Password?".');
      }
      if (err.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address. Please sign up first.');
      }
      if (err.message && !err.code && !err.message.includes('auth/')) {
        throw err;
      }
      throw new Error(formatAuthError(err));
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      let userCred;
      if (isMobile) {
        try {
          userCred = await signInWithPopup(auth, googleProvider);
        } catch (popupErr: any) {
          if (
            popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/popup-closed-by-user' ||
            popupErr.code === 'auth/cancelled-popup-request'
          ) {
            await signInWithRedirect(auth, googleProvider);
            return null as any;
          }
          throw popupErr;
        }
      } else {
        userCred = await signInWithPopup(auth, googleProvider);
      }

      if (!userCred || !userCred.user) {
        throw new Error('Google sign-in was not completed.');
      }

      const profile = await fetchUserProfile(userCred.user);
      if (!profile) {
        throw new Error('Failed to load user profile after Google sign-in.');
      }

      if (profile.status === 'suspended') {
        await signOut(auth);
        throw new Error('Your account has been suspended. Please contact support.');
      }

      setUser(profile);
      return profile;
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        const email = err.customData?.email || err.email;
        let msg = 'An account already exists with this email address using email/password login.';
        if (email) {
          msg += ` Please log in with your password for ${email} to link your Google account.`;
        }
        throw new Error(msg);
      }
      if (err.message && !err.code && !err.message.includes('auth/')) {
        throw err;
      }
      throw new Error(formatAuthError(err));
    }
  };

  const signup = async (fullName: string, email: string, pass: string, confirmPass: string): Promise<User> => {
    if (pass !== confirmPass) {
      throw new Error('Passwords do not match.');
    }
    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCred.user.uid;
      const now = new Date().toISOString();

      const newProfileData = {
        uid,
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: '',
        role: 'user', // Default user role
        status: 'active',
        balance: 0,
        profileImage: '',
        createdAt: now,
        updatedAt: now
      };

      // Create user document in Firestore: users/{firebaseUser.uid}
      try {
        await setDoc(doc(db, 'users', uid), newProfileData);
      } catch (firestoreErr) {
        console.error('Firestore user profile creation error:', firestoreErr);
      }

      const createdUser: User = {
        id: uid,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: '',
        role: 'user',
        status: 'active',
        balance: 0,
        profileImage: '',
        createdAt: now,
        updatedAt: now
      };

      setUser(createdUser);
      return createdUser;
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (emailToReset: string) => {
    try {
      await sendPasswordResetEmail(auth, emailToReset);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new Error('If an account exists with this email address, a password reset link has been sent.');
      }
      throw new Error(formatAuthError(err));
    }
  };

  const changeUserPassword = async (currentPass: string, newPass: string) => {
    if (!auth.currentUser) throw new Error('Not authenticated.');
    if (newPass.length < 6) throw new Error('New password must be at least 6 characters.');

    try {
      if (currentPass && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      await updatePassword(auth.currentUser, newPass);
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    }
  };

  const updateProfileData = async (data: { fullName?: string; phone?: string; profileImage?: string }) => {
    if (!auth.currentUser) throw new Error('Not authenticated.');

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const updates: any = { updatedAt: new Date().toISOString() };

    if (data.fullName) {
      updates.fullName = data.fullName.trim();
      updates.name = data.fullName.trim();
    }
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.profileImage !== undefined) updates.profileImage = data.profileImage;

    await updateDoc(userRef, updates);
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        settings,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        changeUserPassword,
        updateProfileData,
        refreshUser,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
