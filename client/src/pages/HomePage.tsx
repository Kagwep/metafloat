import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, Zap, CheckCircle, ArrowRight, Star, Globe, Lock, Award, BarChart3, ChevronDown, Wallet, User, Activity } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Link } from 'react-router-dom';


const MetaSenseHomepage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { address } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
    const [showDropdown, setShowDropdown] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    const truncate = (addr) => addr.slice(0, 6) + '...' + addr.slice(-4)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 1000)
  }
  // Mock wallet connection
  const connectWallet = async () => {
    try {
      const mockAddress = '0x1234...5678';
      setWalletAddress(mockAddress);
      setWalletConnected(true);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const features = [
    {
      icon: Shield,
      title: "Proof of Humanity",
      description: "MetaMask card ownership = KYC'd real person",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Behavioral Reputation",
      description: "Spending patterns reveal reliability and sophistication",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Composable Identity",
      description: "One MetaSense ID works across all DeFi protocols",
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
      icon: TrendingUp,
      title: "Lending & Borrowing",
      description: "Dynamic LTV ratios and risk-adjusted rates based on reputation",
      benefits: ["Up to 85% LTV", "Reduced rates", "Faster approvals"]
    },
    {
      icon: Award,
      title: "Governance & DAOs",
      description: "Sybil-resistant voting with reputation-weighted governance",
      benefits: ["One human, one vote", "Weighted governance", "Trust delegation"]
    },
    {
      icon: Star,
      title: "Airdrops & Distribution",
      description: "Fair token distribution to verified humans only",
      benefits: ["Anti-farming", "Bonus allocations", "Real community"]
    }
  ];

  const trustLevels = [
    { name: "Bronze", range: "0-199", color: "bg-amber-600", benefits: "Standard access" },
    { name: "Silver", range: "200-499", color: "bg-gray-400", benefits: "2-5% fee reduction" },
    { name: "Gold", range: "500-799", color: "bg-yellow-500", benefits: "15% benefits + governance" },
    { name: "Platinum", range: "800-1000", color: "bg-purple-600", benefits: "25% benefits + premium access" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            <Link to='/'>
            <span className="text-xl font-bold text-white">MetaSense</span>
            </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-slate-300 hover:text-white transition-colors">Home</a>
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#use-cases" className="text-slate-300 hover:text-white transition-colors">Use Cases</a>
              <Link to='/reputation'>
              <a href="#reputation" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Reputation</span>
              </a>
              </Link>
              {/* <a href="#docs" className="text-slate-300 hover:text-white transition-colors">Docs</a> */}
              
                 <div className="relative inline-block text-left">
    {address ? (
        <div className="flex items-center space-x-3 bg-white border px-4 py-2 rounded-lg shadow">
            <span className="font-mono text-sm text-gray-800">{truncate(address)}</span>

            <button
                onClick={handleCopy}
                className="text-sm text-blue-500 hover:underline"
            >
                {copySuccess ? 'Copied!' : 'Copy'}
            </button>

            <button
                onClick={() => disconnect()}
                className="text-sm text-red-500 hover:underline"
            >
                Disconnect
            </button>
        </div>
    ) : (
        <div>
            <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 flex items-center space-x-2 shadow-lg overflow-hidden group"
            >
                <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Connect Wallet</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                <svg 
                    className={`w-4 h-4 transition-all duration-300 group-hover:translate-y-0.5 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDropdown && (
                <div className="absolute mt-3 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-gray-200 z-20 overflow-hidden border border-gray-100 animate-[fadeInUp_0.2s_ease-out] origin-top-right">
                    <style jsx>{`
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateY(-10px) scale(0.95);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }
                    `}</style>
                    <div className="bg-gradient-to-r from-cyan-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">Choose Wallet</h3>
                        <p className="text-xs text-gray-600 mt-1">Select your preferred wallet to connect</p>
                    </div>
                    
                    <div className="py-2">
                        {connectors.map((connector, index) => (
                            <button
                                key={connector.uid}
                                onClick={() => {
                                    connect({ connector })
                                    setShowDropdown(false)
                                }}
                                className="group w-full text-left px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 hover:cursor-pointer transition-all duration-300 flex items-center space-x-3 border-b border-gray-50 last:border-b-0 relative overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'slideInLeft 0.3s ease-out forwards'
                                }}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-cyan-200 group-hover:to-purple-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-md">
                                    <Wallet className="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-300" />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 group-hover:text-gray-800 group-hover:translate-x-1 transition-all duration-300">
                                        {connector.name}
                                    </div>
                                    <div className="text-xs text-gray-500 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 delay-75">
                                        Connect with {connector.name.toLowerCase()}
                                    </div>
                                </div>
                                
                                <svg 
                                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                
                                {/* Hover shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                        <style jsx>{`
                            @keyframes slideInLeft {
                                from {
                                    opacity: 0;
                                    transform: translateX(-20px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0);
                                }
                            }
                        `}</style>
                        <p className="text-xs text-gray-500 text-center">
                            Make sure you have your wallet extension installed
                        </p>
                    </div>
                </div>
            )}
        </div>
    )}
</div>

            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-2 mb-8 border border-slate-700">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-slate-300 text-sm">Development Phase • Linea Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Decentralized Identity
              </span>
              <br />
              <span className="text-slate-200">for DeFi</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform MetaMask card spending data into verifiable on-chain identity and reputation. 
              Build trust, eliminate bots, and unlock reputation-based benefits across the entire DeFi ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={connectWallet}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-2xl"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
              <button className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-slate-500 hover:text-white transition-all duration-300 flex items-center space-x-2">
                <span>Read Docs</span>
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
              Built on proven MetaMask card data to create the most reliable identity layer in DeFi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <h2 className="text-4xl font-bold text-white mb-4">Trust Levels</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Earn better benefits as your reputation grows from Bronze to Platinum
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
              Unlock new possibilities across the DeFi ecosystem with verified identity and reputation
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
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Build the Future of DeFi?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join the MetaSense ecosystem and help create a more trusted, human-centric DeFi experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                Start Integration
              </button>
              <button className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-slate-500 hover:text-white transition-all duration-300">
                View Documentation
              </button>
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
              <span className="text-xl font-bold text-white">MetaSense Protocol</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Discord</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Docs</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2025 MetaSense Protocol. Built with ❤️ for the DeFi community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MetaSenseHomepage;