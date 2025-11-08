import React, { useState, useEffect } from 'react';
import { WombaIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const features = [
    {
      title: 'AI-Powered Generation',
      description: 'Generate comprehensive test cases using advanced AI models that understand your product context',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: 'Context-Aware Testing',
      description: 'Leverages RAG to learn from your existing tests, documentation, and Jira stories',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: 'Seamless Integration',
      description: 'Direct integration with Jira and Zephyr Scale for effortless test management',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      title: 'Lightning Fast',
      description: 'Generate complete test plans in seconds, not hours',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12 transition-colors duration-300 relative">
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      <div className={`max-w-6xl w-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <WombaIcon className="w-20 h-20 text-indigo-600 dark:text-indigo-500" />
            </div>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            The AI-Powered Test Generation Platform
          </h1>
          
          <p className={`text-xl text-slate-600 dark:text-slate-400 mb-3 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Transform your testing workflow with intelligent test generation
          </p>
          
          <p className={`text-base text-slate-500 dark:text-slate-500 max-w-xl mx-auto transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Understand your product, learn from context, and deliver comprehensive test coverage automatically
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${500 + index * 100}ms` }}
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">{feature.icon}</div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className={`bg-white dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl p-10 border border-slate-200 dark:border-slate-700/50 mb-16 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">
            How Womba Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30" style={{ top: '32px' }}></div>
            
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Your Context</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Index your Jira stories, existing tests, documentation, and API specs
              </p>
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">Generate Test Plans</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Select a Jira story and let AI generate comprehensive test cases with detailed steps
              </p>
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-pink-500/20">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">Upload to Zephyr</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Review, edit, and upload your test cases directly to Zephyr Scale
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className={`text-center transition-all duration-700 delay-900 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <button
            onClick={login}
            className="group inline-flex items-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-600">
            Powered by PlainID · Built for QA Engineers
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
