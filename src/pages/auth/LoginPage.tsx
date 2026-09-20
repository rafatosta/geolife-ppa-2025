import { Eye, EyeOff, GraduationCap, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { cn } from '../../lib/cn';

type Mode = 'sign-in' | 'sign-up';

function readableAuthError(reason: unknown) {
  if (!(reason instanceof Error)) return 'Não foi possível continuar. Tente novamente.';
  const messages: Record<string, string> = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_address_invalid: 'Informe um endereço de e-mail válido.',
    user_already_exists: 'Já existe uma conta cadastrada com este e-mail.',
    signup_disabled: 'A criação de novas contas está desabilitada.',
    weak_password: 'Escolha uma senha mais forte, com pelo menos 8 caracteres.',
    over_request_rate_limit: 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.',
  };
  const code = 'code' in reason && typeof reason.code === 'string' ? reason.code : '';
  return messages[code] ?? reason.message;
}

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode); setError(null); setMessage(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const password = String(form.get('password'));
    setLoading(true); setError(null); setMessage(null);
    try {
      if (mode === 'sign-in') {
        await signIn(email, password);
      } else {
        const name = String(form.get('name')).trim();
        const passwordConfirmation = String(form.get('password_confirmation'));
        if (password !== passwordConfirmation) throw new Error('As senhas não coincidem.');
        const result = await signUp(name, email, password);
        if (result.confirmationRequired) {
          setMessage('Cadastro recebido. Confira seu e-mail para confirmar a conta e depois faça login.');
          setMode('sign-in');
        }
      }
    } catch (reason) {
      setError(readableAuthError(reason));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'min-h-12 w-full rounded-control border bg-white py-3 pl-11 pr-3 text-sm placeholder:text-ink-secondary/70';
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dcf5eb_0,transparent_38%)] p-page"><Card className="w-full max-w-md border-0 p-7 md:p-10"><div className="text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-[1.4rem] bg-primary text-white shadow-lg shadow-primary/20"><GraduationCap className="size-8" aria-hidden /></span><h1 className="mt-5 text-3xl font-extrabold tracking-tight">Geolife PPA 2025</h1><p className="mx-auto mt-2 max-w-xs leading-6 text-ink-secondary">Acompanhe seus compromissos, atividades e progresso.</p></div><div className="mt-6 grid grid-cols-2 rounded-control bg-surface-muted p-1" role="tablist" aria-label="Acesso à conta"><button type="button" role="tab" aria-selected={mode === 'sign-in'} onClick={() => changeMode('sign-in')} className={cn('min-h-10 rounded-xl text-sm font-semibold text-ink-secondary', mode === 'sign-in' && 'bg-white text-primary-dark shadow-sm')}>Entrar</button><button type="button" role="tab" aria-selected={mode === 'sign-up'} onClick={() => changeMode('sign-up')} className={cn('min-h-10 rounded-xl text-sm font-semibold text-ink-secondary', mode === 'sign-up' && 'bg-white text-primary-dark shadow-sm')}>Criar conta</button></div><form className="mt-5 space-y-3" onSubmit={submit}>{mode === 'sign-up' && <div><label className="mb-1.5 block text-sm font-semibold" htmlFor="name">Nome</label><div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-secondary" aria-hidden /><input className={inputClass} id="name" name="name" autoComplete="name" required maxLength={100} placeholder="Seu nome" /></div></div>}<div><label className="mb-1.5 block text-sm font-semibold" htmlFor="email">E-mail</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-secondary" aria-hidden /><input className={inputClass} id="email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="voce@exemplo.com" /></div></div><div><label className="mb-1.5 block text-sm font-semibold" htmlFor="password">Senha</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-secondary" aria-hidden /><input className={`${inputClass} pr-12`} id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required minLength={8} placeholder="Mínimo de 8 caracteres" /><IconButton type="button" className="absolute right-1 top-1/2 -translate-y-1/2" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</IconButton></div></div>{mode === 'sign-up' && <div><label className="mb-1.5 block text-sm font-semibold" htmlFor="password_confirmation">Confirmar senha</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-secondary" aria-hidden /><input className={inputClass} id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} placeholder="Repita sua senha" /></div></div>}{error && <p role="alert" className="rounded-control bg-danger-soft p-3 text-sm text-danger">{error}</p>}{message && <p role="status" className="rounded-control bg-success-soft p-3 text-sm text-success">{message}</p>}<Button fullWidth type="submit" className="mt-2" loading={loading}>{mode === 'sign-in' ? 'Entrar' : 'Criar conta'}</Button></form><p className="mt-5 text-center text-xs leading-5 text-ink-secondary">Após o cadastro, o acesso é liberado pelo administrador.</p></Card></main>;
}
