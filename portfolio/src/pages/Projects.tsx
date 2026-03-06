import { useSalesforce } from '../hooks/useSalesforce';
import type { SFPortfolio } from '../types/salesforce';

function PortfolioCard({ portfolio }: { portfolio: SFPortfolio }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{portfolio.Name}</h3>
      {portfolio.Profile_Summary__c && (
        <p className="text-sm text-gray-600 mb-4 flex-1">{portfolio.Profile_Summary__c}</p>
      )}
      <div className="flex flex-col gap-1 mt-auto">
        {portfolio.Email__c && (
          <a
            href={`mailto:${portfolio.Email__c}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {portfolio.Email__c}
          </a>
        )}
        {portfolio.Phone__c && (
          <span className="text-sm text-gray-500">{portfolio.Phone__c}</span>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const { data: portfolios, loading, error } = useSalesforce<SFPortfolio>('projects');

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
        <p className="text-red-600">Failed to load projects: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Projects</h1>
      <p className="text-gray-500 mb-12">Things I have built</p>
      {portfolios.length === 0 && (
        <p className="text-gray-500">No projects found.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((p) => (
          <PortfolioCard key={p.Id} portfolio={p} />
        ))}
      </div>
    </main>
  );
}
