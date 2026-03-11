import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloud, FaCode, FaProjectDiagram, FaRobot, FaGithub, FaCertificate, FaBriefcase } from 'react-icons/fa';
import AgentforceChat from './AgentforceChat';

const sectionData = {
  Projects: [
    {
      title: 'CRM Implementation',
      subtitle: 'Enterprise Salesforce Setup',
      description:
        'Led an end-to-end Salesforce CRM implementation for a mid-size enterprise. Configured custom objects, validation rules, and approval processes. Built automated flows to streamline the sales pipeline, reducing manual data entry by 60% and improving lead conversion by 40%.',
      tags: ['Apex', 'LWC', 'Flow', 'Sales Cloud'],
    },
    {
      title: 'Einstein AI Integration',
      subtitle: 'Predictive Lead Scoring',
      description:
        'Integrated Salesforce Einstein AI to deliver predictive lead scoring and opportunity insights. Developed Einstein Analytics dashboards that surface real-time KPIs for the sales team, enabling data-driven decisions and shortening deal cycles.',
      tags: ['Einstein AI', 'Analytics', 'REST API', 'Apex'],
    },
    {
      title: 'Agentforce Chatbot',
      subtitle: 'AI-Powered Service Bot',
      description:
        'Designed and deployed an Agentforce-powered intelligent chatbot to handle Tier-1 customer queries, automate case creation, and route escalations to the right agents. Integrated with Salesforce Service Cloud for seamless handoff and full case visibility.',
      tags: ['Agentforce', 'Service Cloud', 'LWC', 'Apex'],
    },
  ],
  Experiences: [
    {
      title: 'Salesforce Developer',
      subtitle: 'Current Role · 2024 – Present',
      description:
        'Building enterprise Salesforce solutions using Lightning Web Components, Apex triggers, and declarative tools like Flow and Process Builder. Collaborating with architects and business analysts to translate requirements into scalable Salesforce implementations.',
      tags: ['LWC', 'Apex', 'Flow', 'Service Cloud'],
    },
    {
      title: 'Salesforce Intern',
      subtitle: 'Internship · 2023 – 2024',
      description:
        'Worked on configuring Salesforce orgs, writing Apex unit tests, and developing small Lightning components. Gained hands-on experience with SOQL, data loading, and sandbox management while contributing to live client projects.',
      tags: ['Apex', 'SOQL', 'Admin', 'Sandbox'],
    },
    {
      title: 'Freelance Consultant',
      subtitle: 'Independent · 2022 – 2023',
      description:
        'Delivered Salesforce customizations for small businesses including custom report types, email templates, and simple Apex automations. Managed requirements gathering, configuration, UAT, and go-live support independently.',
      tags: ['Sales Cloud', 'Reports', 'Email Templates', 'Apex'],
    },
  ],
};

const TAG_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-indigo-100 text-indigo-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-rose-100 text-rose-700',
];

