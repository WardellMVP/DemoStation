import React, { useState, useEffect } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/context/auth-provider';
import { 
  Shield, 
  LockKeyhole, 
  UserCircle2, 
  Mail, 
  User, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  Lock,
  ActivitySquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Define registration schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, isLoading, login, register, loginError, registerError, isLoginPending, isRegisterPending } = useAuth();
  
  // Create form handlers
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle form submissions
  const handleLogin = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  const handleRegister = async (data: RegisterFormData) => {
    // Remove confirmPassword since it's not needed for the API
    const { confirmPassword, ...registerData } = data;
    await register(registerData);
  };

  // Clear form errors when switching tabs
  useEffect(() => {
    if (activeTab === 'login') {
      loginForm.clearErrors();
    } else {
      registerForm.clearErrors();
    }
  }, [activeTab, loginForm, registerForm]);

  // If already authenticated, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="lg:w-1/2 flex flex-col justify-center p-10 text-foreground">
        <div className="space-y-8 max-w-lg mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Demo Codex</h1>
          </div>
          
          <div className="space-y-5">
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              The intelligent platform for<br/> 
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                cybersecurity professionals
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Efficiently manage and execute security assessments with our advanced threat scenario platform.
            </p>
            
            <div className="space-y-5 mt-10 bg-gray-800/40 p-6 rounded-xl border border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-500/20 p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Advanced Scenarios</h3>
                  <p className="text-sm text-gray-300">
                    Leverage industry-leading threat simulations with full customization.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-500/20 p-2 rounded-lg">
                  <ActivitySquare className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Comprehensive Monitoring</h3>
                  <p className="text-sm text-gray-300">
                    Track and analyze security tests with detailed metrics and reports.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-500/20 p-2 rounded-lg">
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Enterprise Security</h3>
                  <p className="text-sm text-gray-300">
                    Protect your organization with robust security assessment tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="lg:w-1/2 flex flex-col justify-center p-10">
        <Card className="max-w-md w-full mx-auto rounded-xl shadow-xl border border-gray-700 bg-gray-800/60 backdrop-blur">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-full">
                <UserCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              {activeTab === 'login' ? 'Welcome Back' : 'Join Demo Codex'}
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              {activeTab === 'login' 
                ? 'Access your security dashboard and scenarios'
                : 'Create an account to get started with your security testing'
              }
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 mx-6 bg-gray-700/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Create Account</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive" className="bg-red-900/40 border-red-800 text-red-200">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                        {...loginForm.register('email')}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password" className="text-gray-200">Password</Label>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                        {...loginForm.register('password')}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" 
                    disabled={isLoginPending}
                  >
                    {isLoginPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : 'Sign In'}
                  </Button>
                  
                  <div className="flex items-center my-2">
                    <div className="flex-grow h-px bg-gray-700"></div>
                    <span className="px-3 text-xs text-gray-400">OR</span>
                    <div className="flex-grow h-px bg-gray-700"></div>
                  </div>
                  
                  <a 
                    href="/api/auth/okta" 
                    className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-white bg-gray-700/50 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4 text-blue-400" />
                    Sign in with Okta
                  </a>
                  
                  <p className="text-sm text-gray-400 text-center">
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      className="text-blue-400 hover:text-blue-300 font-medium"
                      onClick={() => setActiveTab('register')}
                    >
                      Create one now
                    </button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                <CardContent className="space-y-4">
                  {registerError && (
                    <Alert variant="destructive" className="bg-red-900/40 border-red-800 text-red-200">
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-200">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                        {...registerForm.register('name')}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-200">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        placeholder="you@example.com"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                        {...registerForm.register('email')}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                        {...registerForm.register('password')}
                      />
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-200">Confirm Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                        {...registerForm.register('confirmPassword')}
                      />
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" 
                    disabled={isRegisterPending}
                  >
                    {isRegisterPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : 'Create Account'}
                  </Button>
                  
                  <p className="text-sm text-gray-400 text-center">
                    Already have an account?{" "}
                    <button 
                      type="button" 
                      className="text-blue-400 hover:text-blue-300 font-medium"
                      onClick={() => setActiveTab('login')}
                    >
                      Sign in
                    </button>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}