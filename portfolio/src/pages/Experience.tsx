import { useState } from 'react';
import { useSalesforce } from '../hooks/useSalesforce';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { SFWorkExperience, SFProject } from '../types/salesforce';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getInitials(company: string | null): string {
  if (!company) return 'CO';
  return company.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function ProjectPill({ project }: { project: SFProject }) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <div className="w-1 h-1 rounded-full bg-[#00A1E0] mt-1.5 shrink-0" />
      <span className="text-white/80 text-xs leading-snug">{project.Name}</span>
    </div>
  );
}

function ExperienceModal({ exp, onClose }: { exp: SFWorkExperience; onClose: () => void }) {
  const startLabel = formatDate(exp.Start_Date__c);
  const endLabel = exp.Is_Current__c ? 'Present' : formatDate(exp.End_Date__c);
  const initials = getInitials(exp.Company__c);
  const projects = exp.Projects__r?.records ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl glass border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00A1E0]/20 to-[#032D60]/60 px-6 py-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A1E0]/30 to-[#032D60]/60 border border-[#00A1E0]/30 flex items-center justify-center shrink-0">
            <span className="text-[#00A1E0] font-bold text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-white font-bold text-xl">{exp.Company__c ?? 'Company'}</h2>
              {exp.Is_Current__c && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                  Current
                </span>
              )}
            </div>
            {exp.Role__c && <p className="text-[#00A1E0] text-sm mt-0.5">{exp.Role__c}</p>}
            {(startLabel || endLabel) && (
              <p className="text-white/40 text-xs mt-1">
                {startLabel}{startLabel && endLabel ? ' – ' : ''}{endLabel}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-xl leading-none shrink-0 mt-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {exp.Description__c && (
            <div className="mb-5">
              <p className="text-[#00A1E0] text-xs font-semibold uppercase tracking-wider mb-2">Role Summary</p>
              <p className="text-white/80 text-sm leading-relaxed">{exp.Description__c}</p>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <p className="text-[#00A1E0] text-xs font-semibold uppercase tracking-wider mb-3">
                Projects ({projects.length})
              </p>
              <div className="flex flex-col gap-2">
                {projects.map((p) => (
                  <div key={p.Id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00A1E0] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{p.Name}</p>
                      {p.Tech_Stack__c && (
                        <p className="text-white/40 text-xs mt-0.5">
                          {p.Tech_Stack__c.split(',').map((t) => t.trim()).slice(0, 3).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ exp, delay, onClick }: { exp: SFWorkExperience; delay: 1 | 2 | 3 | 4; onClick: () => void }) {
  const ref = useScrollAnimation(delay);
  const startLabel = formatDate(exp.Start_Date__c);
  const endLabel = exp.Is_Current__c ? 'Present' : formatDate(exp.End_Date__c);
  const initials = getInitials(exp.Company__c);
  const projects = exp.Projects__r?.records ?? [];

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="group relative overflow-hidden glass card-glow rounded-2xl border border-white/10 cursor-pointer"
      style={{ minHeight: '220px' }}
    >
      {/* Default face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A1E0]/30 to-[#032D60]/60 border border-[#00A1E0]/30 flex items-center justify-center">
          <span className="text-[#00A1E0] font-bold text-xl">{initials}</span>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-sm">{exp.Company__c ?? 'Company'}</p>
          {exp.Role__c && <p className="text-white/50 text-xs mt-0.5">{exp.Role__c}</p>}
          {exp.Is_Current__c && (
            <span className="inline-block mt-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
              Current
            </span>
          )}
        </div>
        {projects.length > 0 && (
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <span>📁</span>
            <span>{projects.length} project{projects.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Hover reveal */}
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-br from-[#00A1E0]/20 to-[#032D60]/70 backdrop-blur-sm p-5 flex flex-col gap-2 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#00A1E0]/20 border border-[#00A1E0]/30 flex items-center justify-center shrink-0">
            <span className="text-[#00A1E0] font-bold text-xs">{initials}</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{exp.Company__c ?? 'Company'}</p>
            {exp.Role__c && <p className="text-[#00A1E0] text-xs">{exp.Role__c}</p>}
          </div>
          {exp.Is_Current__c && (
            <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 shrink-0">
              Current
            </span>
          )}
        </div>

        {/* Dates */}
        {(startLabel || endLabel) && (
          <p className="text-white/50 text-xs">
            {startLabel}{startLabel && endLabel ? ' – ' : ''}{endLabel}
          </p>
        )}

        {/* Description */}
        {exp.Description__c && (
          <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{exp.Description__c}</p>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mt-1 border-t border-white/10 pt-2">
            <p className="text-[#00A1E0] text-xs font-semibold mb-1 uppercase tracking-wider">
              Projects ({projects.length})
            </p>
            <div className="flex flex-col">
              {projects.map((p) => (
                <ProjectPill key={p.Id} project={p} />
              ))}
            </div>
          </div>
        )}

        <p className="text-white/30 text-xs mt-auto text-center">Click to read more</p>
      </div>
    </div>
  );
}

export default function Experience() {
  const { data: experience, loading, error } = useSalesforce<SFWorkExperience>('experience');
  const headerRef = useScrollAnimation();
  const [selected, setSelected] = useState<SFWorkExperience | null>(null);

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
        <p className="text-white/50 text-lg">Click a company to see role &amp; projects</p>
      </div>

      {experience.length === 0 && (
        <p className="text-white/40">No experience entries found in Salesforce.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {experience.map((exp, i) => (
          <ExperienceCard
            key={exp.Id}
            exp={exp}
            delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
            onClick={() => setSelected(exp)}
          />
        ))}
      </div>

      {selected && (
        <ExperienceModal exp={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
