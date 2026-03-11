import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">
        {label} {required && <span className="text-[#00A1E0]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full glass border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00A1E0]/60 focus:bg-white/10 transition-all duration-200';

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const headerRef = useScrollAnimation();
  const formRef = useScrollAnimation(2);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div ref={headerRef} className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#00A1E0] text-sm font-medium uppercase tracking-widest">💬 Let's Talk</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-3">Contact</h1>
        <p className="text-white/50 text-lg">Have a Salesforce project in mind? Let's connect.</p>
      </div>

      {status === 'success' ? (
        <div className="glass-strong rounded-2xl border border-[#00A1E0]/30 p-10 text-center glow-pulse">
          <div className="w-16 h-16 rounded-full bg-[#00A1E0]/20 border border-[#00A1E0]/40 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Message sent!</h2>
          <p className="text-white/60 text-sm mb-6">I'll get back to you as soon as possible.</p>
          <button
            onClick={() => setStatus('idle')}
            className="text-sm text-[#00A1E0] hover:text-white transition-colors underline underline-offset-4"
          >
            Send another message
          </button>
        </div>
      ) : (
        <div ref={formRef}>
          <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/10 p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Name" required>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange} required
                  className={inputClass} placeholder="Your name"
                />
              </InputField>
              <InputField label="Email" required>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  className={inputClass} placeholder="you@example.com"
                />
              </InputField>
            </div>

            <InputField label="Subject">
              <input
                type="text" name="subject" value={form.subject} onChange={handleChange}
                className={inputClass} placeholder="What's this about?"
              />
            </InputField>

            <InputField label="Message" required>
              <textarea
                name="message" rows={6} value={form.message} onChange={handleChange} required
                className={`${inputClass} resize-none`}
                placeholder="Tell me about your Salesforce project..."
              />
              <p className="text-xs text-white/30 mt-1 text-right">{form.message.length}/5000</p>
            </InputField>

            {status === 'error' && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#00A1E0] hover:bg-[#1798C1] disabled:bg-[#00A1E0]/50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#00A1E0]/30 hover:-translate-y-0.5 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : 'Send Message'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
