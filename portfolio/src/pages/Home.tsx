import { Link } from 'react-router-dom';
import { useSalesforce } from '../hooks/useSalesforce';
import type { SFPortfolio } from '../types/salesforce';

function PortfolioCard({ portfolio }: { portfolio: SFPortfolio }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow">
      <h3 className="text-base font-semibold text-gray-900 mb-2">{portfolio.Name}</h3>
      {portfolio.Profile_Summary__c && (
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">{portfolio.Profile_Summary__c}</p>
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

export default function Home() {
  const { data: portfolios } = useSalesforce<SFPortfolio>('projects');
  const featured = portfolios.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Hi, I'm a Developer
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto">
          I build things for the web. Here's some of my work.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/projects"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            View Projects
          </Link>
          <Link
            to="/contact"
            className="border border-gray-300 hover:border-blue-400 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Contact Me
          </Link>
        </div>
      </section>

      {/* Featured projects */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Work</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PortfolioCard key={p.Id} portfolio={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
