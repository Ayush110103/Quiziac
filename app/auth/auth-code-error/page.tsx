import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="mx-auto max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            There was an error during the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The link may have expired or been used already. Please try signing in or signing up again.
          </p>
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 