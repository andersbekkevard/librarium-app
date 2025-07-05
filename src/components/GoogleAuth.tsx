'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GoogleAuth = () => {
  const { user, loading } = useAuth();
  const [signing, setSigning] = useState(false);

  const handleSignIn = async () => {
    setSigning(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      
      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      console.log('Google Access Token:', token);
      console.log('User:', result.user);
    } catch (error) {
      console.error('Error during sign in:', error);
    } finally {
      setSigning(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-xl">Google Authentication with Popup</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-muted-foreground">
          Sign in with your Google account below.
        </p>

        {!user ? (
          <Button
            onClick={handleSignIn}
            disabled={signing}
            className="w-full sm:w-auto"
          >
            {signing ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        ) : (
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Firebase sign-in status:</span>
            <span className={`text-sm font-mono px-2 py-1 rounded ${
              user ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
            }`}>
              {user ? 'Signed in' : 'Not signed in'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">
              Firebase auth <code className="bg-muted px-1 py-0.5 rounded text-xs">currentUser</code> object value:
            </div>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
              <code>
                {user ? JSON.stringify({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  emailVerified: user.emailVerified,
                  phoneNumber: user.phoneNumber,
                  providerId: user.providerId,
                  metadata: {
                    creationTime: user.metadata.creationTime,
                    lastSignInTime: user.metadata.lastSignInTime,
                  }
                }, null, 2) : 'null'}
              </code>
            </pre>
          </div>

          {user && (
            <div className="space-y-2">
              <div className="text-sm font-medium">User Profile:</div>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-center gap-3">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleAuth; 