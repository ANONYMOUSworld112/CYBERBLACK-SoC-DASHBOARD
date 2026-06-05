import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import ClassificationBadge from '../components/ui/ClassificationBadge.jsx';
import { useAuthStore } from '../store/authStore.js';

/* ── Neural network canvas: white nodes, white connection lines only ── */
function NeuralCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let nodes = [];
    const NODE_COUNT = 60;
    const LINK_DIST = 140;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const init = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
      }));
    };
    init();

    const onResize = () => { resize(); init(); };
    window.addEventListener('resize', onResize);

    const step = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      // connections first (behind nodes)
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK_DIST) * 0.15})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.clientWidth) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.clientHeight) n.vy *= -1;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

/* ── Counters: white numbers, gray labels ── */
function StatCounter({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="font-orbitron text-2xl text-text-1 tracking-widest2">{value}</span>
      <span className="font-mono text-[10px] uppercase text-text-3 mt-1">{label}</span>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const totpVerified = useAuthStore((s) => s.totpVerified);
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (token && totpVerified) navigate('/dashboard', { replace: true });
    else if (token) navigate('/setup-2fa', { replace: true });
  }, [token, totpVerified, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('Credentials accepted — continue with 2FA');
      navigate('/setup-2fa', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-void text-text-1 relative flex">
      {/* Left brand panel */}
      <div className="relative hidden md:flex flex-col w-1/2 p-10 border-r border-border-2 overflow-hidden">
        <NeuralCanvas />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-text-1 animate-pulse-core" />
            <span className="font-orbitron text-sm tracking-widest3 uppercase text-text-1">
              SOC // COMMAND
            </span>
          </div>
          <ClassificationBadge level="RESTRICTED" />
        </div>

        <div className="relative z-10 mt-20">
          <h1 className="font-orbitron text-5xl tracking-widest3 uppercase text-text-1 leading-[1.05]">
            DEFEND<br />
            <span className="text-text-2">/ DETECT</span><br />
            DOMINATE
          </h1>
          <p className="font-mono text-sm text-text-3 mt-6 max-w-md leading-relaxed">
            Tier-1 Security Operations Center. Real-time correlation across network,
            identity, and threat intelligence feeds. Single-pane triage for incident
            responders.
          </p>
        </div>

        <div className="relative z-10 mt-auto grid grid-cols-3 gap-8">
          <StatCounter value="24/7"  label="Operations" />
          <StatCounter value="0ms"   label="Latency Target" />
          <StatCounter value="ISO"   label="27001 / SOC2" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col p-10">
        <div className="flex items-center justify-between md:hidden">
          <ClassificationBadge level="RESTRICTED" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-sm border border-border-2 bg-bg-input p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 bg-text-1" />
              <span className="font-orbitron text-[10px] tracking-widest3 uppercase text-text-2">
                Analyst Access // Secure Channel
              </span>
            </div>
            <h2 className="font-orbitron text-2xl tracking-widest2 uppercase text-text-1 mb-1">
              Sign in
            </h2>
            <p className="font-mono text-[11px] text-text-3 mb-6">
              Enter your operator credentials. 2FA will be required next.
            </p>

            <div className="space-y-3">
              <Input
                label="Operator ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                autoFocus
                required
              />
              <Input
                label="Passphrase"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-6"
              disabled={submitting || !username || !password}
            >
              {submitting ? 'Authenticating…' : 'Authenticate →'}
            </Button>

            <div className="mt-6 pt-4 border-t border-border-2 font-mono text-[10px] text-text-3 uppercase">
              <div className="flex items-center justify-between">
                <span>TLS 1.3</span>
                <span>HSTS ENABLED</span>
                <span>FIPS-140</span>
              </div>
            </div>
          </form>
        </div>

        <div className="font-mono text-[10px] text-text-4 uppercase">
          © SOC//OPS v2.0 — Internal use only. All actions are logged.
        </div>
      </div>
    </div>
  );
}
