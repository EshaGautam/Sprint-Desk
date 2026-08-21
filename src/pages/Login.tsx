import { useState } from 'react';
import { useLoginMutation } from '../hooks/useAuth';
import { Button, Input } from '../components';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-100">SprintDesk Login</h1>

        {loginMutation.isError && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-lg text-xs font-medium" role="alert">
            {loginMutation.error?.message || 'Login failed'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={loginMutation.isPending}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loginMutation.isPending}
          />
          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={loginMutation.isPending}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
