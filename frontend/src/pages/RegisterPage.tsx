import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, Loader2, Eye, EyeOff, Check, X } from 'lucide-react'

interface RegisterPageProps {
  onSwitch: (page: 'login' | 'register' | 'forgot') => void
}

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] ${met ? 'text-primary' : 'text-muted-foreground'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </div>
  )
}

export default function RegisterPage({ onSwitch }: RegisterPageProps) {
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const rules = {
    length: form.password.length >= 6,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    match: form.password === form.confirm && form.confirm.length > 0,
  }

  const validate = () => {
    if (!form.name.trim()) return 'Name is required'
    if (!form.email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address'
    if (!rules.length) return 'Password must be at least 6 characters'
    if (!form.confirm) return 'Please confirm your password'
    if (!rules.match) return 'Passwords do not match'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
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
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Get started</CardTitle>
            <CardDescription>Start tracking your finances today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
              {form.password && (
                <div className="grid grid-cols-2 gap-1 pt-1">
                  <PasswordRule met={rules.length} label="At least 6 characters" />
                  <PasswordRule met={rules.upper} label="One uppercase letter" />
                  <PasswordRule met={rules.number} label="One number" />
                  <PasswordRule met={rules.match} label="Passwords match" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="bg-background border-border"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button className="w-full bg-primary text-primary-foreground" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => onSwitch('login')} className="text-primary hover:underline">Sign in →</button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}