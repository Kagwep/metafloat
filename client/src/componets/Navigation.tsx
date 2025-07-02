import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, Zap, CheckCircle, ArrowRight, Star, Globe, Lock, Award, BarChart3, ChevronDown, Wallet, User, Activity, DollarSign } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Link } from 'react-router-dom';
import { ChainSwitcher } from './switchNetwork';

const Navigation = () => {
      const [isScrolled, setIsScrolled] = useState(false);
      const [activeFeature, setActiveFeature] = useState(0);
      const { address } = useAccount()
      const { connectors, connect } = useConnect()
      const { disconnect } = useDisconnect()
      const [showDropdown, setShowDropdown] = useState(false)
      const [copySuccess, setCopySuccess] = useState(false)

const truncate = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4)

    const handleCopy = () => {
        navigator.clipboard.writeText(address as `0x${string}` )
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 1000)
    }

  return (
    <div>
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
                <span className="text-xl font-bold text-white">MetaFloat</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to='/advance'>
                <span className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer">
                  <DollarSign className="w-4 h-4" />
                  <span>Advance</span>
                </span>
              </Link>
                            <Link to='/reputation'>
                <span className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Reputation</span>
                </span>
              </Link>
              <div className="relative inline-block text-left">
                {address ? (
                  <div className="flex items-center space-x-3 bg-white border px-4 py-2 rounded-lg shadow">
                    <span className="font-mono text-sm text-gray-800">{truncate(address)}</span>
                    <button
                      onClick={handleCopy}
                      className="text-sm text-blue-500 hover:underline hover:cursor-pointer"
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => disconnect()}
                      className="text-sm text-red-500 hover:underline hover:cursor-pointer"
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
                              
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
                            </button>
                          ))}
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 text-center">
                            Make sure you have your wallet extension installed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <ChainSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navigation