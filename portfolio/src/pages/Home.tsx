import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSalesforce } from '../hooks/useSalesforce';
import type { SFProject } from '../types/salesforce';

function SFCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 46 30" fill="currentColor">
      <path d="M37.5 11.8c.1-.5.2-1 .2-1.5C37.7 6 34.2 2.5 30 2.5c-1.6 0-3 .5-4.2 1.3C24.4 2 22.3 1 20 1
               c-4.2 0-7.6 3.1-8.1 7.1C10 8.2 8 8.5 6.4 9.5 4.6 10.7 3.5 12.7 3.5 15c0 3.6 2.9 6.5 6.5 6.5H36
               c3.6 0 6.5-2.9 6.5-6.5 0-2.5-1.4-4.7-3.5-5.8-.5.2-.9.4-1.5.6z"/>
    </svg>
  );
}

function StatCard({ value, label, delay }: { value: string; label: string; delay: 1 | 2 | 3 | 4 }) {
  const ref = useScrollAnimation(delay);
  return (
    <div ref={ref} className="glass card-glow rounded-2xl p-6 text-center border border-white/10">
      <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
      <div className="text-white/60 text-sm">{label}</div>
    </div>
  );
}

function FeaturedCard({ project, delay }: { project: SFProject; delay: 1 | 2 | 3 | 4 }) {
  const ref = useScrollAnimation(delay);
  const techTags = project.Tech_Stack__c
    ? project.Tech_Stack__c.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <div ref={ref} className="group relative overflow-hidden glass card-glow rounded-2xl border border-white/10 min-h-[180px]">
      {/* Default */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
        <div className="w-14 h-14 rounded-2xl bg-[#00A1E0]/15 border border-[#00A1E0]/30 flex items-center justify-center">
          <SFCloud className="w-7 h-5 text-[#00A1E0]" />
        </div>
        <div className="text-center">
          <h3 className="text-white font-semibold text-sm">{project.Name}</h3>
          {techTags.length > 0 && (
            <p className="text-white/40 text-xs mt-1">{techTags.join(' · ')}</p>
          )}
        </div>
      </div>
      {/* Hover reveal */}
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-br from-[#00A1E0]/20 to-[#032D60]/40 backdrop-blur-sm p-6 flex flex-col justify-center rounded-2xl">
        <h3 className="text-white font-bold text-base mb-2">{project.Name}</h3>
        {project.Summary_Details__c && (
          <p className="text-white/70 text-xs leading-relaxed line-clamp-4"
             dangerouslySetInnerHTML={{ __html: project.Summary_Details__c }} />
        )}
        <div className="flex gap-3 mt-3">
          {project.Demo_URL__c && (
            <a href={project.Demo_URL__c} target="_blank" rel="noopener noreferrer"
               className="text-[#00A1E0] text-xs hover:underline">🔗 Demo</a>
          )}
          {project.Repo_URL__c && (
            <a href={project.Repo_URL__c} target="_blank" rel="noopener noreferrer"
               className="text-[#00A1E0] text-xs hover:underline">📁 Repo</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: projects } = useSalesforce<SFProject>('projects');
  const featured = projects.slice(0, 3);
  const statsRef = useScrollAnimation();
  const featuredRef = useScrollAnimation();

  return (
    <main className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center">
        <SFCloud className="absolute top-16 left-10 w-24 opacity-5 cloud-float text-[#00A1E0]" />
        <SFCloud className="absolute top-32 right-16 w-40 opacity-5 cloud-float-slow text-[#00A1E0]" />
        <SFCloud className="absolute bottom-24 left-1/4 w-20 opacity-5 cloud-float text-[#00A1E0]" />
        <SFCloud className="absolute bottom-16 right-1/3 w-32 opacity-5 cloud-float-slow text-[#00A1E0]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00A1E0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#1798C1]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="fade-in mb-6 inline-flex items-center gap-2 glass rounded-full px-4 py-2 border border-[#00A1E0]/30 glow-pulse">
          <SFCloud className="w-5 h-3.5 text-[#00A1E0]" />
          <span className="text-[#00A1E0] text-sm font-medium">Salesforce Developer</span>
        </div>

        <h1 className="fade-in text-6xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Hi, I'm <span className="gradient-text">Abishek</span>
        </h1>

        <p className="fade-in text-white/60 text-xl md:text-2xl mb-3 max-w-2xl leading-relaxed">
          Salesforce Developer with{' '}
          <span className="text-[#00A1E0] font-semibold">4.5 years</span> of experience building
          scalable CRM solutions on the Salesforce platform.
        </p>
        <p className="fade-in text-white/40 text-sm mb-10 max-w-xl">
          Apex · LWC · Flow · Integrations · Agentforce
        </p>

        <div className="fade-in flex gap-4 flex-wrap justify-center mb-20">
          <Link to="/projects"
            className="bg-[#00A1E0] hover:bg-[#1798C1] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#00A1E0]/30 hover:-translate-y-0.5">
            View Projects
          </Link>
          <Link to="/contact"
            className="glass border border-[#00A1E0]/40 hover:border-[#00A1E0] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:bg-[#00A1E0]/10">
            Contact Me
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#00A1E0]/50 to-transparent" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="4.5+" label="Years Experience" delay={1} />
          <StatCard value="20+" label="Projects Delivered" delay={2} />
          <StatCard value="10+" label="Certifications" delay={3} />
          <StatCard value="100%" label="Customer Focus" delay={4} />
        </div>
      </section>

      {/* ── Featured Projects ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-28">
          <div ref={featuredRef} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Featured Work</h2>
              <p className="text-white/50 text-sm mt-1">Hover cards to explore</p>
            </div>
            <Link to="/projects" className="text-sm text-[#00A1E0] hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p, i) => (
              <FeaturedCard key={p.Id} project={p} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
