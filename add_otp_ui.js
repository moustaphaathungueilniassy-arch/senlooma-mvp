const fs = require('fs');
const file = 'src/app/(auth)/inscription/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const \[isLocating, setIsLocating\] = useState\(false\);/,
`const [isLocating, setIsLocating] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);`);

c = c.replace(/if \(data\.promoApplied\) \{[\s\S]*?router\.push\('\/connexion\?registered=true'\);\n      \}/,
`if (data.requireOTP) {
        setShowOtp(true);
        return;
      }

      if (data.promoApplied) {
        router.push('/connexion?registered=true&promo=true');
      } else {
        router.push('/connexion?registered=true');
      }`);

c = c.replace(/const handleSubmit = async \(e: React.FormEvent\) => \{/,
`const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code invalide');
      
      router.push('/connexion?registered=true&verified=true');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {`);

c = c.replace(/<form onSubmit=\{handleSubmit\} className="space-y-4">/,
`{showOtp ? (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="bg-white/10 p-6 rounded-lg text-center border border-white/20">
            <h2 className="text-xl font-bold text-white mb-2">Vérification par SMS</h2>
            <p className="text-white/80 text-sm mb-6">
              Pour des raisons de sécurité, veuillez entrer le code à 4 chiffres qui vient d'être envoyé au <b>{formData.phone}</b>.
            </p>
            <p className="text-xs text-[#D4A843] mb-4 bg-[#D4A843]/10 p-2 rounded">
              <i>(Mode démo : Regardez dans le terminal de développement de votre éditeur pour voir le code !)</i>
            </p>
            
            <input
              type="text"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\\D/g, ''))}
              placeholder="0000"
              className="w-32 mx-auto text-center text-3xl tracking-widest bg-white/10 border-white/20 text-white placeholder-white/30 rounded-md focus:border-white focus:ring focus:ring-white focus:ring-opacity-50 py-3"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otpCode.length !== 4}
            className="w-full py-3 px-4 bg-[#D4A843] hover:bg-[#b08b35] text-white rounded-lg font-bold transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vérifier le code"}
          </button>
        </form>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">`);

c = c.replace(/<\/form>\n    <\/div>/,
`</form>
      )}
    </div>`);

fs.writeFileSync(file, c);
