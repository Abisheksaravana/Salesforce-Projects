import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/projects',  label: 'Projects' },
  { to: '/skills',    label: 'Skills' },
  { to: '/experience',label: 'Experience' },
  { to: '/contact',   label: 'Contact' },
];

function SFCloud() {
  return (
    <svg width="28" height="20" viewBox="0 0 46 30" fill="currentColor" className="text-[#00A1E0]">
      <path d="M37.5 11.8c.1-.5.2-1 .2-1.5C37.7 6 34.2 2.5 30 2.5c-1.6 0-3 .5-4.2 1.3C24.4 2 22.3 1 20 1
               c-4.2 0-7.6 3.1-8.1 7.1C10 8.2 8 8.5 6.4 9.5 4.6 10.7 3.5 12.7 3.5 15c0 3.6 2.9 6.5 6.5 6.5H36
               c3.6 0 6.5-2.9 6.5-6.5 0-2.5-1.4-4.7-3.5-5.8-.5.2-.9.4-1.5.6z"/>
    </svg>
  );
}

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <SFCloud />
          <span className="font-bold text-white text-lg tracking-tight group-hover:text-[#00A1E0] transition-colors">
            Abishek<span className="text-[#00A1E0]">.</span>
          </span>
        </NavLink>

        {/* Links */}
        <ul className="flex items-center gap-1">
          {LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative text-sm px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? 'text-[#00A1E0] bg-[#00A1E0]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
