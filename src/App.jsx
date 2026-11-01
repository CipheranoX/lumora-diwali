import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import './App.css';

function App() {
  const boomAudioRef = useRef(null);
  const nextSectionRef = useRef(null);
  const cursorRef = useRef(null);
  const wickHitboxRef = useRef(null);
  const canvasRef = useRef(null);

  // Audio Context & Active Nodes Ref for crackle synth
  const audioCtxRef = useRef(null);
  const crackleEngineRef = useRef(null);

  const [hasStarted, setHasStarted] = useState(false);

  // Dynamic URL parameters for personalized greetings
  const searchParams = new URLSearchParams(window.location.search);
  const urlTo = searchParams.get('to') || '';
  const urlFrom = searchParams.get('from') || '';
  const urlMsg = searchParams.get('msg') || '';
  const isPersonalized = Boolean(urlTo || urlFrom);

  // Interactive state
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [isInSection2, setIsInSection2] = useState(false);

  // Section 3 dedication link generator state
  const [inputSender, setInputSender] = useState('');
  const [inputReceiver, setInputReceiver] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleLightDiya = () => {
    if (isDiyaLit) return;
    setIsDiyaLit(true);

    gsap.fromTo(
      '.flame-container',
      { scale: 0, y: 15 },
      { scale: 1, y: 0, duration: 0.6, ease: 'back.out(2)' }
    );
  };

  // Organic Pyrotechnic Crackle & Sparkler Sizzle Generator
  const startChakriCrackleAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.04, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.25);

      whiteNoise.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(ctx.destination);
      whiteNoise.start();

      let snapTimer = null;
      let isRunning = true;

      const triggerMicroSnap = () => {
        if (!isRunning || !audioCtxRef.current) return;
        try {
          const snapOsc = ctx.createOscillator();
          const snapGain = ctx.createGain();

          snapOsc.type = Math.random() > 0.4 ? 'square' : 'triangle';
          snapOsc.frequency.setValueAtTime(900 + Math.random() * 2400, ctx.currentTime);

          snapGain.gain.setValueAtTime(0.12 + Math.random() * 0.14, ctx.currentTime);
          snapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

          snapOsc.connect(snapGain);
          snapGain.connect(ctx.destination);

          snapOsc.start();
          snapOsc.stop(ctx.currentTime + 0.04);
        } catch (e) {}

        const nextDelay = Math.max(18, 90 - Math.random() * 50);
        snapTimer = setTimeout(triggerMicroSnap, nextDelay);
      };

      triggerMicroSnap();

      crackleEngineRef.current = {
        stop: () => {
          isRunning = false;
          if (snapTimer) clearTimeout(snapTimer);
          try {
            whiteNoise.stop();
            whiteNoise.disconnect();
          } catch (e) {}
        }
      };
    } catch (e) {
      console.warn("Crackle engine initialization error:", e);
    }
  };

  const stopChakriCrackleAudio = () => {
    if (crackleEngineRef.current) {
      crackleEngineRef.current.stop();
      crackleEngineRef.current = null;
    }
  };

  // Explicit activation triggered only via the Enter button
  const startExperience = (e) => {
    e.stopPropagation();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtxRef.current = new AudioCtx();
      audioCtxRef.current.resume();
    }

    if (boomAudioRef.current) {
      boomAudioRef.current.volume = 1;
      boomAudioRef.current.play().then(() => {
        boomAudioRef.current.pause();
        boomAudioRef.current.currentTime = 0;
      }).catch(() => {});
    }

    setHasStarted(true);
  };

  // Pyrotechnic Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let isChakriActive = false;
    let chakriAngle = 0;
    let chakriSpeed = 0.08;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Spark {
      constructor(x, y, vx, vy, color, size, decay, gravity = 0.04) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.alpha = 1;
        this.size = size;
        this.decay = decay;
        this.gravity = gravity;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isChakriActive) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        chakriAngle += chakriSpeed;
        chakriSpeed += 0.004;

        const arms = 4;
        const colors = ['#ffffff', '#ffe066', '#ff9900', '#ff3700'];

        for (let a = 0; a < arms; a++) {
          const armAngle = chakriAngle + (a * Math.PI * 2) / arms;
          for (let i = 0; i < 4; i++) {
            const spreadAngle = armAngle + (Math.random() - 0.5) * 0.35;
            const velocity = 4 + Math.random() * 9;
            const color = colors[Math.floor(Math.random() * colors.length)];

            particles.push(
              new Spark(
                cx + Math.cos(armAngle) * 12,
                cy + Math.sin(armAngle) * 12,
                Math.cos(spreadAngle) * velocity,
                Math.sin(spreadAngle) * velocity,
                color,
                1.8 + Math.random() * 2.2,
                0.024,
                0.015
              )
            );
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(i, 1);
      }
      animationId = requestAnimationFrame(render);
    };
    render();

    window.__lumoraStartChakri = () => {
      isChakriActive = true;
      chakriAngle = 0;
      chakriSpeed = 0.09;
    };

    window.__lumoraStopChakri = () => {
      isChakriActive = false;
    };

    window.__lumoraBurstShell = (xRatio, yRatio, themeColors) => {
      const x = canvas.width * xRatio;
      const y = canvas.height * yRatio;
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 6.5;
        const color = themeColors[Math.floor(Math.random() * themeColors.length)];
        particles.push(
          new Spark(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            2 + Math.random() * 2,
            0.016 + Math.random() * 0.014,
            0.05
          )
        );
      }
    };

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Universal Cursor Position Tracker & Hitbox Evaluation
  useEffect(() => {
    const handlePointerMove = (clientX, clientY) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.05,
          ease: 'power2.out'
        });
      }

      if (hasStarted && isInSection2 && !isDiyaLit && wickHitboxRef.current) {
        const rect = wickHitboxRef.current.getBoundingClientRect();
        const wickCenterX = rect.left + rect.width / 2;
        const wickCenterY = rect.top + rect.height / 2;
        const distance = Math.hypot(clientX - wickCenterX, clientY - wickCenterY);

        if (distance <= 36) {
          handleLightDiya();
        }
      }
    };

    const handleMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleScroll = () => {
      if (!nextSectionRef.current) return;
      const rect = nextSectionRef.current.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.55 && rect.bottom >= window.innerHeight * 0.35;
      setIsInSection2(inView);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasStarted, isInSection2, isDiyaLit]);

  useLayoutEffect(() => {
    if (!hasStarted) return;

    window.scrollTo(0, 0);
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.set('.mandala-wrapper, .diwali-greeting, .ambient-flash, .blast-ring', {
        autoAlpha: 0,
        display: 'none'
      });

      // Scene 1: LUMORA branding stays visible for 2.4s, then dissolves
      tl.to(
        '.intro-text',
        {
          opacity: 0,
          y: -40,
          filter: 'blur(5px)',
          duration: 1.1,
          ease: 'power2.inOut'
        },
        '+=2.4'
      );

      // Scene 2: Golden Chakri starts spinning with crackling embers
      tl.add(() => {
        startChakriCrackleAudio();
        if (window.__lumoraStartChakri) window.__lumoraStartChakri();
      });

      tl.to({}, { duration: 1.35 });

      // Scene 3: Stop crackle, terminate Chakri, and fire explosion audio and shockwave
      tl.add(() => {
        stopChakriCrackleAudio();
        if (window.__lumoraStopChakri) window.__lumoraStopChakri();

        if (boomAudioRef.current) {
          boomAudioRef.current.currentTime = 0;
          boomAudioRef.current.play().catch(() => {});
        }
        gsap.fromTo(
          '.hero-section',
          { x: -7, y: 5 },
          { x: 0, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      });

      // Scene 4: Detonation Shockwave Ring
      tl.set('.ambient-flash, .blast-ring', { display: 'block' });
      tl.fromTo(
        '.ambient-flash',
        { autoAlpha: 0.9 },
        { autoAlpha: 0, duration: 0.3, ease: 'power2.out' }
      );
      tl.fromTo(
        '.blast-ring',
        { autoAlpha: 1, scale: 0.05 },
        { autoAlpha: 0, scale: 2.8, duration: 0.65, ease: 'expo.out' },
        '<'
      );

      // Scene 5: Sacred Mandala blooms from center
      tl.set('.mandala-wrapper', {
        display: 'flex',
        '--mask-inner': '50%',
        '--mask-outer': '72%',
        filter: 'blur(0px) drop-shadow(0 0 25px rgba(255, 185, 0, 0.3))'
      });

      tl.fromTo(
        '.mandala-wrapper',
        { autoAlpha: 0, scale: 0.35, rotation: 0 },
        { autoAlpha: 0.85, scale: 1, duration: 0.45, ease: 'power2.out' },
        '<'
      );

      // Scene 6: Cut long explosion tail
      tl.add(() => {
        if (boomAudioRef.current) {
          boomAudioRef.current.pause();
          boomAudioRef.current.currentTime = 0;
        }
      }, '+=0.75');

      tl.to(
        '.mandala-wrapper',
        {
          rotation: 35,
          scale: 1.15,
          autoAlpha: 0,
          filter: 'blur(10px) drop-shadow(0 0 45px rgba(255, 180, 0, 0))',
          '--mask-inner': '0%',
          '--mask-outer': '35%',
          duration: 0.95,
          ease: 'power2.inOut'
        },
        '+=0.02'
      );

      tl.set('.mandala-wrapper', { display: 'none' });

      // Scene 7: "HAPPY DIWALI" text reveal
      tl.set('.diwali-greeting', { display: 'block' });
      tl.fromTo(
        '.diwali-greeting',
        { autoAlpha: 0, y: 20, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }
      );

      // Scene 8: Secondary Salvo Firecrackers (3 colorful bursts in a row)
      tl.add(() => {
        if (boomAudioRef.current) {
          boomAudioRef.current.currentTime = 0;
          boomAudioRef.current.play().catch(() => {});
        }
        if (window.__lumoraBurstShell) {
          window.__lumoraBurstShell(0.24, 0.3, ['#00ff88', '#55ffaa', '#ffffff', '#00cc66']);
        }
      }, '+=0.2');

      tl.add(() => {
        if (boomAudioRef.current) {
          boomAudioRef.current.currentTime = 0;
          boomAudioRef.current.play().catch(() => {});
        }
        if (window.__lumoraBurstShell) {
          window.__lumoraBurstShell(0.76, 0.28, ['#d442ff', '#ff66ea', '#ffffff', '#9900ff']);
        }
      }, '+=0.28');

      tl.add(() => {
        if (boomAudioRef.current) {
          boomAudioRef.current.currentTime = 0;
          boomAudioRef.current.play().catch(() => {});
        }
        if (window.__lumoraBurstShell) {
          window.__lumoraBurstShell(0.5, 0.65, ['#ff2a6d', '#ffd700', '#ffffff', '#ff8800']);
        }
      }, '+=0.28');

      // Scene 9: Unlock scroll and transition down to Section 2
      tl.call(() => {
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
      }, null, '+=0.8');

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
      stopChakriCrackleAudio();
      ctx.revert();
    };
  }, [hasStarted]);

  // Dynamic Cursor Selection: Matchstick ONLY in Section 2 before Diya is lit, Golden everywhere else
  const isMatchstickActive = hasStarted && isInSection2 && !isDiyaLit;

  return (
    <div className="page-wrapper">
      <audio ref={boomAudioRef} src="/explosion.mp3" preload="auto" />

      {/* DYNAMIC CURSOR: Matchstick when lighting candle, Golden Aura otherwise */}
      <div
        className={`custom-cursor-container ${isMatchstickActive ? 'mode-matchstick' : 'mode-golden'}`}
        ref={cursorRef}
      >
        {isMatchstickActive ? (
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

      {/* CEREMONIAL ENTRY OVERLAY */}
      {!hasStarted && (
        <div className="experience-gate-overlay">
          <div className="gate-sacred-frame">
            <div className="gate-corner top-left">✦</div>
            <div className="gate-corner top-right">✦</div>
            <div className="gate-corner bottom-left">✦</div>
            <div className="gate-corner bottom-right">✦</div>
            
            <span className="gate-diya-emblem">🪔</span>
            <h2>LUMORA</h2>
            <div className="gate-divider"><span>✧</span></div>
            <p className="gate-tagline">AN EXPERIENCE OF LIGHT & SOUND</p>
            
            <button 
              type="button" 
              className="gate-prompt-button" 
              onClick={startExperience}
            >
              <span>Enter The Celebration</span>
              <div className="btn-glow-ring"></div>
            </button>
            
            <span className="gate-subtext">Click enter to awaken the lights</span>
          </div>
        </div>
      )}

      <div className="ambient-flash"></div>

      {/* FIXED HANGING DIYAS */}
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
        <canvas ref={canvasRef} className="pyro-canvas" />

        <div className="intro-text">
          <h1>LUMORA</h1>
          <p>A FESTIVAL OF LIGHT</p>
         
        </div>

        <div className="explosion">
          <div className="blast-ring"></div>
          <div className="mandala-wrapper">
            <img src="/mandala.png" alt="Diwali Rangoli Mandala" className="mandala-img" />
          </div>
        </div>

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
      <section className={`next-section ${isDiyaLit ? 'diya-is-lit' : ''}`} ref={nextSectionRef}>
        <div className="sacred-altar-container">
          <div className={`diya-ambient-glow ${isDiyaLit ? 'lit' : ''}`}></div>

          <div className={`floor-rangoli ${isDiyaLit ? 'lit' : ''}`}>
            <img src="/mandala-floor.png" alt="Ceremonial Floor Rangoli" />
          </div>

          <div 
            className={`diya-stage ${isDiyaLit ? 'is-lit' : ''}`}
            onClick={handleLightDiya}
          >
            <div className={`flame-container ${isDiyaLit ? 'lit' : ''}`}>
              <div className="flame-outer"></div>
              <div className="flame-inner"></div>
              <div className="flame-blue-base"></div>
            </div>

            <div className="wick-precision-target" ref={wickHitboxRef}></div>

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
          </div>

          {!isDiyaLit && (
            <div className="kindle-prompt" onClick={handleLightDiya}>
              <span>✦</span> Guide Flame to the Wick to Kindle <span>✦</span>
            </div>
          )}
        </div>

        <div className={`blessing-text ${isDiyaLit ? 'lit' : ''}`}>
          {urlMsg && (
            <div className="personal-card">
              <div className="card-ornament-top">✦ ✧ ✦</div>
              <p className="personal-msg">“{urlMsg}”</p>
              <div className="card-ornament-bottom"></div>
            </div>
          )}
          <p className="shloka-sanskrit">तमसो मा ज्योतिर्गमय</p>
          <p className="shloka-english">From darkness, lead me to light</p>
        </div>

        {isDiyaLit && (
          <div className="scroll-indicator">
            <span>Scroll to dedicate your own light</span>
            <div className="indicator-arrow">↓</div>
          </div>
        )}
      </section>

      {/* SECTION 3: THE SACRED FORGE */}
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