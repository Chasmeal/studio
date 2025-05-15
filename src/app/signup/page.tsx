import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-primary mb-4">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.026A.75.75 0 003 6.732V11.25a.75.75 0 00.366.652L11.622 16.33a.75.75 0 00.756 0l8.256-4.426A.75.75 0 0021 11.25V6.732a.75.75 0 00-.366-.706L12.378 1.602zM12 7.5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zM11.25 10.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
            <path d="M3 13.875a.75.75 0 00.366.652l8.256 4.426a.75.75 0 00.756 0l8.256-4.426A.75.75 0 0021 13.875V17.25a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V13.875z" />
          </svg>
          <h1 className="text-3xl font-bold text-foreground">Create your TaskZen Account</h1>
          <p className="text-muted-foreground">Join TaskZen to streamline your project management.</p>
        </div>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
