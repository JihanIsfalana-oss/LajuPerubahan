import React, { useState, useEffect } from 'react';
import { Music, Mic2, Drum, Guitar, Instagram, Menu, X, MapPin, Phone, ExternalLink, ZoomIn } from 'lucide-react';
import logoEmas from './logolp.png';
import fotoBand1 from './foto1.jpg';
import fotoBand2 from './foto2.jpg';
import fotoBand3 from './foto3.JPG';

const LajuPerubahanWeb = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const bandPhotos = [fotoBand1, fotoBand2, fotoBand3];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % bandPhotos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bandPhotos.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const query = `
          {
            getAllMembers {
              name, role, description, instagram
            }
          }
        `;
        const response = await fetch('http://localhost:8080/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) throw new Error("Server Error");
        const result = await response.json();
        
        if (result.data && result.data.getAllMembers) {
          const mappedMembers = result.data.getAllMembers.map(p => ({
            name: p.name,
            role: p.role,
            desc: p.description,
            instagram: p.instagram,
            icon: getIconByRole(p.role)
          }));
          setMembers(mappedMembers);
        }
      } catch (err) {
        setMembers([
            { name: "Liam", role: "Lead Vocal", desc: "The Gallagherr", instagram: "https://www.instagram.com/gallaaagherr", icon: <Mic2 className="w-10 h-10" /> },
            { name: "Ernest", role: "Gitaris", desc: "Ernest Maarteens", instagram: "https://www.instagram.com/ernesstwn", icon: <Guitar className="w-10 h-10" /> },
            { name: "Falan", role: "Drummer", desc: "Mr. JayBeat", instagram: "https://www.instagram.com/flnisfalana", icon: <Drum className="w-10 h-10" /> },
            { name: "Yurika", role: "Bassist & Vocal 2", desc: "The Angel Of Laju Perubahan", instagram: "https://www.instagram.com/yurikarmdhni", icon: <Music className="w-10 h-10" /> }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const getIconByRole = (role) => {
    const r = role.toLowerCase();
    if (r.includes('vocal')) return <Mic2 className="w-10 h-10" />;
    if (r.includes('gitar')) return <Guitar className="w-10 h-10" />;
    if (r.includes('drum')) return <Drum className="w-10 h-10" />;
    return <Music className="w-10 h-10" />;
  };

  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const customStyles = `
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeInScale {
      0% { opacity: 0; transform: scale(0.95); filter: blur(10px); }
      100% { opacity: 1; transform: scale(1); filter: blur(0); }
    }
    .animate-spin-slow {
      animation: spinSlow 3s linear infinite;
    }
    .animate-enter {
      animation: fadeInScale 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `;

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center">
        <style>{customStyles}</style>
        {/* Logo Berputar */}
        <div className="relative">
             <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
             <img src={logoEmas} alt="Loading..." className="w-32 h-32 object-contain animate-spin-slow relative z-10" />
        </div>
        <p className="mt-6 text-amber-500 text-sm tracking-[0.5em] uppercase animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500 selection:text-slate-900 overflow-x-hidden">
      <style>{customStyles}</style>

      {/* --- NAVIGATION --- */}
      <nav className={`fixed w-full z-40 transition-all duration-500 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center animate-enter">
          
          <div 
            onClick={scrollToHome}
            className="flex items-center cursor-pointer hover:scale-110 transition-transform duration-300"
            title="Back to Home"
          >
            <img src={logoEmas} alt="Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>

          <div className="hidden md:flex space-x-8 text-sm font-medium tracking-widest uppercase">
            {['Home', 'About', 'Members', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-amber-500 transition-colors duration-300 relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="md:hidden text-amber-500 cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black z-0">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-enter">
          <p className="text-amber-500 tracking-[0.5em] text-sm md:text-base mb-6 uppercase font-bold">Est. 2025</p>
          <h1 className="text-6xl md:text-9xl font-extrabold text-white mb-8 tracking-tighter leading-none uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            Laju <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700">Perubahan</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 font-light italic mb-10 border-l-4 border-amber-500 pl-6 inline-block text-left">
            "In music we live, in life always on music."
          </p>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 bg-slate-950 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-6 order-2 md:order-1 animate-enter" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-2">The <span className="text-amber-500">Story</span></h2>
              <div className="h-1 w-24 bg-amber-500 mb-8"></div>
              <p className="text-slate-400 leading-relaxed text-lg text-justify">
                Kita adalah mahasiswa/i <strong className="text-slate-200">Universitas Pancasila</strong> angkatan 2025. 
                Secara kebetulan, terdapat UKM <strong className="text-slate-200">Kipas</strong>, tempat bertemunya 4 orang ini hingga lahirnya <span className="text-amber-500 font-semibold">Laju Perubahan</span>.
              </p>
            </div>

            <div 
                className="relative order-1 md:order-2 animate-enter cursor-zoom-in group" 
                style={{ animationDelay: '0.4s' }}
                onClick={() => setActiveModal({ type: 'photo', src: bandPhotos[currentPhotoIndex] })}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-purple-600 blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 h-80 md:h-96 rounded-xl overflow-hidden border border-slate-800 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
                {bandPhotos.map((photo, index) => (
                  <img key={index} src={photo} alt="Band" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'}`} />
                ))}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- MEMBERS SECTION --- */}
      <section id="members" className="py-24 bg-slate-900 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-enter">
            <h2 className="text-4xl md:text-6xl font-bold text-white">The <span className="text-amber-500">Personnel</span></h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Click on a card to see details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((member, index) => (
              <div 
                  key={index} 
                  onClick={() => setActiveModal({ type: 'member', data: member })}
                  className="group relative bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-amber-500 transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center text-center animate-enter"
                  style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors shadow-inner">
                  {member.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{member.name}</h3>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Laju Perubahan<span className="text-amber-500">.</span></h2>
                    <p className="text-slate-500 text-sm mt-2">Est. 2025 - Universitas Pancasila</p>
                </div>

                <div className="flex flex-col gap-4 items-center md:items-end">
                    <a href="https://wa.me/628978085431" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-amber-500 transition-colors group">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold">Contact Person (Ernest)</p>
                            <p className="font-mono text-lg font-bold group-hover:underline">0897-8085-431</p>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-full border border-slate-800 group-hover:border-amber-500 transition-colors">
                            <Phone className="w-5 h-5" />
                        </div>
                    </a>

                    <a 
                        href="https://maps.app.goo.gl/univpancasila"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-300 hover:text-amber-500 transition-colors group text-right"
                    >
                         <div className="text-right max-w-xs">
                            <p className="text-xs text-slate-500 uppercase font-bold">Basecamp Address</p>
                            <p className="text-sm leading-tight group-hover:underline">Lenteng Agung, Jakarta Selatan, Indonesia</p>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-full border border-slate-800 group-hover:border-amber-500 transition-colors">
                            <MapPin className="w-5 h-5" />
                        </div>
                    </a>
                </div>
            </div>
            
            <div className="text-center pt-8 border-t border-slate-900/50">
                <p className="text-slate-700 text-xs tracking-widest uppercase">© 2025 Laju Perubahan. All Rights Reserved.</p>
            </div>
        </div>
      </footer>

      {/* --- MODAL / ZOOM OVERLAY --- */}
      {activeModal && (
        <div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-enter"
            onClick={() => setActiveModal(null)}
        >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <X className="w-10 h-10" />
            </button>

            <div 
                className="relative bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()} 
            >
                {activeModal.type === 'photo' && (
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                        <img src={activeModal.src} alt="Zoomed Band" className="w-full h-full object-cover" />
                    </div>
                )}

                {activeModal.type === 'member' && (
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                         <div className="w-40 h-40 md:w-64 md:h-64 flex-shrink-0 bg-slate-950 rounded-full flex items-center justify-center border-4 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                            <div className="scale-150 text-amber-500">
                                {activeModal.data.icon}
                            </div>
                         </div>
                         <div className="text-center md:text-left space-y-4">
                            <h2 className="text-4xl md:text-6xl font-bold text-white">{activeModal.data.name}</h2>
                            <p className="text-amber-500 text-xl font-bold uppercase tracking-widest">{activeModal.data.role}</p>
                            <div className="h-1 w-20 bg-amber-500 mx-auto md:mx-0"></div>
                            <p className="text-slate-300 text-lg leading-relaxed italic">"{activeModal.data.desc}"</p>
                            
                            <a 
                                href={activeModal.data.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold hover:scale-105 transition-transform shadow-lg"
                            >
                                <Instagram className="w-5 h-5" />
                                <span>Follow on Instagram</span>
                            </a>
                         </div>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default LajuPerubahanWeb;