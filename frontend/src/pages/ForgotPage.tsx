import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Loader2, ArrowLeft, Mail } from 'lucide-react'

interface ForgotPageProps {
  onSwitch: (page: 'login' | 'register' | 'forgot') => void
}

export default function ForgotPage({ onSwitch }: ForgotPageProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleRequest = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Request failed'); return }
      setSent(true)
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
            <CardTitle className="text-lg">{sent ? 'Check your email' : 'Forgot Password'}</CardTitle>
            <CardDescription>
              {sent ? `We sent a reset link to ${email}` : 'Enter your email to reset your password.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm text-center text-muted-foreground leading-relaxed">
                  A password reset link has been sent to <span className="text-foreground font-medium">{email}</span>.
                  Check your inbox and click the link — it expires in 15 minutes.
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Don't see it? Check your spam folder.
                </p>
                <Button className="w-full bg-primary" onClick={() => onSwitch('login')}>
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRequest()}
                    className="bg-background border-border"
                  />
                </div>
                {error && (
                  <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <Button className="w-full bg-primary" onClick={handleRequest} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
                <button
                  onClick={() => onSwitch('login')}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}