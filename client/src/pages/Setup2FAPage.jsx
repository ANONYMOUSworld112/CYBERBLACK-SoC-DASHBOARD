import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function Setup2FAPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const totpVerified = useAuthStore((s) => s.totpVerified);
  const user = useAuthStore((s) => s.user);
  const setup2FA = useAuthStore((s) => s.setup2FA);
  const confirm2FASetup = useAuthStore((s) => s.confirm2FASetup);
  const verify2FA = useAuthStore((s) => s.verify2FA);

  const [otpauth, setOtpauth] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login', { replace: true }); return; }
    if (totpVerified) { navigate('/dashboard', { replace: true }); return; }
    (async () => {
      try {
        const data = await setup2FA();
        if (data.alreadyEnabled) {
          setNeedsSetup(false);
        } else {
          setNeedsSetup(true);
          setOtpauth(data.otpauth);
          setQrDataUrl(data.qrDataUrl);
        }
      } catch (err) {
        toast.error(err.message || '2FA bootstrap failed');
      }
    })();
  }, [token, totpVerified, navigate, setup2FA]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error('Enter a 6-digit code');
      return;
    }
    setBusy(true);
    try {
      if (needsSetup) {
        await confirm2FASetup(code);
        toast.success('2FA enrolled');
      } else {
        await verify2FA(code);
        toast.success('Verified');
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-void text-text-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-border-2 bg-bg-input p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 bg-text-1" />
          <span className="font-orbitron text-[10px] tracking-widest3 uppercase text-text-2">
            Step 02 // Multi-factor Authentication
          </span>
        </div>

        <h2 className="font-orbitron text-2xl tracking-widest2 uppercase text-text-1 mb-1">
          {needsSetup ? 'Enroll 2FA' : 'Verify 2FA'}
        </h2>
        <p className="font-mono text-[11px] text-text-3 mb-6">
          {needsSetup
            ? 'Scan the QR code with your authenticator app, then enter the 6-digit code below.'
            : `Enter the 6-digit code from your authenticator app for ${user?.username || 'operator'}.`}
        </p>

        {needsSetup && qrDataUrl && (
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="p-2 border border-border-2 bg-text-1">
              <img src={qrDataUrl} alt="TOTP QR" className="w-40 h-40" />
            </div>
            {otpauth && (
              <code className="font-mono text-[10px] text-text-3 break-all max-w-full text-center">
                {otpauth}
              </code>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            label="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            pattern="\d{6}"
            autoFocus
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={busy || code.length !== 6}
          >
            {busy ? 'Verifying…' : needsSetup ? 'Enroll & Continue →' : 'Verify & Continue →'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="w-full mt-4 font-mono text-[11px] text-text-3 hover:text-text-1 uppercase"
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}
