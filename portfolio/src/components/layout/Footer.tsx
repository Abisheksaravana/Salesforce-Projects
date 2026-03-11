function SFCloud() {
  return (
    <svg width="20" height="14" viewBox="0 0 46 30" fill="currentColor" className="text-[#00A1E0]">
      <path d="M37.5 11.8c.1-.5.2-1 .2-1.5C37.7 6 34.2 2.5 30 2.5c-1.6 0-3 .5-4.2 1.3C24.4 2 22.3 1 20 1
               c-4.2 0-7.6 3.1-8.1 7.1C10 8.2 8 8.5 6.4 9.5 4.6 10.7 3.5 12.7 3.5 15c0 3.6 2.9 6.5 6.5 6.5H36
               c3.6 0 6.5-2.9 6.5-6.5 0-2.5-1.4-4.7-3.5-5.8-.5.2-.9.4-1.5.6z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <SFCloud />
          <span>© {new Date().getFullYear()} Abishek Saravanan</span>
        </div>
        <span className="text-white/30 text-xs">Powered by Salesforce</span>
      </div>
    </footer>
  );
}
