import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, Zap, CheckCircle, ArrowRight, Star, Globe, Lock, Award, BarChart3, ChevronDown, Wallet, User, Activity, DollarSign } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Link } from 'react-router-dom';
import Navigation from '../componets/Navigation';

const MetaFloatHomepage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { address } = useAccount()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const features = [
    {
      icon: BarChart3,
      title: "Behavioral Reputation",
      description: "Spending patterns reveal reliability and sophistication",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: DollarSign,
      title: "Micro Lending",
      description: "Uncollateralized loans based on reputation scores",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Sybil Resistance",
      description: "Human verification eliminates bot attacks and fake accounts",
      color: "from-orange-500 to-red-500"
    }
  ];

  const useCases = [
    {
      icon: DollarSign,
      title: "Cash Advances",
      description: "Instant micro-loans based on your MetaFloat reputation score",
      benefits: ["$50-$1000 loans", "6-15% APR", "No collateral needed"]
    },
    {
      icon: TrendingUp,
      title: "Lending & Borrowing",
      description: "Dynamic rates and limits based on behavioral reputation",
      benefits: ["Reputation-based rates", "Progressive limits", "Instant approval"]
    },
    {
      icon: Award,
      title: "Governance & DAOs",
      description: "Sybil-resistant voting with reputation-weighted governance",
      benefits: ["One human, one vote", "Weighted governance", "Trust delegation"]
    }
  ];

  const trustLevels = [
    { name: "Bronze", range: "0-399", color: "bg-amber-600", benefits: "Up to $50 • 1% APR" },
    { name: "Silver", range: "400-599", color: "bg-gray-400", benefits: "Up to $200 • 1% APR" },
    { name: "Gold", range: "600-849", color: "bg-yellow-500", benefits: "Up to $1000 • 1% APR" },
    { name: "Platinum", range: "850-1000", color: "bg-purple-600", benefits: "Up to $1000 • 1% APR" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <Navigation />
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-2 mb-8 border border-slate-700">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-slate-300 text-sm">Development Phase • Linea sepolia Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Decentralized Reputation
              </span>
              <br />
              <span className="text-slate-200">and Borrowing</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform MetaMask card spending data into verifiable on-chain reputation. 
              Get instant micro-loans without collateral based on your behavioral patterns and trust score.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/advance">
                <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-2xl">
                  <DollarSign className="w-5 h-5" />
                  <span>Get Cash Advance</span>
                </button>
              </Link>
              <button className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-slate-500 hover:text-white transition-all duration-300 flex items-center space-x-2">
                <span>Learn More</span>
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Revolutionary Features</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Built on proven MetaMask card data to create the most reliable reputation-based lending in DeFi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 transform hover:scale-105 hover:bg-slate-800/70 group"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Levels Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loan Tiers</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Earn better loan terms as your reputation grows from Bronze to Platinum
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustLevels.map((level, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                  <h3 className="text-lg font-bold text-white">{level.name}</h3>
                </div>
                <div className="text-sm text-slate-400 mb-2">Score: {level.range}</div>
                <div className="text-slate-300">{level.benefits}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Use Cases</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Unlock new financial opportunities with verified reputation and behavioral scoring
            </p>
          </div>
          
          <div className="space-y-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                      <useCase.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{useCase.title}</h3>
                      <p className="text-slate-300 max-w-md">{useCase.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <span key={benefitIndex} className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm border border-slate-600">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-12 rounded-3xl border border-slate-600 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Access Instant Credit?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join MetaFloat and experience reputation-based lending with no collateral required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/advance">
                <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                  Get Your First Advance
                </button>
              </Link>
              <Link to="/reputation">
                <button className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-slate-500 hover:text-white transition-all duration-300">
                  Check Your Reputation
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MetaFloat </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Discord</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Docs</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2025 MetaFloat Protocol. Built with ❤️ for the DeFi community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MetaFloatHomepage;