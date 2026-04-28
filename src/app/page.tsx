'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const GIFT_PHOTOS = [
  '/gift/IMG-20190318-WA0006.jpg',
  '/gift/IMG_20190405_145028.jpg',
  '/gift/IMG_20200526_131702.jpg',
  '/gift/IMG_20200623_115359.jpg',
  '/gift/IMG_20200627_175836.jpg',
  '/gift/IMG_20200703_084725_1.jpg',
  '/gift/IMG_20200703_084737.jpg',
  '/gift/IMG_20200709_172852.jpg',
  '/gift/IMG_20200713_141952.jpg',
  '/gift/IMG_20200727_184451_1.jpg',
  '/gift/IMG_20200903_154624.jpg',
  '/gift/IMG_20230513_084758.jpg',
];

export default function BirthdayPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [muted, setMuted] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [slideAnim, setSlideAnim] = useState<'in'|'out'>('in');
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  /* ── Audio ── */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.6;
    a.play().catch(() => {});
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(m => !m);
  };

  /* ── Petal canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#ff6eb4','#ff9de2','#ffb347','#ff6b6b','#ffd700','#c77dff','#80ffdb'];
    const EMOJI = ['🌸','🌺','🌼','✨','🪷','💖'];

    interface P { x:number;y:number;vx:number;vy:number;rot:number;rv:number;size:number;alpha:number;color:string;emoji:string;useEmoji:boolean;swing:number;ss:number;dead:boolean }
    const mk = (burst:boolean):P => ({
      x: burst ? canvas.width/2+(Math.random()-.5)*canvas.width*.7 : Math.random()*canvas.width,
      y: burst ? canvas.height*.3+(Math.random()-.5)*160 : -20,
      vx:(Math.random()-.5)*(burst?7:2), vy:.7+Math.random()*(burst?4:1.5),
      rot:Math.random()*Math.PI*2, rv:(Math.random()-.5)*.08,
      size:10+Math.random()*14, alpha:0,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      emoji:EMOJI[Math.floor(Math.random()*EMOJI.length)],
      useEmoji:Math.random()>.45,
      swing:Math.random()*Math.PI*2, ss:.015+Math.random()*.02, dead:false
    });

    let petals:P[] = [];
    for(let i=0;i<80;i++) setTimeout(()=>petals.push(mk(true)),i*18+800);
    const si = setInterval(()=>{ if(petals.length<70) petals.push(mk(false)); },220);

    let raf:number;
    const loop = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      petals = petals.filter(p=>!p.dead);
      for(const p of petals){
        p.swing+=p.ss; p.x+=p.vx+Math.sin(p.swing)*.5; p.y+=p.vy; p.rot+=p.rv;
        if(p.alpha<.75) p.alpha=Math.min(p.alpha+.04,.75);
        if(p.y>canvas.height+30) p.dead=true;
        ctx.save(); ctx.globalAlpha=p.alpha; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        if(p.useEmoji){ ctx.font=`${p.size}px serif`; ctx.fillText(p.emoji,-p.size/2,p.size/2); }
        else{ ctx.fillStyle=p.color; ctx.beginPath(); ctx.ellipse(0,0,p.size*.35,p.size*.7,0,0,Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('resize',resize); clearInterval(si); cancelAnimationFrame(raf); };
  }, []);

  /* ── Gift slideshow ── */
  const goTo = useCallback((idx:number) => {
    setSlideAnim('out');
    setTimeout(()=>{ setActiveIdx(idx); setSlideAnim('in'); },350);
  },[]);

  useEffect(()=>{
    if(!giftOpen) return;
    intervalRef.current = setInterval(()=>{
      setActiveIdx(i=>{ const next=(i+1)%GIFT_PHOTOS.length; goTo(next); return i; });
    },3500);
    return ()=>{ if(intervalRef.current) clearInterval(intervalRef.current); };
  },[giftOpen, goTo]);

  const openGift = () => { setGiftOpen(true); setActiveIdx(0); setSlideAnim('in'); };
  const closeGift = () => { setGiftOpen(false); if(intervalRef.current) clearInterval(intervalRef.current); };

  return (
    <>
      <style>{`
        :root{--rose:#ff6eb4;--peach:#ffb347;--gold:#ffd700;--deep:#0d0019;--purple:#c77dff;}
        body{background:var(--deep);font-family:'Lato',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;position:relative;overflow-x:hidden;}
        .bg{position:fixed;inset:0;z-index:0;
          background:
            radial-gradient(ellipse 100% 60% at 50% 0%,#5a0080 0%,transparent 65%),
            radial-gradient(ellipse 70% 50% at 0% 80%,#800040 0%,transparent 60%),
            radial-gradient(ellipse 60% 40% at 100% 60%,#003080 0%,transparent 55%),
            linear-gradient(160deg,#0d0019 0%,#1a0035 40%,#0d0019 100%);
          animation:bgShift 8s ease-in-out infinite alternate;}
        @keyframes bgShift{0%{filter:hue-rotate(0deg) brightness(1);}100%{filter:hue-rotate(30deg) brightness(1.15);}}
        canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10;}
        .card{position:relative;z-index:20;width:min(92vw,440px);margin:28px auto 40px;display:flex;flex-direction:column;align-items:center;gap:0;opacity:0;animation:cardIn 1.2s cubic-bezier(.22,1,.36,1) .6s forwards;}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(.95);}to{opacity:1;transform:translateY(0) scale(1);}}
        .flower-crown{font-size:clamp(1.6rem,6vw,2rem);letter-spacing:6px;opacity:0;animation:fadeUp .8s ease 1.4s forwards;filter:drop-shadow(0 0 10px rgba(255,110,180,.7));}
        .photo-wrap{position:relative;margin:18px 0 0;opacity:0;animation:fadeUp .9s ease 1.6s forwards;}
        .photo-frame{width:clamp(170px,46vw,210px);height:clamp(170px,46vw,210px);border-radius:50%;border:4px solid transparent;background:linear-gradient(var(--deep),var(--deep)) padding-box,linear-gradient(135deg,var(--gold),var(--rose),var(--purple),var(--gold)) border-box;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 0 35px rgba(255,110,180,.4),0 0 70px rgba(199,125,255,.2);animation:pulseGlow 3s ease-in-out 2.5s infinite;}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 35px rgba(255,110,180,.4),0 0 70px rgba(199,125,255,.2);}50%{box-shadow:0 0 55px rgba(255,110,180,.7),0 0 100px rgba(199,125,255,.4);}}
        .photo-frame img{width:calc(100% - 10px);height:calc(100% - 10px);border-radius:50%;object-fit:cover;}
        .orbit{position:absolute;inset:-12px;border-radius:50%;animation:spin 10s linear infinite;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .orbit-dot{position:absolute;font-size:1.2rem;filter:drop-shadow(0 0 6px rgba(255,110,180,.9));}
        .orbit-dot:nth-child(1){top:0;left:50%;transform:translate(-50%,-50%);}
        .orbit-dot:nth-child(2){top:50%;right:0;transform:translate(50%,-50%);}
        .orbit-dot:nth-child(3){bottom:0;left:50%;transform:translate(-50%,50%);}
        .orbit-dot:nth-child(4){top:50%;left:0;transform:translate(-50%,-50%);}
        .name-tag{margin-top:22px;text-align:center;opacity:0;animation:fadeUp .9s ease 1.9s forwards;}
        .name-tag .label{font-family:'Lato',sans-serif;font-weight:300;font-size:clamp(.65rem,2.5vw,.75rem);letter-spacing:4px;text-transform:uppercase;color:var(--peach);opacity:.8;}
        .name-tag .name{font-family:'Dancing Script',cursive;font-size:clamp(2.2rem,9vw,3rem);color:#fff;line-height:1.1;text-shadow:0 0 24px rgba(255,215,0,.7),0 2px 8px rgba(0,0,0,.5);margin-top:2px;}
        .hb-line{margin-top:18px;text-align:center;opacity:0;animation:fadeUp .9s ease 2.1s forwards;}
        .hb-line .hb-text{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1rem,4.5vw,1.3rem);color:var(--gold);letter-spacing:2px;}
        .divider{width:80%;height:1px;margin:18px auto;background:linear-gradient(90deg,transparent,var(--rose),var(--gold),var(--purple),var(--rose),transparent);opacity:0;animation:fadeIn .8s ease 2.3s forwards;}
        .wish{width:90%;text-align:center;color:rgba(255,230,245,.88);font-size:clamp(.85rem,3.4vw,1rem);line-height:1.9;font-weight:300;letter-spacing:.3px;opacity:0;animation:fadeUp 1s ease 2.5s forwards;padding:0 4px;}
        .from-line{margin-top:22px;text-align:center;opacity:0;animation:fadeUp .9s ease 2.8s forwards;}
        .from-line .from-label{font-size:.7rem;letter-spacing:3px;text-transform:uppercase;color:rgba(255,230,245,.4);}
        .from-line .from-name{font-family:'Dancing Script',cursive;font-size:clamp(1.3rem,5vw,1.6rem);color:var(--peach);text-shadow:0 0 14px rgba(255,179,71,.6);}
        .bottom-crown{font-size:clamp(1.4rem,5vw,1.7rem);letter-spacing:4px;margin-top:10px;opacity:0;animation:fadeIn 1s ease 3s forwards;filter:drop-shadow(0 0 8px rgba(255,110,180,.6));}
        /* Gift button */
        .gift-btn{position:relative;z-index:20;margin:0 auto 36px;opacity:0;animation:fadeUp 1s ease 3.2s forwards;}
        .gift-btn button{padding:14px 36px;font-family:'Dancing Script',cursive;font-size:1.4rem;color:#fff;background:linear-gradient(135deg,#c77dff,#ff6eb4,#ffb347);border:none;border-radius:50px;cursor:pointer;box-shadow:0 0 24px rgba(199,125,255,.5),0 4px 20px rgba(0,0,0,.4);transition:transform .2s,box-shadow .2s;letter-spacing:1px;}
        .gift-btn button:hover{transform:scale(1.07);box-shadow:0 0 40px rgba(255,110,180,.7),0 8px 30px rgba(0,0,0,.5);}
        .gift-btn button:active{transform:scale(.97);}
        /* Mute btn */
        .mute-btn{position:fixed;top:16px;right:16px;z-index:100;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:50%;width:44px;height:44px;font-size:1.3rem;cursor:pointer;backdrop-filter:blur(8px);transition:background .2s;}
        .mute-btn:hover{background:rgba(255,255,255,.22);}
        /* Gift modal */
        .gift-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(5,0,20,.88);backdrop-filter:blur(6px);animation:fadeIn .4s ease;}
        .gift-modal{position:relative;width:min(95vw,520px);background:linear-gradient(145deg,#1a0035,#0d0019);border:1px solid rgba(199,125,255,.3);border-radius:24px;padding:24px 20px 28px;box-shadow:0 0 60px rgba(199,125,255,.3),0 0 120px rgba(255,110,180,.15);animation:modalPop .5s cubic-bezier(.22,1,.36,1);}
        @keyframes modalPop{from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);}}
        .gift-modal h2{font-family:'Dancing Script',cursive;font-size:1.8rem;color:var(--gold);text-align:center;margin-bottom:16px;text-shadow:0 0 18px rgba(255,215,0,.5);}
        .slide-wrap{position:relative;width:100%;aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:#0d0019;box-shadow:0 0 30px rgba(255,110,180,.2);}
        .slide-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;transition:opacity .35s ease,transform .35s ease;}
        .slide-img.in{opacity:1;transform:scale(1);}
        .slide-img.out{opacity:0;transform:scale(1.04);}
        .slide-num{text-align:center;margin-top:10px;color:rgba(255,230,245,.5);font-size:.8rem;letter-spacing:2px;}
        .dots{display:flex;justify-content:center;gap:7px;margin-top:12px;}
        .dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.2);cursor:pointer;transition:background .3s,transform .3s;}
        .dot.active{background:var(--rose);transform:scale(1.35);}
        .nav-row{display:flex;justify-content:space-between;margin-top:14px;}
        .nav-btn{background:rgba(255,110,180,.18);border:1px solid rgba(255,110,180,.3);color:#fff;border-radius:50px;padding:8px 20px;cursor:pointer;font-size:.9rem;transition:background .2s;}
        .nav-btn:hover{background:rgba(255,110,180,.35);}
        .close-btn{position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,.6);font-size:1.6rem;cursor:pointer;line-height:1;transition:color .2s;}
        .close-btn:hover{color:#fff;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>

      {/* Background */}
      <div className="bg" />
      <canvas ref={canvasRef} />

      {/* Audio */}
      <audio ref={audioRef} src="/birthday.mp3" loop preload="auto" />

      {/* Mute button */}
      <button className="mute-btn" onClick={toggleMute} aria-label="Toggle music">
        {muted ? '🔇' : '🎵'}
      </button>

      {/* Card */}
      <div className="card">
        <div className="flower-crown">🌸 🌺 💜 🌺 🌸</div>

        <div className="photo-wrap">
          <div className="orbit">
            <span className="orbit-dot">🌸</span>
            <span className="orbit-dot">✨</span>
            <span className="orbit-dot">💖</span>
            <span className="orbit-dot">⭐</span>
          </div>
          <div className="photo-frame">
            <div style={{width:'calc(100% - 10px)',height:'calc(100% - 10px)',borderRadius:'50%',background:'linear-gradient(135deg,#2a0045,#4a1060)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,color:'rgba(255,230,245,.5)',fontSize:'.75rem',letterSpacing:1,textAlign:'center',padding:12}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width={42} height={42} style={{opacity:.4}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
          </div>
        </div>

        <div className="name-tag">
          <div className="label">✦ Happy Birthday ✦</div>
          <div className="name">Kavindi</div>
        </div>

        <div className="hb-line">
          <span style={{fontSize:'clamp(1.4rem,5vw,1.7rem)'}}>🎂</span>
          <span className="hb-text"> ආදරණීය ජන්ම දිනය </span>
          <span style={{fontSize:'clamp(1.4rem,5vw,1.7rem)'}}>🎂</span>
        </div>

        <div className="divider" />

        <p className="wish">
          ජීවිතයේ සෑම හෙළ දිනකම සතුටින් බබලේවා 🌸<br />
          ඔබේ සිහිනවල මල් සදා පිපේවා 🌺<br />
          ඔබ හඬා සතුට, සෙනේ, ජය ලාභ ද<br />
          සෑම ලෙසකින්ම ඔබ ජය ගනිත්වා ✨
        </p>

        <div className="from-line">
          <div className="from-label">with love from</div>
          <div className="from-name">Amara</div>
        </div>

        <div className="bottom-crown">🌺 🌸 💜 🌸 🌺</div>
      </div>

      {/* Open Gift Button */}
      <div className="gift-btn">
        <button onClick={openGift}>🎁 Open Your Gift</button>
      </div>

      {/* Gift Gallery Modal */}
      {giftOpen && (
        <div className="gift-overlay" onClick={closeGift}>
          <div className="gift-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeGift}>×</button>
            <h2>🎁 Your Special Memories 💖</h2>

            <div className="slide-wrap">
              {GIFT_PHOTOS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`Memory ${i + 1}`}
                  className={`slide-img ${i === activeIdx ? slideAnim : 'out'}`}
                  style={{ zIndex: i === activeIdx ? 2 : 1 }}
                />
              ))}
            </div>

            <div className="slide-num">
              {activeIdx + 1} / {GIFT_PHOTOS.length}
            </div>

            <div className="dots">
              {GIFT_PHOTOS.map((_, i) => (
                <div
                  key={i}
                  className={`dot${i === activeIdx ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            <div className="nav-row">
              <button className="nav-btn" onClick={() => goTo((activeIdx - 1 + GIFT_PHOTOS.length) % GIFT_PHOTOS.length)}>← Prev</button>
              <button className="nav-btn" onClick={() => goTo((activeIdx + 1) % GIFT_PHOTOS.length)}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
