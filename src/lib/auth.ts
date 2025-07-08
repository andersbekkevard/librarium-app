import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: AuthError;
}

export const signInWithGoogle = async (): Promise<AuthResult> => {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");

  try {
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    let authError: AuthError = { code: "unknown", message: "Failed to sign in with Google" };

    if (error.code) {
      authError.code = error.code;
      switch (error.code) {
        case "auth/popup-blocked":
          authError.message = "Popup was blocked by your browser. Please allow popups and try again.";
          break;
        case "auth/popup-closed-by-user":
          authError.message = "Sign-in was cancelled. Please try again.";
          break;
        case "auth/network-request-failed":
          authError.message = "Network error. Please check your connection and try again.";
          break;
        default:
          authError.message = error.message;
      }
    } else if (error.message) {
      authError.message = error.message;
    }

    return { success: false, error: authError };
  }
};

export const signOut = async (): Promise<AuthResult> => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Sign-out error:", error);
    let authError: AuthError = { code: "unknown", message: "Failed to sign out" };

    if (error.code) {
      authError.code = error.code;
      authError.message = error.message;
    } else if (error.message) {
      authError.message = error.message;
    }

    return { success: false, error: authError };
  }
};

export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
