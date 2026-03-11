import { useSalesforce } from '../hooks/useSalesforce';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { SFSkill } from '../types/salesforce';

const LEVEL_COLOR: Record<string, string> = {
  Expert:        'text-emerald-400',
  Advanced:      'text-[#00A1E0]',
  Intermediate:  'text-yellow-400',
  Beginner:      'text-white/50',
};

const SKILL_ICONS: Record<string, string> = {
  Apex:         '⚡',
  LWC:          '🌩️',
  Flow:         '🔀',
  SOQL:         '🔍',
  Visualforce:  '🖥️',
  Integration:  '🔗',
  CPQ:          '💰',
  Marketing:    '📣',
  Service:      '🎧',
  Sales:        '📈',
  Agentforce:   '🤖',
  Einstein:     '🧠',
  MuleSoft:     '🔌',
  Tableau:      '📊',
  Slack:        '💬',
};

function getIcon(name: string): string {
  for (const [key, icon] of Object.entries(SKILL_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '☁️';
}

function SkillCard({ skill, delay }: { skill: SFSkill; delay: 1 | 2 | 3 | 4 }) {
  const ref = useScrollAnimation(delay);
  const tags = skill.Tags__c ? skill.Tags__c.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const levelColor = LEVEL_COLOR[skill.Level__c ?? ''] ?? 'text-white/50';
  const icon = getIcon(skill.Name);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden glass card-glow rounded-2xl border border-white/10 cursor-pointer"
      style={{ minHeight: '180px' }}
    >
      {/* Default face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
        <div className="w-14 h-14 rounded-2xl bg-[#00A1E0]/10 border border-[#00A1E0]/20 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">{skill.Name}</p>
          {skill.Level__c && (
            <p className={`text-xs mt-0.5 font-medium ${levelColor}`}>{skill.Level__c}</p>
          )}
        </div>
        {/* Mini progress bar */}
        {skill.Percent__c != null && (
          <div className="w-3/4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00A1E0] rounded-full transition-all"
              style={{ width: `${skill.Percent__c}%` }}
            />
          </div>
        )}
      </div>

      {/* Hover reveal */}
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-br from-[#00A1E0]/20 to-[#032D60]/60 backdrop-blur-sm p-5 flex flex-col justify-center gap-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-white font-bold text-sm">{skill.Name}</span>
        </div>

        {skill.Level__c && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${levelColor}`}>{skill.Level__c}</span>
            {skill.Percent__c != null && (
              <span className="text-white/40 text-xs">{skill.Percent__c}%</span>
            )}
          </div>
        )}

        {skill.Percent__c != null && (
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00A1E0] rounded-full"
              style={{ width: `${skill.Percent__c}%` }}
            />
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/10 text-white/70 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Skills() {
  const { data: skills, loading, error } = useSalesforce<SFSkill>('skills');
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
        <p className="text-red-400">Failed to load skills: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headerRef} className="mb-14">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#00A1E0] text-sm font-medium uppercase tracking-widest">⚡ Expertise</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-3">Skills</h1>
        <p className="text-white/50 text-lg">Hover a badge to see details</p>
      </div>

      {skills.length === 0 && (
        <p className="text-white/40">No skills found in Salesforce.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {skills.map((s, i) => (
          <SkillCard key={s.Id} skill={s} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} />
        ))}
      </div>
    </main>
  );
}