function ExpandableCards({ items, pageIcon }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpandedIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (idx) => {
    setExpandedIndex(idx === expandedIndex ? null : idx);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 w-full max-w-2xl">
      {items.map((item, idx) => {
        const isExpanded = expandedIndex === idx;
        return (
          <motion.div
            key={idx}
            layout
            onClick={() => handleCardClick(idx)}
            className={`bg-white rounded-xl shadow-lg cursor-pointer overflow-hidden border-2 transition-colors duration-200 ${
              isExpanded ? 'border-blue-400' : 'border-transparent hover:border-blue-200'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
          >
            {/* Card Header — always visible */}
            <div className="flex items-center gap-4 p-5">
              <div className="shrink-0">{pageIcon}</div>
              <div className="text-left flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">{item.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
              </div>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-gray-400 text-xl shrink-0 select-none"
              >
                ▾
              </motion.span>
            </div>

            {/* Expanded content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            TAG_COLORS[tIdx % TAG_COLORS.length]
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function GenericCards({ page }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <div className="flex gap-4 items-center">
            {page.icon}
            <div className="text-left">
              <h2 className="text-xl font-bold">
                {page.title} {i}
              </h2>
              <p className="text-gray-500 text-sm">
                {page.desc} - More info {i}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export default function PortfolioIntro() {
  const [startClicked, setStartClicked] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  const cards = [
    { title: 'Clouds', icon: <FaCloud className="text-sky-500 text-5xl mb-4" />, desc: 'Information about Clouds' },
    { title: 'Skills', icon: <FaCode className="text-indigo-500 text-5xl mb-4" />, desc: 'Details about Skills' },
    { title: 'Projects', icon: <FaProjectDiagram className="text-green-500 text-5xl mb-4" />, desc: 'Showcase of Projects' },
    { title: 'Experiences', icon: <FaBriefcase className="text-orange-500 text-5xl mb-4" />, desc: 'Work Experiences' },
    { title: 'AI', icon: <FaRobot className="text-purple-500 text-5xl mb-4" />, desc: 'AI-related info' },
    { title: 'Github', icon: <FaGithub className="text-gray-800 text-5xl mb-4" />, desc: 'GitHub repositories' },
    { title: 'Certificates', icon: <FaCertificate className="text-yellow-500 text-5xl mb-4" />, desc: 'Certifications list' },
  ];

  const handleBack = () => {
    setSelectedPage(null);
    setShowCards(true);
  };

  const hasSectionData = selectedPage && sectionData[selectedPage.title];

  // Icon to pass into expandable cards (smaller size)
  const smallIcon = selectedPage
    ? { ...selectedPage.icon, props: { ...selectedPage.icon?.props, className: selectedPage.icon?.props?.className?.replace('text-5xl mb-4', 'text-3xl') } }
    : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-300 to-sky-600 flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/5f/Salesforce.com_logo.svg')] bg-center bg-no-repeat bg-contain opacity-10 pointer-events-none" />

      {/* Intro screen */}
      {!showCards && !selectedPage && (
        <>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl font-extrabold text-white drop-shadow-lg mb-2"
          >
            Abishek S B
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg text-white mb-6"
          >
            Let's start our journey! Please click on Start — I'll take you to the next step.
          </motion.p>
          <AnimatePresence>
            {!startClicked && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ rotate: 360 }}
                exit={{ opacity: 0, scale: 10 }}
                transition={{ duration: 1 }}
                onClick={() => setStartClicked(true)}
                className="px-10 py-6 bg-yellow-400 text-2xl font-bold rounded-full shadow-lg border-4 border-yellow-600 hover:shadow-2xl"
              >
                START
              </motion.button>
            )}
          </AnimatePresence>
          {startClicked && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 20, opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 bg-gradient-to-b from-purple-900 to-black"
              onAnimationComplete={() => setShowCards(true)}
            />
          )}
        </>
      )}

      {/* Cards grid */}
      {showCards && !selectedPage && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl cursor-pointer flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 200 }}
              onClick={() => { setSelectedPage(card); setShowCards(false); }}
            >
              {card.icon}
              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Section detail view */}
      {selectedPage && (
        <div className="flex flex-col items-center p-6 w-full max-h-screen overflow-y-auto">
          <div className="flex items-center gap-6 mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/76/Salesforce.com_logo.svg"
              alt="Salesforce Avatar"
              className="w-20 h-20 rounded-full bg-white p-2 shadow"
            />
            <h1 className="text-3xl font-bold text-white drop-shadow">{selectedPage.title}</h1>
          </div>

          {hasSectionData ? (
            <ExpandableCards
              items={sectionData[selectedPage.title]}
              pageIcon={smallIcon}
            />
          ) : (
            <GenericCards page={selectedPage} />
          )}

          <button
            onClick={handleBack}
            className="mt-6 mb-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg shadow hover:bg-yellow-500"
          >
            Back
          </button>
        </div>
      )}

      <AgentforceChat />
    </div>
  );
}
