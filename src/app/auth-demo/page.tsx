import GoogleAuth from '@/components/GoogleAuth';

const AuthDemoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">Firebase Authentication Demo</h1>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <GoogleAuth />
      </main>
    </div>
  );
};

export default AuthDemoPage; 