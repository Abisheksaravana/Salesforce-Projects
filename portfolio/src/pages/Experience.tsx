import { useSalesforce } from '../hooks/useSalesforce';
import type { SFWorkExperience } from '../types/salesforce';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ExperienceCard({ exp }: { exp: SFWorkExperience }) {
  const startLabel = formatDate(exp.Start_Date__c);

  return (
    <div className="relative pl-8 pb-10 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-0 top-1 bottom-0 w-px bg-gray-200" />
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-blue-600 -translate-x-[3px]" />

      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
          <div>
            {exp.Role__c && (
              <h3 className="text-lg font-semibold text-gray-900">{exp.Role__c}</h3>
            )}
            {exp.Company__c && (
              <span className="text-blue-600 font-medium">{exp.Company__c}</span>
            )}
          </div>
          {startLabel && (
            <span className="text-sm text-gray-500">{startLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const { data: experience, loading, error } = useSalesforce<SFWorkExperience>('experience');

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
        <p className="text-red-600">Failed to load experience: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Experience</h1>
      <p className="text-gray-500 mb-12">My professional journey</p>
      {experience.length === 0 && (
        <p className="text-gray-500">No experience entries found.</p>
      )}
      <div>
        {experience.map((exp) => (
          <ExperienceCard key={exp.Id} exp={exp} />
        ))}
      </div>
    </main>
  );
}
