import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface ResetPasswordPageProps {
  resetToken: string
  onDone: () => void
}

export default function ResetPasswordPage({ resetToken, onDone }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleReset = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Reset failed'); return }
      setDone(true)
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
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{done ? 'Password Reset!' : 'Set New Password'}</CardTitle>
            <CardDescription>{done ? 'Your password has been updated.' : 'Choose a strong new password.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {done ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle className="w-12 h-12 text-primary" />
                <p className="text-sm text-center text-muted-foreground">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Button className="w-full bg-primary" onClick={onDone}>
                  Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    className="bg-background border-border"
                  />
                </div>
                {error && (
                  <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <Button className="w-full bg-primary" onClick={handleReset} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Reset Password
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}