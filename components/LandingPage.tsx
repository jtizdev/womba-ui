import React, { useState, useEffect } from 'react';
import { WombaIcon } from './icons';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Generation',
      description: 'Generate comprehensive test cases using advanced AI models that understand your product context'
    },
    {
      icon: '📚',
      title: 'Context-Aware Testing',
      description: 'Leverages RAG to learn from your existing tests, documentation, and Jira stories'
    },
    {
      icon: '🔗',
      title: 'Seamless Integration',
      description: 'Direct integration with Jira and Zephyr Scale for effortless test management'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Generate complete test plans in seconds, not hours'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`max-w-6xl w-full relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className={`transition-all duration-1000 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <div className="relative">
                <WombaIcon className="w-32 h-32 text-indigo-500" />
                <div className="absolute inset-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
          
          <h1 className={`text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Welcome to Womba
          </h1>
          
          <p className={`text-2xl md:text-3xl text-slate-300 mb-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            AI-Powered Test Case Generation Platform
          </p>
          
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Transform your testing workflow with intelligent test generation that understands your product, learns from your context, and delivers comprehensive test coverage automatically.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${500 + index * 100}ms` }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className={`bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-slate-700/50 mb-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            How Womba Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500">
                <span className="text-2xl font-bold text-indigo-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Connect Your Context</h3>
              <p className="text-sm text-slate-400">
                Index your Jira stories, existing tests, documentation, and API specs into our intelligent RAG system
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-500">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Generate Test Plans</h3>
              <p className="text-sm text-slate-400">
                Select a Jira story and let AI generate comprehensive test cases with detailed steps, preconditions, and validations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pink-500">
                <span className="text-2xl font-bold text-pink-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Upload to Zephyr</h3>
              <p className="text-sm text-slate-400">
                Review, edit, and upload your test cases directly to Zephyr Scale with intelligent folder organization
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center space-x-3 px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white font-bold text-xl shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Enter Womba</span>
            <svg className="relative w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <p className="mt-6 text-sm text-slate-500">
            Powered by PlainID • Built with ❤️ for QA Engineers
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

