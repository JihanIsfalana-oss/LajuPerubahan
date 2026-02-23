import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Music, Mic2, Drum, Guitar, Instagram, Menu, X, MapPin, Phone, ZoomIn, Play, Pause, ListMusic, Sparkles, Bot, AlertCircle } from 'lucide-react';
import logoEmas from './logolp.png'; 
import fotoBand1 from './foto1.jpg';
import fotoBand2 from './foto2.jpg';
import fotoBand3 from './foto3.JPG';

const LajuPerubahanWeb = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [repertoire, setRepertoire] = useState([]);
  const [loadingRepertoire, setLoadingRepertoire] = useState(true);

  const bandPhotos = [fotoBand1, fotoBand2, fotoBand3];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio('/demo.mp3')); 

  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioResult, setAudioResult] = useState(null);
  const [audioError, setAudioError] = useState('');

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

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
    const fetchData = async () => {
      const apiUrl = 'https://isfalana-lajuperubahan-api.hf.space/graphql'; 

      try {
        const queryMembers = `{ getAllMembers { name, role, description, instagram } }`;
        const resMembers = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryMembers }),
        });

        if (resMembers.ok) {
          const result = await resMembers.json();
          if (result.data && result.data.getAllMembers) {
            const mappedMembers = result.data.getAllMembers.map(p => ({
              ...p,
              icon: getIconByRole(p.role)
            }));
            setMembers(mappedMembers);
          }
        }
      } catch (err) {
        console.error("Gagal load members:", err);
      } finally {
        setLoadingMembers(false);
      }

      try {
        const queryRepertoire = `{ getRepertoire { title, icon, songs } }`;
        const resRepertoire = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryRepertoire }),
        });

        if (resRepertoire.ok) {
          const result = await resRepertoire.json();
          if (result.data && result.data.getRepertoire) {
            setRepertoire(result.data.getRepertoire);
          }
        }
      } catch (err) {
        console.error("Gagal load repertoire:", err);
      } finally {
        setLoadingRepertoire(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateLyrics = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError('');
    setGeneratedLyrics('');

    try {
      const response = await axios.post('https://isfalana-lajuperubahan-api.hf.space/create_lyrics', {
        topic: topic,
        genre: genre
      });

      if (response.data.status === 'success') {
        setGeneratedLyrics(response.data.lyrics);
      } else {
        setAiError('Gagal membuat lirik. Coba lagi.');
      }
    } catch (err) {
      console.error(err);
      setAiError('Backend Offline? Pastikan server python app.py menyala!');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzeAudio = async (e) => {
    e.preventDefault();
    if (!audioFile) return;

    setAudioLoading(true);
    setAudioError('');
    setAudioResult(null);

    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      const response = await axios.post('https://isfalana-lajuperubahan-api.hf.space/analyze_audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setAudioResult(response.data);
      } else {
        setAudioError(response.data.message || 'Gagal menganalisis audio.');
      }
    } catch (err) {
      console.error(err);
      setAudioError('Server Error. Pastikan file tidak terlalu besar dan server menyala.');
    } finally {
      setAudioLoading(false);
    }
  };

  const getIconByRole = (role) => {
    const r = role.toLowerCase();
    if (r.includes('vocal')) return <Mic2 className="w-10 h-10" />;
    if (r.includes('gitar')) return <Guitar className="w-10 h-10" />;
    if (r.includes('drum')) return <Drum className="w-10 h-10" />;
    return <Music className="w-10 h-10" />;
  };

  const renderRepertoireIcon = (iconName) => {
    switch (iconName) {
      case 'ListMusic': return <ListMusic className="text-amber-500 w-6 h-6" />;
      case 'Guitar': return <Guitar className="text-amber-500 w-6 h-6" />;
      case 'Music': return <Music className="text-amber-500 w-6 h-6" />;
      default: return <Music className="text-amber-500 w-6 h-6" />;
    }
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
    .lyrics-scroll::-webkit-scrollbar {
      width: 8px;
    }
    .lyrics-scroll::-webkit-scrollbar-track {
      background: #1e293b; 
    }
    .lyrics-scroll::-webkit-scrollbar-thumb {
      background: #f59e0b; 
      border-radius: 4px;
    }
  `;

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center">
        <style>{customStyles}</style>
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
          
          <div onClick={scrollToHome} className="flex items-center cursor-pointer hover:scale-110 transition-transform duration-300">
            <img src={logoEmas} alt="Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>

          <div className="hidden md:flex space-x-8 text-sm font-medium tracking-widest uppercase">
            {['Home', 'About', 'Members', 'Repertoire', 'AI Lyrics', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} className="hover:text-amber-500 transition-colors duration-300 relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="md:hidden text-amber-500 cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </div>
        </div>
        {isMobileMenuOpen && (
             <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-t border-slate-800 p-4 flex flex-col space-y-4 shadow-xl">
                 {['Home', 'About', 'Members', 'Repertoire', 'AI Lyrics', 'Contact'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-bold uppercase hover:text-amber-500">
                    {item}
                  </a>
                ))}
             </div>
        )}
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
          <p className="text-lg md:text-4xl text-slate-400 font-light italic mb-10 border-l-4 border-amber-500 pl-6 inline-flex text-flex-col items-start">
            "In music we live, in life always on music."
          </p>
          <a href="#ailyrics" className="ml-8 inline-flex items-right gap-2 px-5 py-2 bg-amber-500 text-slate-900 font-bold rounded-full hover:bg-amber-700 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]">
             <Bot className="w-5 h-5"/> Coba AI Songwriter
          </a>
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
                Sebuah band yang lahir dari pertemuan tak terduga di UKM KIPAS, Universitas Pancasila. <strong className="text-slate-200">Laju Perubahan</strong> Empat mahasiswa yang berbeda jalur, namun memiliki passion yang sama, memutuskan untuk bermain musik bersama.<strong className="text-slate-200"> Berdiri pada tahun 2025</strong>, Laju Perubahan <span className="text-amber-500 font-semibold">siap menggebrak panggung musik dengan semangat!!!</span>.
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

          {loadingMembers ? (
             <div className="text-center text-amber-500 font-mono animate-pulse py-10">Memuat data personil dari Cloud...</div>
          ) : (
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
          )}
        </div>
      </section>

      {/* --- SETLIST SECTION --- */}
      <section id="repertoire" className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12 animate-enter">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our <span className="text-amber-500">Repertoire</span></h2>
                <p className="text-slate-400">Songs we love to play. Klik lagunya!</p>
            </div>

            {loadingRepertoire ? (
               <div className="text-center text-amber-500 font-mono animate-pulse py-10">Memuat setlist dari MongoDB...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {repertoire.map((category, index) => (
                      <div key={index} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-amber-500 transition-all group">
                          <div className="flex items-center gap-3 mb-4">
                              {renderRepertoireIcon(category.icon)}
                              <h3 className="text-xl font-bold text-white">{category.title}</h3>
                          </div>
                          <ul className="space-y-2 text-slate-400 text-sm">
                              {category.songs.map((song, songIndex) => (
                                  <li 
                                      key={songIndex}
                                      onClick={() => setActiveModal({ type: 'song', title: song })}
                                      className="cursor-pointer hover:text-white hover:pl-2 hover:text-amber-400 transition-all duration-300 flex items-center gap-2"
                                  >
                                      <span className="text-amber-600 text-xs">•</span> {song}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  ))}
              </div>
            )}
        </div>
      </section>

      {/* --- AI SONGWRITER SECTION --- */}
      <section id="ailyrics" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative border-t border-slate-800">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">

                <div className="w-full md:w-1/2 space-y-8 animate-enter">
                    <div>
                        
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            LP <span className="text-amber-500">Songwriter</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Buntu ide buat lagu? Biarkan Laju Perubahan membantu kamu menciptakan lirik puitis dalam hitungan detik.
                        </p>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                        
                        <form onSubmit={handleGenerateLyrics} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium text-sm uppercase tracking-wide">Judul</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Hujan di Jakarta, Kopi Senja..." 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition placeholder-slate-600"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-2 font-medium text-sm uppercase tracking-wide">Genre Musik</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                                        value={genre}
                                        onChange={(e) => setGenre(e.target.value)}
                                    >
                                        <option value="Pop">Pop</option>
                                        <option value="Rock">Rock</option>
                                        <option value="Indie Folk">Indie Folk</option>
                                        <option value="Jazz">Jazz</option>
                                        <option value="Metal">Metal</option>
                                        <option value="Dangdut">Dangdut (Experimental)</option>
                                    </select>
                                    <Music className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={aiLoading}
                                className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
                                    aiLoading 
                                    ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                                }`}
                            >
                                {aiLoading ? (
                                    <>Thinking... <Sparkles className="animate-spin w-5 h-5"/></>
                                ) : (
                                    <> <Bot className="w-5 h-5" /> Generate Lyrics </>
                                )}
                            </button>
                        </form>
                    </div>

                    {aiError && (
                        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-3 animate-pulse">
                            <AlertCircle className="w-5 h-5" />
                            {aiError}
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2">
                    <div className={`h-full min-h-[400px] bg-slate-950 rounded-2xl border border-slate-700 p-1 transition-all duration-500 ${generatedLyrics ? 'shadow-[0_0_40px_rgba(245,158,11,0.15)] border-amber-500/50' : ''}`}>
                        <div className="h-full bg-slate-900/50 rounded-xl p-6 md:p-8 flex flex-col relative overflow-hidden">

                            <div className="flex items-center gap-2 mb-6 opacity-50">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-xs font-mono text-slate-400">Laju Perubahan</span>
                            </div>

                            {generatedLyrics ? (
                                <div className="flex-1 overflow-y-auto lyrics-scroll pr-2 animate-fade-in-up">
                                    <div className="border-b border-slate-700 pb-4 mb-4">
                                        <p className="text-amber-500 font-bold text-lg">🎵 {topic}</p>
                                        <p className="text-slate-500 text-sm uppercase tracking-wider">{genre} Style</p>
                                    </div>
                                    <pre className="whitespace-pre-wrap font-mono text-slate-300 leading-relaxed text-base md:text-lg">
                                        {generatedLyrics}
                                    </pre>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
                                    <Bot className={`w-16 h-16 ${aiLoading ? 'animate-bounce text-amber-500' : ''}`} />
                                    <p className="font-mono text-sm">
                                        {aiLoading ? "Sedang meracik kata-kata..." : "Waiting for input..."}
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- AI AUDIO ANALYZER SECTION --- */}
      <section id="aianalyzer" className="py-24 bg-slate-900 relative border-t border-slate-800">
        <div className="container mx-auto px-6 max-w-5xl animate-enter">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider mb-4 border border-purple-500/30">
                    <Drum className="w-3 h-3" /> Experimental
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Music <span className="text-purple-500">Analyzer</span>
                </h2>
                <p className="text-slate-400 text-lg">
                    Upload lagu / demo band kamu (MP3/WAV). Laju Perubahan akan "mendengarkan" tempo, energi, dan memberikan review vibe-nya!
                </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <form onSubmit={handleAnalyzeAudio} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-slate-300 mb-2 font-medium text-sm uppercase tracking-wide">Pilih File Audio (Max 10MB)</label>
                        <input 
                            type="file" 
                            accept="audio/*, .mp3, .wav, audio/mpeg"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={audioLoading || !audioFile}
                        className={`w-full md:w-auto px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
                            audioLoading || !audioFile
                            ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        }`}
                    >
                        {audioLoading ? (
                            <>Mendengarkan... <Sparkles className="animate-spin w-5 h-5"/></>
                        ) : (
                            <> <Play className="w-5 h-5" /> Analyze </>
                        )}
                    </button>
                </form>

                {/* Error Box */}
                {audioError && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" /> {audioError}
                    </div>
                )}

                {/* Result Box */}
                {audioResult && (
                    <div className="mt-8 bg-slate-900 rounded-xl p-6 border border-purple-500/30 animate-fade-in-up">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Tempo (BPM)</p>
                                <p className="text-2xl font-bold text-white">{audioResult.bpm}</p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center col-span-2 md:col-span-3">
                                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Detected Vibe</p>
                                <p className="text-xl font-bold text-purple-400">{audioResult.mood}</p>
                            </div>
                        </div>
                        <div className="bg-slate-950 p-6 rounded-lg border border-slate-800">
                            <p className="text-slate-500 text-xs uppercase font-bold mb-3 border-b border-slate-800 pb-2">AI Review</p>
                            <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                {audioResult.review}
                            </p>
                        </div>
                    </div>
                )}
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
                            <p className="text-xs text-slate-500 uppercase font-bold">Contact Person</p>
                            <p className="font-mono text-lg font-bold group-hover:underline">0897-8085-431</p>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-full border border-slate-800 group-hover:border-amber-500 transition-colors">
                            <Phone className="w-5 h-5" />
                        </div>
                    </a>

                    <a 
                        href="https://maps.app.goo.gl/9bTacmD5uRFji6qy9"
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

      {/* --- MODAL / ZOOM OVERLAY (DITAMBAH POPUP UNTUK LAGU) --- */}
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
                            <p className="text-slate-300 text-lg leading-relaxed italic">"{activeModal.data.description}"</p>
                            
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

                {/* INI POP-UP UNTUK LAGU YANG BARU DITAMBAHKAN */}
                {activeModal.type === 'song' && (
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="text-6xl mb-6">🎧</div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-2 uppercase tracking-widest">Track Selected</h3>
                        <div className="h-1 w-16 bg-amber-500 mb-6"></div>
                        <p className="text-amber-400 text-3xl md:text-4xl font-bold mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            {activeModal.title}
                        </p>
                        <button 
                            className="bg-amber-500 text-slate-900 px-10 py-3 rounded-full font-bold hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.4)] uppercase tracking-widest"
                            onClick={() => setActiveModal(null)}
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

    {/* --- FLOATING MUSIC PLAYER --- */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
            onClick={togglePlay}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 animate-enter"
        >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span className="uppercase tracking-widest text-xs">Play Our Demo</span>
            {isPlaying && (
                <div className="flex gap-1 items-end h-4 ml-2">
                    <div className="w-1 bg-slate-900 animate-[bounce_1s_infinite] h-2"></div>
                    <div className="w-1 bg-slate-900 animate-[bounce_1.2s_infinite] h-4"></div>
                    <div className="w-1 bg-slate-900 animate-[bounce_0.8s_infinite] h-3"></div>
                </div>
            )}
        </button>
      </div>
    </div>
  );
};

export default LajuPerubahanWeb;