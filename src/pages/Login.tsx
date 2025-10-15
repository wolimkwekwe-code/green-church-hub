import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignUp && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        await signIn(email, password);
        toast.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (isSignUp) {
        if (error.code === 'auth/email-already-in-use') {
          toast.error('An account with this email already exists');
        } else if (error.code === 'auth/weak-password') {
          toast.error('Password is too weak');
        } else if (error.code === 'auth/invalid-email') {
          toast.error('Invalid email address');
        } else {
          toast.error('Registration failed. Please try again');
        }
      } else {
        if (error.code === 'auth/invalid-credential') {
          toast.error('Invalid email or password');
        } else if (error.code === 'auth/user-not-found') {
          toast.error('No account found with this email');
        } else if (error.code === 'auth/wrong-password') {
          toast.error('Incorrect password');
        } else if (error.code === 'auth/too-many-requests') {
          toast.error('Too many failed attempts. Please try again later');
        } else {
          toast.error('Login failed. Please check your credentials');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto rounded-xl bg-primary p-3">
            <Church className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Register to access the Church Membership Database'
              : 'Sign in to access the Church Membership Database'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@church.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
