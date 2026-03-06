import { useSalesforce } from '../hooks/useSalesforce';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { SFWorkExperience } from '../types/salesforce';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getInitials(company: string | null): string {
  if (!company) return 'CO';
  return company.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function ExperienceCard({ exp, delay }: { exp: SFWorkExperience; delay: 1 | 2 | 3 | 4 }) {
  const ref = useScrollAnimation(delay);
  const startLabel = formatDate(exp.Start_Date__c);
  const initials = getInitials(exp.Company__c);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden glass card-glow rounded-2xl border border-white/10 cursor-pointer"
      style={{ minHeight: '160px' }}
    >
      {/* Default face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
        {/* Company logo placeholder */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A1E0]/30 to-[#032D60]/60 border border-[#00A1E0]/30 flex items-center justify-center">
          <span className="text-[#00A1E0] font-bold text-lg">{initials}</span>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">{exp.Company__c ?? 'Company'}</p>
          {exp.Role__c && (
            <p className="text-white/50 text-xs mt-0.5">{exp.Role__c}</p>
          )}
        </div>
      </div>

      {/* Hover reveal */}
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-br from-[#00A1E0]/20 to-[#032D60]/60 backdrop-blur-sm p-6 flex flex-col justify-center gap-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00A1E0]/20 border border-[#00A1E0]/30 flex items-center justify-center shrink-0">
            <span className="text-[#00A1E0] font-bold text-sm">{initials}</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">{exp.Company__c ?? 'Company'}</p>
            {exp.Role__c && (
              <p className="text-[#00A1E0] text-xs font-medium">{exp.Role__c}</p>
            )}
          </div>
        </div>

        {startLabel && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00A1E0]" />
            <span className="text-white/60 text-xs">Started {startLabel}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">Salesforce Developer</span>
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const { data: experience, loading, error } = useSalesforce<SFWorkExperience>('experience');
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
        <p className="text-red-400">Failed to load experience: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headerRef} className="mb-14">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#00A1E0] text-sm font-medium uppercase tracking-widest">🏢 Career</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-3">Experience</h1>
        <p className="text-white/50 text-lg">Hover a card to see role details</p>
      </div>

      {experience.length === 0 && (
        <p className="text-white/40">No experience entries found in Salesforce.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {experience.map((exp, i) => (
          <ExperienceCard key={exp.Id} exp={exp} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} />
        ))}
      </div>
    </main>
  );
}
