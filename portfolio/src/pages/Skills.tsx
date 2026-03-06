import { useSalesforce } from '../hooks/useSalesforce';
import type { SFSkill } from '../types/salesforce';

function SkillBadge({ skill }: { skill: SFSkill }) {
  const tags = skill.Tags__c ? skill.Tags__c.split(',').map((t) => t.trim()).filter(Boolean) : [];
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:shadow-sm transition-shadow">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-900">{skill.Name}</span>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {skill.Percent__c != null && (
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${skill.Percent__c}%` }}
            />
          </div>
        )}
        {skill.Level__c && (
          <span className="text-xs text-gray-500 whitespace-nowrap">{skill.Level__c}</span>
        )}
      </div>
    </div>
  );
}

export default function Skills() {
  const { data: skills, loading, error } = useSalesforce<SFSkill>('skills');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Failed to load skills: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Skills</h1>
      <p className="text-gray-500 mb-12">Technologies and tools I work with</p>
      {skills.length === 0 && (
        <p className="text-gray-500">No skills found.</p>
      )}
      <div className="flex flex-col gap-2">
        {skills.map((s) => (
          <SkillBadge key={s.Id} skill={s} />
        ))}
      </div>
    </main>
  );
}
