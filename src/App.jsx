import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import './App.css';

function App() {
  const whistleAudioRef = useRef(null);
  const boomAudioRef = useRef(null);
  const nextSectionRef = useRef(null);
  const cursorRef = useRef(null);

  // Extract URL parameters for dynamic personalized greetings
  const searchParams = new URLSearchParams(window.location.search);
  const urlTo = searchParams.get('to') || '';
  const urlFrom = searchParams.get('from') || '';
  const urlMsg = searchParams.get('msg') || '';
  const isPersonalized = Boolean(urlTo || urlFrom);

  // Interaction states
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [isInSection2, setIsInSection2] = useState(false);

  // Form states for Section 3 link generation
  const [inputSender, setInputSender] = useState('');
  const [inputReceiver, setInputReceiver] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Curated festive blessings pool
  const festiveWishes = [
    "May the golden luminescence of this sacred light dispel every shadow from your path and bestow prosperity, vitality, and eternal joy upon your home.",
    "Wishing you an abundance of laughter, golden warmth, and boundless auspicious blessings as we celebrate the festival of lights.",
    "May the triumph of light over darkness guide your aspirations to great heights and illuminate your journey ahead.",
    "Sending you divine peace, glowing health, and the eternal grace of Goddess Lakshmi this auspicious Diwali."
  ];

  const handleShuffleWish = () => {
    const nextWish = festiveWishes[Math.floor(Math.random() * festiveWishes.length)];
    setInputMessage(nextWish);
  };

  // Build the live personalized URL
  const generatedShareLink = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(inputReceiver.trim())}&from=${encodeURIComponent(inputSender.trim())}&msg=${encodeURIComponent(inputMessage.trim())}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedShareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleShareWhatsApp = () => {
    const text = `✨ *Happy Diwali!* I have lit a sacred digital Diya especially for you.\n\nOpen your personal light dedication here:\n${generatedShareLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Palette & Particles
  const palette = [
    { color: '#ffffff', glow: 'rgba(255, 255, 255, 1)' },
    { color: '#ffd15c', glow: 'rgba(255, 209, 92, 0.95)' },
    { color: '#ff8a24', glow: 'rgba(255, 138, 36, 0.9)' },
    { color: '#ff3d67', glow: 'rgba(255, 61, 103, 0.85)' },
    { color: '#d04aff', glow: 'rgba(208, 74, 255, 0.85)' },
    { color: '#27e87b', glow: 'rgba(39, 232, 123, 0.85)' }
  ];

  const rocketSparks = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    driftX: (Math.random() - 0.5) * 30
  }));

  const burstParticles = Array.from({ length: 120 }, (_, i) => {
    const angle = (i / 120) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
    const distance = 35 + Math.random() * 95;
    const colorObj = palette[i % palette.length];

    return {
      id: i,
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance,
      rotation: (angle * 180) / Math.PI + 90,
      length: 18 + Math.random() * 24,
      color: colorObj.color,
      glow: colorObj.glow
    };
  });

  const coreFlashSparks = Array.from({ length: 36 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 6 + Math.random() * 24;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 2 + Math.random() * 2.5
    };
  });

  // Mouse tracking and section detection
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.12,
          ease: 'power2.out'
        });
      }
    };

    const handleScroll = () => {
      setIsInSection2(window.scrollY >= window.innerHeight * 0.5 && window.scrollY < window.innerHeight * 1.8);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.set('.mandala-wrapper, .diwali-greeting, .ambient-flash, .blast-ring', {
        autoAlpha: 0,
        display: 'none'
      });

      // Scene 1: LUMORA text ascends
      tl.to(
        '.intro-text',
        {
          opacity: 0,
          y: -35,
          duration: 1.2,
          ease: 'power2.inOut'
        },
        '+=0.01'
      );

      // Scene 2: Firecracker setup
      tl.set('.firecracker', {
        autoAlpha: 1,
        display: 'block',
        y: -160
      });

      // Scene 3: Rocket drops with physics momentum
      tl.to('.firecracker', {
        y: window.innerHeight * 0.5,
        duration: 1.15,
        ease: 'power3.in',
        onStart: () => {
          if (whistleAudioRef.current) {
            whistleAudioRef.current.currentTime = 0;
            whistleAudioRef.current.play().catch(() => {});
          }
        }
      });

      tl.fromTo(
        '.drop-spark',
        { autoAlpha: 1, scale: 1, y: 0 },
        {
          autoAlpha: 0,
          scale: 0.1,
          y: -35,
          duration: 0.35,
          stagger: 0.05,
          ease: 'power1.out'
        },
        '<0.1'
      );

      // Scene 4: Instant vanishing at impact point
      tl.set('.firecracker', {
        autoAlpha: 0,
        display: 'none'
      });

      tl.add(() => {
        if (boomAudioRef.current) {
          boomAudioRef.current.currentTime = 0;
          boomAudioRef.current.play().catch(() => {});
        }
      });

      // Scene 5: Violent detonation flash & ring shockwave
      tl.set('.ambient-flash, .blast-ring', { display: 'block' });
      tl.fromTo(
        '.ambient-flash',
        { autoAlpha: 0.65 },
        { autoAlpha: 0, duration: 0.22, ease: 'power2.out' }
      );
      tl.fromTo(
        '.blast-ring',
        { autoAlpha: 0.9, scale: 0.1 },
        { autoAlpha: 0, scale: 2.2, duration: 0.55, ease: 'expo.out' },
        '<'
      );

      // Scene 6: Pure symmetrical radial burst
      tl.set('.burst-streak, .core-burst-spark', {
        autoAlpha: 1,
        display: 'block',
        x: 0,
        y: 0,
        scale: 0.2
      });

      tl.to('.burst-streak', {
        x: (index, target) => Number(target.dataset.x),
        y: (index, target) => Number(target.dataset.y),
        rotation: (index, target) => Number(target.dataset.angle),
        scaleY: 1.15,
        scaleX: 0.85,
        duration: 0.85,
        ease: 'expo.out',
        stagger: { each: 0.001, from: 'random' }
      }, '<');

      tl.to('.core-burst-spark', {
        x: (index, target) => Number(target.dataset.x),
        y: (index, target) => Number(target.dataset.y),
        scale: 1.4,
        duration: 0.5,
        ease: 'power2.out',
        stagger: { each: 0.0015, from: 'center' }
      }, '<');

      // Dissolve burst cleanly into Section 1 mandala
      tl.to('.burst-streak, .core-burst-spark', {
        opacity: 0,
        scaleY: 0.1,
        scaleX: 0.1,
        duration: 0.45,
        ease: 'power2.in'
      }, '-=0.25');

      // Scene 7: Section 1 mandala blooms
      tl.set('.mandala-wrapper', {
        display: 'flex',
        '--mask-inner': '50%',
        '--mask-outer': '72%',
        filter: 'blur(0px) drop-shadow(0 0 25px rgba(255, 185, 0, 0.3))'
      });

      tl.fromTo('.mandala-wrapper',
        {
          autoAlpha: 0,
          scale: 0.35,
          rotation: 0
        },
        {
          autoAlpha: 0.85,
          scale: 1,
          duration: 0.45,
          ease: 'power2.out'
        },
        '<'
      );

      // Scene 8: Seamless inward diffusion & merge into dark background
      tl.to('.mandala-wrapper', {
        rotation: 35,
        scale: 1.15,
        autoAlpha: 0,
        filter: 'blur(10px) drop-shadow(0 0 45px rgba(255, 180, 0, 0))',
        '--mask-inner': '0%',
        '--mask-outer': '35%',
        duration: 0.95,
        ease: 'power2.inOut'
      }, '+=0.02');

      tl.set('.mandala-wrapper', {
        display: 'none'
      });

      // Scene 9: Happy Diwali reveal (Personalized or Universal)
      tl.set('.diwali-greeting', {
        display: 'block'
      });

      tl.fromTo('.diwali-greeting',
        {
          autoAlpha: 0,
          y: 18,
          scale: 0.96
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: 'power3.out'
        }
      );

      // Scene 10: Hold 0.5s, unlock scroll, and glide down full 100vh into Section 2
      tl.call(() => {
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
      }, null, '+=0.5');

      tl.to(
        {},
        {
          duration: 2.4,
          ease: 'power2.inOut',
          onUpdate: function () {
            const progress = this.progress();
            const targetY = window.innerHeight;
            window.scrollTo(0, targetY * progress);
          }
        }
      );
    });

    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      ctx.revert();
    };
  }, []);

  const handleLightDiya = () => {
    if (isDiyaLit) return;
    setIsDiyaLit(true);

    gsap.fromTo('.flame-container', 
      { scale: 0, y: 15 },
      { scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }
    );
  };

  const showMatchstickCursor = isInSection2 && !isDiyaLit;

  return (
    <div className="page-wrapper">
      <audio ref={whistleAudioRef} src="/firecracker-whistle.mp3" preload="auto" />
      <audio ref={boomAudioRef} src="/explosion.mp3" preload="auto" />

      {/* DYNAMIC CUSTOM FESTIVE CURSOR */}
      <div className="custom-cursor-container" ref={cursorRef}>
        {showMatchstickCursor ? (
          <div className="matchstick-cursor">
            <div className="matchstick-flame"></div>
            <div className="matchstick-head"></div>
            <div className="matchstick-stick"></div>
          </div>
        ) : (
          <div className="golden-cursor">
            <div className="golden-ring"></div>
            <div className="golden-dot"></div>
          </div>
        )}
      </div>

      {/* Screen flash layer */}
      <div className="ambient-flash"></div>

      {/* FIXED HANGING DIYAS (8 CANOPY LAMPS) */}
      <div className={`hanging-lights-container ${isDiyaLit ? 'lit' : ''}`}>
        <div className="hanging-lamp lamp-1"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-2"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-3"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-4"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-5"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-6"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-7"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
        <div className="hanging-lamp lamp-8"><div className="lamp-chain"></div><div className="lamp-fixture"><div className="lamp-glow"></div><div className="lamp-flame"></div><div className="lamp-cap"></div><div className="lamp-body"></div></div></div>
      </div>

      {/* SECTION 1: HERO VIEWPORT */}
      <section className="hero-section">
        <div className="intro-text">
          <h1>LUMORA</h1>
          <p>A FESTIVAL OF LIGHT</p>
          <h2>A CELEBRATION OF LIGHT</h2>
        </div>

        <div className="firecracker">
          <div className="firecracker-head"></div>
          <div className="firecracker-glow"></div>
          <div className="exhaust-stream">
            {rocketSparks.map((s) => (
              <span
                key={s.id}
                className="drop-spark"
                style={{ transform: `translateX(${s.driftX}px)` }}
              />
            ))}
          </div>
        </div>

        <div className="explosion">
          <div className="blast-ring"></div>

          {burstParticles.map((p) => (
            <div
              className="burst-streak"
              key={p.id}
              data-x={p.targetX}
              data-y={p.targetY}
              data-angle={p.rotation}
              style={{
                height: `${p.length}px`,
                background: `linear-gradient(to top, transparent, ${p.color})`,
                boxShadow: `0 0 10px ${p.glow}`
              }}
            />
          ))}

          {coreFlashSparks.map((c) => (
            <div
              className="core-burst-spark"
              key={c.id}
              data-x={c.x}
              data-y={c.y}
              style={{
                width: `${c.size}px`,
                height: `${c.size}px`
              }}
            />
          ))}

          {/* Section 1 Original Mandala */}
          <div className="mandala-wrapper">
            <img src="/mandala.png" alt="Diwali Rangoli Mandala" className="mandala-img" />
          </div>
        </div>

        {/* Section 1 Greeting: Dynamic URL personalization */}
        <div className="diwali-greeting">
          {isPersonalized ? (
            <>
              <h1>HAPPY DIWALI{urlTo ? `, ${urlTo.toUpperCase()}` : ''}</h1>
              {urlFrom && (
                <p className="greeting-from-sub">A DEDICATION OF LIGHT FROM {urlFrom.toUpperCase()}</p>
              )}
            </>
          ) : (
            <h1>HAPPY DIWALI</h1>
          )}
        </div>
      </section>

      {/* SECTION 2: THE INTERACTIVE SACRED DIYA */}
      <section className="next-section" ref={nextSectionRef}>
        <div className={`diya-ambient-glow ${isDiyaLit ? 'lit' : ''}`}></div>

        {/* Section 2 Distinct Floor Rangoli */}
        <div className={`floor-rangoli ${isDiyaLit ? 'lit' : ''}`}>
          <img src="/mandala-floor.png" alt="Ceremonial Floor Rangoli" />
        </div>

        <div className={`diya-stage ${isDiyaLit ? 'is-lit' : ''}`} onClick={handleLightDiya}>
          <div className={`flame-container ${isDiyaLit ? 'lit' : ''}`}>
            <div className="flame-outer"></div>
            <div className="flame-inner"></div>
            <div className="flame-blue-base"></div>
          </div>

          <svg className="diya-svg" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e5a93b" />
                <stop offset="45%" stopColor="#8c5819" />
                <stop offset="80%" stopColor="#4a2e0a" />
                <stop offset="100%" stopColor="#211403" />
              </linearGradient>
              <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffc86b" />
                <stop offset="100%" stopColor="#693e0b" />
              </linearGradient>
            </defs>

            <ellipse cx="100" cy="108" rx="42" ry="7" fill="#140c03" />
            <path d="M72 104 C72 104, 82 96, 100 96 C118 96, 128 104, 128 104 L122 108 L78 108 Z" fill="url(#brassGrad)" />
            <path d="M25 50 Q100 125 175 50 Q180 44 165 42 Q100 52 35 42 Q20 44 25 50 Z" fill="url(#brassGrad)" />
            <ellipse cx="100" cy="46" rx="72" ry="12" fill="url(#lipGrad)" />
            <ellipse cx="100" cy="47" rx="64" ry="9" fill="#2d1704" />
            <path d="M98 47 Q100 30 100 24 Q100 30 102 47 Z" fill="#d9c5b2" />
            <circle cx="100" cy="24" r="2.5" fill="#402d24" />
          </svg>

          {!isDiyaLit && (
            <div className="kindle-prompt">
              <span>✦</span> Touch Flame to Kindle the Light <span>✦</span>
            </div>
          )}
        </div>

        {/* Revealed Blessing & Custom Note (if shared via link) */}
        <div className={`blessing-text ${isDiyaLit ? 'lit' : ''}`}>
          {urlMsg && (
            <div className="personal-card">
              <span className="card-quotes">“</span>
              <p className="personal-msg">{urlMsg}</p>
              <span className="card-quotes end">”</span>
            </div>
          )}
          <p className="shloka-sanskrit">तमसो मा ज्योतिर्गमय</p>
          <p className="shloka-english">From darkness, lead me to light</p>
        </div>

        {/* Subtle scroll cue towards Creator Console */}
        {isDiyaLit && (
          <div className="scroll-indicator">
            <span>Scroll to dedicate your own light</span>
            <div className="indicator-arrow">↓</div>
          </div>
        )}
      </section>

      {/* SECTION 3: THE SACRED FORGE (PERSONALIZED GREETING CREATOR) */}
      <section className="forge-section">
        <div className="forge-container">
          <div className="forge-header">
            <span className="forge-badge">LUMORA DEDICATION</span>
            <h2>Send a Living Diya</h2>
            <p>Kindle a personal festive tribute for someone dear to you.</p>
          </div>

          <div className="forge-form">
            <div className="form-row">
              <div className="input-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav"
                  value={inputSender}
                  onChange={(e) => setInputSender(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Recipient's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Riya"
                  value={inputReceiver}
                  onChange={(e) => setInputReceiver(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-with-action">
                <label>Festive Blessing / Wish</label>
                <button
                  type="button"
                  className="shuffle-wish-btn"
                  onClick={handleShuffleWish}
                >
                  ✨ Inspire Blessing
                </button>
              </div>
              <textarea
                rows="3"
                placeholder="Write your blessing, or tap 'Inspire Blessing' for traditional poetry..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
            </div>

            <div className="forge-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyLink}
                disabled={!inputReceiver.trim() && !inputSender.trim()}
              >
                {copied ? '✓ Personal Link Copied!' : '🎁 Copy Dedication Link'}
              </button>

              <button
                type="button"
                className="btn-whatsapp"
                onClick={handleShareWhatsApp}
                disabled={!inputReceiver.trim() && !inputSender.trim()}
              >
                📲 Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;