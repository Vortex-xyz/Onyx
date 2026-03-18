import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);

  // Redirect authenticated users to home
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current && !isTransitioning) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTransitioning]);

  // ✨ DOMAIN EXPANSION ANIMATION
  const handleEnter = () => {
    setIsTransitioning(true);
    
    // Navigate after animation completes
    setTimeout(() => {
      navigate('/login');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Domain Expansion Transition Overlay */}
      {isTransitioning && (
        <>
          {/* Radial expanding circle */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="absolute w-0 h-0 bg-purple-600/30 rounded-full animate-domain-expand" />
            <div className="absolute w-0 h-0 bg-violet-600/20 rounded-full animate-domain-expand-delayed" />
          </div>

          {/* Vertical slice effects */}
          <div className="fixed inset-0 z-[101] flex pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-purple-600/80 animate-slice-in"
                style={{
                  animationDelay: `${i * 0.03}s`,
                  transform: 'scaleY(0)',
                }}
              />
            ))}
          </div>

          {/* Power-up flash */}
          <div className="fixed inset-0 z-[99] bg-white animate-power-flash" />

          {/* Domain text reveal */}
          <div className="fixed inset-0 z-[102] flex items-center justify-center pointer-events-none">
            <div className="text-center animate-domain-text">
              <div className="text-6xl font-black text-white mb-4 opacity-0 animate-text-fade-in">
                DOMAIN EXPANSION
              </div>
              <div className="text-3xl font-light text-purple-300 opacity-0 animate-text-fade-in-delayed">
                Onyx Sanctum
              </div>
            </div>
          </div>

          {/* Particle effects */}
          <div className="fixed inset-0 z-[98] pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-particle-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Mouse-reactive background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] transition-transform duration-700 ease-out"
          style={{
            top: '20%',
            left: '10%',
            transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)`,
            opacity: isTransitioning ? 0 : 1,
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[150px] transition-transform duration-1000 ease-out"
          style={{
            bottom: '10%',
            right: '20%',
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
            opacity: isTransitioning ? 0 : 1,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`relative z-10 flex justify-between items-center px-8 py-6 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">O</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">ONYX</h1>
            <p className="text-[7px] text-gray-500 tracking-widest uppercase -mt-0.5">Network</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg transition-all duration-300 font-medium text-sm"
        >
          Enter
        </button>
      </nav>

      {/* Hero Section */}
      <div 
        ref={heroRef}
        className={`relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 
              className="text-7xl md:text-8xl font-black tracking-tight leading-none"
              style={{
                transform: `perspective(1000px) rotateX(${mousePos.y * -2}deg) rotateY(${mousePos.x * 2}deg)`
              }}
            >
              Onyx{' '}
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Network
              </span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-light text-gray-300 tracking-wide">
              A network for elite ball knowers
            </h2>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              If you know, you know. If you don't, you{' '}
              <span className="text-purple-400">don't</span>.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center space-y-6 pt-8">
            <button
              onClick={handleEnter}
              disabled={isTransitioning}
              className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Step into the Ring</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <p className="text-gray-600 text-sm">
              No malarkey. No mid takes. Just peak.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section - Minimal */}
      <div className={`relative z-10 py-32 px-6 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16">
            <div 
              className="group cursor-pointer"
              style={{
                transform: `translateY(${mousePos.y * -10}px)`
              }}
            >
              <div className="space-y-4">
                <div className="w-12 h-1 bg-purple-600 group-hover:w-24 transition-all duration-500" />
                <h3 className="text-2xl font-bold">Share Your POV</h3>
                <p className="text-gray-400 leading-relaxed">
                  Post your takes, clips, and moments. Image and video support included.
                </p>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              style={{
                transform: `translateY(${mousePos.y * -15}px)`
              }}
            >
              <div className="space-y-4">
                <div className="w-12 h-1 bg-violet-600 group-hover:w-24 transition-all duration-500" />
                <h3 className="text-2xl font-bold">Build Your Circle</h3>
                <p className="text-gray-400 leading-relaxed">
                  Follow the real ones. Connect with those who actually understand the craft.
                </p>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              style={{
                transform: `translateY(${mousePos.y * -20}px)`
              }}
            >
              <div className="space-y-4">
                <div className="w-12 h-1 bg-purple-600 group-hover:w-24 transition-all duration-500" />
                <h3 className="text-2xl font-bold">No Casual Energy</h3>
                <p className="text-gray-400 leading-relaxed">
                  For those who see the vision. The rest can stay on the bench.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className={`relative z-10 py-32 px-6 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="space-y-8"
            style={{
              transform: `scale(${1 + Math.abs(mousePos.x) * 0.02})`
            }}
          >
            <p className="text-4xl md:text-5xl font-light italic text-gray-300 leading-relaxed">
              "Throughout Server and your Wifi,{' '}
              <span className="text-purple-400 font-medium">I alone am the honored one</span>"
            </p>
            <p className="text-gray-600 text-sm">
              — You know who said it.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className={`relative z-10 py-32 px-6 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-6xl font-black leading-tight">
            Step in
            <br />
            and you might get Isekai'd
          </h2>

          <button
            onClick={handleEnter}
            disabled={isTransitioning}
            className="group relative px-16 py-5 bg-white text-black rounded-xl font-bold text-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">Join ONYX</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold transition-opacity duration-300">
              Let's go
            </span>
          </button>

          <p className="text-gray-600 text-sm">
            Join the network • Free forever
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`relative z-10 py-8 px-6 border-t border-white/5 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center text-gray-600 text-sm">
          <div>
            <span className="font-bold text-white">ONYX</span> © 2026
          </div>
          <div className="flex space-x-8">
            <button className="hover:text-white transition-colors">About</button>
            <button className="hover:text-white transition-colors">Terms</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 3s;
        }

        /* Domain Expansion Animations */
        @keyframes domain-expand {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 200vw; height: 200vw; opacity: 0; }
        }

        @keyframes domain-expand-delayed {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 180vw; height: 180vw; opacity: 0; }
        }

        @keyframes slice-in {
          0% { transform: scaleY(0); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0); }
        }

        @keyframes power-flash {
          0% { opacity: 0; }
          10% { opacity: 0.8; }
          20% { opacity: 0; }
          30% { opacity: 0.6; }
          40% { opacity: 0; }
          100% { opacity: 0; }
        }

        @keyframes text-fade-in {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0; transform: scale(0.5); }
          70% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes text-fade-in-delayed {
          0% { opacity: 0; transform: translateY(20px); }
          60% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes particle-float {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tx, 100px), var(--ty, -100px)) scale(1); opacity: 0; }
        }

        .animate-domain-expand {
          animation: domain-expand 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-domain-expand-delayed {
          animation: domain-expand-delayed 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
        }

        .animate-slice-in {
          animation: slice-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-power-flash {
          animation: power-flash 1s ease-out forwards;
        }

        .animate-domain-text {
          animation: none;
        }

        .animate-text-fade-in {
          animation: text-fade-in 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-text-fade-in-delayed {
          animation: text-fade-in-delayed 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-particle-float {
          animation: particle-float 1.5s ease-out forwards;
          --tx: ${Math.random() * 200 - 100}px;
          --ty: ${Math.random() * 200 - 100}px;
        }
      `}</style>
    </div>
  );
}
