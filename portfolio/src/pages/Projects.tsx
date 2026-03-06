import { useSalesforce } from '../hooks/useSalesforce';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { SFPortfolio } from '../types/salesforce';

function SFCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 46 30" fill="currentColor">
      <path d="M37.5 11.8c.1-.5.2-1 .2-1.5C37.7 6 34.2 2.5 30 2.5c-1.6 0-3 .5-4.2 1.3C24.4 2 22.3 1 20 1
               c-4.2 0-7.6 3.1-8.1 7.1C10 8.2 8 8.5 6.4 9.5 4.6 10.7 3.5 12.7 3.5 15c0 3.6 2.9 6.5 6.5 6.5H36
               c3.6 0 6.5-2.9 6.5-6.5 0-2.5-1.4-4.7-3.5-5.8-.5.2-.9.4-1.5.6z"/>
    </svg>
  );
}

function ProjectCard({ portfolio, delay }: { portfolio: SFPortfolio; delay: 1 | 2 | 3 | 4 }) {
  const ref = useScrollAnimation(delay);
  return (
    <div
      ref={ref}
      className="group relative overflow-hidden glass card-glow rounded-2xl border border-white/10 cursor-pointer"
      style={{ minHeight: '200px' }}
    >
      {/* Default face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
        <div className="w-16 h-16 rounded-2xl bg-[#00A1E0]/15 border border-[#00A1E0]/30 flex items-center justify-center">
          <SFCloud className="w-8 h-6 text-[#00A1E0]" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm leading-tight">{portfolio.Name}</p>
          {portfolio.Email__c && (
            <p className="text-white/40 text-xs mt-1">{portfolio.Email__c}</p>
          )}
        </div>
      </div>

      {/* Hover reveal */}
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-br from-[#00A1E0]/20 to-[#032D60]/60 backdrop-blur-sm p-6 flex flex-col justify-between rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SFCloud className="w-5 h-3.5 text-[#00A1E0]" />
            <span className="text-[#00A1E0] text-xs font-medium uppercase tracking-wider">Project</span>
          </div>
          <h3 className="text-white font-bold text-base mb-2">{portfolio.Name}</h3>
          {portfolio.Profile_Summary__c && (
            <p className="text-white/70 text-sm leading-relaxed line-clamp-4">
              {portfolio.Profile_Summary__c}
            </p>
          )}
        </div>
        {portfolio.Email__c && (
          <a
            href={`mailto:${portfolio.Email__c}`}
            className="text-[#00A1E0] text-xs hover:underline mt-2 block"
            onClick={(e) => e.stopPropagation()}
          >
            {portfolio.Email__c}
          </a>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const { data: portfolios, loading, error } = useSalesforce<SFPortfolio>('projects');
  const headerRef = useScrollAnimation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00A1E0] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading from Salesforce...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-red-400">Failed to load projects: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headerRef} className="mb-14">
        <div className="flex items-center gap-2 mb-3">
          <SFCloud className="w-6 h-4 text-[#00A1E0]" />
          <span className="text-[#00A1E0] text-sm font-medium uppercase tracking-widest">Portfolio</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-3">Projects</h1>
        <p className="text-white/50 text-lg">Hover a card to explore each project</p>
      </div>

      {portfolios.length === 0 && (
        <p className="text-white/40">No projects found in Salesforce.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {portfolios.map((p, i) => (
          <ProjectCard key={p.Id} portfolio={p} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} />
        ))}
      </div>
    </main>
  );
}
