import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnoAI from '../components/ui/animated-shader-background';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (isSignup && confirm !== password) {
      setError('As senhas não conferem.');
      return;
    }

    const response = isSignup ? await auth.signup(email, password) : await auth.login(email, password);
    if (response.error) {
      setError(response.error);
      return;
    }

    navigate('/onboarding');
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <AnoAI />

      <form
        onSubmit={onSubmit}
        className="w-full max-w-[520px] rounded-[24px] border border-teal-400/40 bg-[#111a20]/80 p-8 text-white shadow-[0_0_50px_rgba(93,209,198,.25)] backdrop-blur-md"
      >
        <h1 className="mb-6 text-center text-5xl font-bold tracking-[0.25em] text-white/90">BOS</h1>

        <div className="mb-6 flex rounded-xl bg-white/90 p-1 text-zinc-700">
          <button type="button" onClick={() => setIsSignup(false)} className={`flex-1 rounded-lg px-3 py-2 text-lg ${!isSignup ? 'bg-zinc-100 font-semibold shadow-sm' : ''}`}>
            Login
          </button>
          <button type="button" onClick={() => setIsSignup(true)} className={`flex-1 rounded-lg px-3 py-2 text-lg ${isSignup ? 'bg-zinc-100 font-semibold shadow-sm' : ''}`}>
            Cadastro
          </button>
        </div>

        <label className="mb-2 block text-3xl font-medium text-white/90">Email</label>
        <div className="mb-5 flex items-center rounded-2xl border border-white/15 bg-black/30 px-4">
          <Mail size={20} className="text-white/60" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent p-4 text-xl outline-none placeholder:text-white/35"
            placeholder="seu@email.com"
          />
        </div>

        <label className="mb-2 block text-3xl font-medium text-white/90">Senha</label>
        <div className="mb-5 flex items-center rounded-2xl border border-white/15 bg-black/30 px-4">
          <Lock size={20} className="text-white/60" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? 'text' : 'password'}
            className="w-full bg-transparent p-4 text-xl outline-none placeholder:text-white/35"
            placeholder="********"
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="text-white/70">
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {isSignup && (
          <>
            <label className="mb-2 block text-3xl font-medium text-white/90">Confirmar Senha</label>
            <div className="mb-5 flex items-center rounded-2xl border border-white/15 bg-black/30 px-4">
              <Lock size={20} className="text-white/60" />
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type={show ? 'text' : 'password'}
                className="w-full bg-transparent p-4 text-xl outline-none placeholder:text-white/35"
                placeholder="********"
              />
            </div>
          </>
        )}

        {error && <p className="mb-4 text-base text-rose-300">{error}</p>}

        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5DD1C6] py-4 text-3xl font-semibold text-white shadow-[0_0_28px_rgba(93,209,198,.50)] hover:brightness-95">
          {isSignup ? 'Criar Conta' : 'Entrar'} <ArrowRight size={24} />
        </button>
      </form>
    </div>
  );
}
