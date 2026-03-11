import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, Loader2, Eye, EyeOff } from 'lucide-react'

interface LoginPageProps {
  onSwitch: (page: 'login' | 'register' | 'forgot') => void
}

export default function LoginPage({ onSwitch }: LoginPageProps) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!form.email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email'
    if (!form.password) return 'Password is required'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      login(data.token, data.user)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">FinanceAI</h1>
          <p className="text-sm text-muted-foreground">Your smart financial adviser</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="bg-background border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button className="w-full bg-primary text-primary-foreground" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button onClick={() => onSwitch('forgot')} className="text-muted-foreground hover:text-primary transition-colors">
                Forgot password?
              </button>
              <button onClick={() => onSwitch('register')} className="text-primary hover:underline">
                Create account →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}