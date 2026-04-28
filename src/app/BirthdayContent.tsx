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

const PROFILE_IMG = '/gift/IMG_20200703_084725_1.jpg';

export default function BirthdayContent() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);   // splash → card
  const [hiding, setHiding]     = useState(false);   // splash exit anim
  const [muted, setMuted]       = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [slideAnim, setSlideAnim] = useState<'in'|'out'>('in');
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  /* ── Open surprise: start audio + reveal card ── */
  const handleOpen = () => {
    const a = audioRef.current;
    if (a) { a.volume = 0.6; a.loop = true; a.play().catch(()=>{}); }
    setHiding(true);
    setTimeout(() => setRevealed(true), 700);
  };

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
    const EMOJI  = ['🌸','🌺','🌼','✨','🪷','💖'];
    interface P { x:number;y:number;vx:number;vy:number;rot:number;rv:number;size:number;alpha:number;color:string;emoji:string;useEmoji:boolean;swing:number;ss:number;dead:boolean }
    const mk = (burst:boolean):P => ({
      x: burst ? canvas.width/2+(Math.random()-.5)*canvas.width*.7 : Math.random()*canvas.width,
      y: burst ? canvas.height*.35+(Math.random()-.5)*160 : -20,
      vx:(Math.random()-.5)*(burst?7:2), vy:.7+Math.random()*(burst?4:1.5),
      rot:Math.random()*Math.PI*2, rv:(Math.random()-.5)*.08,
      size:10+Math.random()*14, alpha:0,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      emoji:EMOJI[Math.floor(Math.random()*EMOJI.length)],
      useEmoji:Math.random()>.45,
      swing:Math.random()*Math.PI*2, ss:.015+Math.random()*.02, dead:false
    });

    let petals:P[] = [];
    for(let i=0;i<60;i++) setTimeout(()=>petals.push(mk(true)),i*22+400);
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
      setActiveIdx(i=>{ goTo((i+1)%GIFT_PHOTOS.length); return i; });
    },3500);
    return ()=>{ if(intervalRef.current) clearInterval(intervalRef.current); };
  },[giftOpen,goTo]);

  const openGift  = () => { setGiftOpen(true); setActiveIdx(0); setSlideAnim('in'); };
  const closeGift = () => { setGiftOpen(false); if(intervalRef.current) clearInterval(intervalRef.current); };

  return (
    <div suppressHydrationWarning>
      <style>{`
        :root{--rose:#ff6eb4;--peach:#ffb347;--gold:#ffd700;--deep:#0d0019;--purple:#c77dff;}
        html,body{height:100%;overflow:hidden;}
        body{background:var(--deep);font-family:'Lato',sans-serif;height:100vh;overflow:hidden;}
        .bg{position:fixed;inset:0;z-index:0;
          background:
            radial-gradient(ellipse 100% 60% at 50% 0%,#5a0080 0%,transparent 65%),
            radial-gradient(ellipse 70% 50% at 0% 80%,#800040 0%,transparent 60%),
            radial-gradient(ellipse 60% 40% at 100% 60%,#003080 0%,transparent 55%),
            linear-gradient(160deg,#0d0019 0%,#1a0035 40%,#0d0019 100%);
          animation:bgShift 8s ease-in-out infinite alternate;}
        @keyframes bgShift{0%{filter:hue-rotate(0deg) brightness(1);}100%{filter:hue-rotate(30deg) brightness(1.15);}}
        .bg-photo{position:fixed;inset:0;z-index:1;background:url('/gift/IMG_20200703_084725_1.jpg') center/cover no-repeat;opacity:.1;filter:blur(10px) saturate(1.5);transform:scale(1.08);}
        canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10;}

        /* ── SPLASH ── */
        .splash{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .7s ease,transform .7s ease;}
        .splash.hiding{opacity:0;transform:scale(1.06);}
        .splash-inner{text-align:center;padding:0 20px;}
        .splash-emoji{font-size:clamp(3rem,10vw,5rem);animation:floatBob 2.5s ease-in-out infinite;filter:drop-shadow(0 0 24px rgba(255,215,0,.6));}
        @keyframes floatBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
        .splash-for{font-family:'Lato',sans-serif;font-weight:300;font-size:clamp(.7rem,2.5vw,.85rem);letter-spacing:5px;text-transform:uppercase;color:rgba(255,179,71,.7);opacity:0;animation:fadeUp .8s ease .3s forwards;}
        .splash-title{font-family:'Dancing Script',cursive;font-size:clamp(2.4rem,10vw,4rem);color:#fff;line-height:1.1;text-shadow:0 0 30px rgba(199,125,255,.7),0 0 60px rgba(255,110,180,.4);margin:10px 0 6px;opacity:0;animation:fadeUp .8s ease .55s forwards;}
        .splash-sub{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(.9rem,3.5vw,1.2rem);color:var(--gold);letter-spacing:2px;opacity:0;animation:fadeUp .8s ease .8s forwards;}
        .splash-divider{width:120px;height:1px;margin:20px auto;background:linear-gradient(90deg,transparent,var(--rose),var(--gold),var(--rose),transparent);opacity:0;animation:fadeIn .8s ease 1s forwards;}
        .open-btn{margin-top:4px;opacity:0;animation:fadeUp .8s ease 1.2s forwards;}
        .open-btn button{
          padding:16px 44px;
          font-family:'Dancing Script',cursive;
          font-size:clamp(1.4rem,5vw,1.8rem);
          color:#fff;
          background:linear-gradient(135deg,#c77dff,#ff6eb4,#ffb347,#ff6eb4,#c77dff);
          background-size:200% auto;
          border:none;border-radius:60px;cursor:pointer;
          box-shadow:0 0 30px rgba(199,125,255,.6),0 0 60px rgba(255,110,180,.3),0 4px 20px rgba(0,0,0,.5);
          transition:transform .25s,box-shadow .25s;
          letter-spacing:1px;
          animation:shimmer 3s linear infinite;}
        @keyframes shimmer{0%{background-position:0% center;}100%{background-position:200% center;}}
        .open-btn button:hover{transform:scale(1.08);box-shadow:0 0 50px rgba(199,125,255,.8),0 0 100px rgba(255,110,180,.4),0 8px 30px rgba(0,0,0,.6);}
        .open-btn button:active{transform:scale(.96);}
        .splash-hint{margin-top:16px;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.3);opacity:0;animation:fadeIn 1s ease 1.8s forwards;}

        /* ── CARD PAGE ── */
        .page{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0 6px;opacity:0;transform:scale(.95);transition:opacity .8s ease,transform .8s ease;}
        .page.show{opacity:1;transform:scale(1);}
        .card{display:flex;flex-direction:column;align-items:center;gap:0;width:min(92vw,420px);}
        .card>*{opacity:0;animation:none;}
        .page.show .flower-crown{animation:fadeUp .7s ease .1s forwards;}
        .page.show .photo-wrap{animation:fadeUp .7s ease .25s forwards;}
        .page.show .name-tag{animation:fadeUp .7s ease .4s forwards;}
        .page.show .hb-line{animation:fadeUp .7s ease .55s forwards;}
        .page.show .divider{animation:fadeIn .7s ease .7s forwards;}
        .page.show .wish{animation:fadeUp .8s ease .85s forwards;}
        .page.show .from-line{animation:fadeUp .7s ease 1s forwards;}
        .page.show .bottom-crown{animation:fadeIn .7s ease 1.15s forwards;}
        .page.show .gift-btn{animation:fadeUp .8s ease 1.3s forwards;}

        .flower-crown{font-size:clamp(1rem,4vw,1.4rem);letter-spacing:6px;filter:drop-shadow(0 0 10px rgba(255,110,180,.7));}
        .photo-wrap{position:relative;margin:8px 0 0;}
        .photo-frame{width:clamp(110px,22vw,150px);height:clamp(110px,22vw,150px);border-radius:50%;border:3px solid transparent;background:linear-gradient(var(--deep),var(--deep)) padding-box,linear-gradient(135deg,var(--gold),var(--rose),var(--purple),var(--gold)) border-box;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(255,110,180,.4),0 0 60px rgba(199,125,255,.2);animation:pulseGlow 3s ease-in-out infinite;}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 30px rgba(255,110,180,.4),0 0 60px rgba(199,125,255,.2);}50%{box-shadow:0 0 50px rgba(255,110,180,.7),0 0 90px rgba(199,125,255,.4);}}
        .orbit{position:absolute;inset:-10px;border-radius:50%;animation:spin 10s linear infinite;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .orbit-dot{position:absolute;font-size:1rem;filter:drop-shadow(0 0 6px rgba(255,110,180,.9));}
        .orbit-dot:nth-child(1){top:0;left:50%;transform:translate(-50%,-50%);}
        .orbit-dot:nth-child(2){top:50%;right:0;transform:translate(50%,-50%);}
        .orbit-dot:nth-child(3){bottom:0;left:50%;transform:translate(-50%,50%);}
        .orbit-dot:nth-child(4){top:50%;left:0;transform:translate(-50%,-50%);}
        .name-tag{margin-top:10px;text-align:center;}
        .name-tag .label{font-weight:300;font-size:clamp(.6rem,2vw,.7rem);letter-spacing:4px;text-transform:uppercase;color:var(--peach);opacity:.8;}
        .name-tag .name{font-family:'Dancing Script',cursive;font-size:clamp(2rem,7vw,2.8rem);color:#fff;line-height:1.1;text-shadow:0 0 24px rgba(255,215,0,.7),0 2px 8px rgba(0,0,0,.5);margin-top:2px;}
        .hb-line{margin-top:6px;text-align:center;}
        .hb-text{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(.9rem,3.5vw,1.15rem);color:var(--gold);letter-spacing:2px;}
        .divider{width:80%;height:1px;margin:10px auto;background:linear-gradient(90deg,transparent,var(--rose),var(--gold),var(--purple),var(--rose),transparent);}
        .wish{width:90%;text-align:center;color:rgba(255,230,245,.88);font-size:clamp(.75rem,2.8vw,.9rem);line-height:1.75;font-weight:300;letter-spacing:.3px;padding:0 4px;}
        .from-line{margin-top:10px;text-align:center;}
        .from-line .from-label{font-size:.65rem;letter-spacing:3px;text-transform:uppercase;color:rgba(255,230,245,.4);}
        .from-line .from-name{font-family:'Dancing Script',cursive;font-size:clamp(1.1rem,4vw,1.4rem);color:var(--peach);text-shadow:0 0 14px rgba(255,179,71,.6);}
        .bottom-crown{font-size:clamp(1rem,4vw,1.3rem);letter-spacing:4px;margin-top:6px;filter:drop-shadow(0 0 8px rgba(255,110,180,.6));}
        .gift-btn{margin-top:12px;}
        .gift-btn button{padding:10px 32px;font-family:'Dancing Script',cursive;font-size:1.3rem;color:#fff;background:linear-gradient(135deg,#c77dff,#ff6eb4,#ffb347);border:none;border-radius:50px;cursor:pointer;box-shadow:0 0 22px rgba(199,125,255,.5),0 4px 16px rgba(0,0,0,.4);transition:transform .2s,box-shadow .2s;letter-spacing:1px;}
        .gift-btn button:hover{transform:scale(1.07);box-shadow:0 0 38px rgba(255,110,180,.7),0 8px 28px rgba(0,0,0,.5);}
        .gift-btn button:active{transform:scale(.97);}

        /* Mute btn */
        .mute-btn{position:fixed;top:14px;right:14px;z-index:100;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:50%;width:40px;height:40px;font-size:1.2rem;cursor:pointer;backdrop-filter:blur(8px);transition:background .2s,opacity .5s;opacity:0;}
        .mute-btn.show{opacity:1;}
        .mute-btn:hover{background:rgba(255,255,255,.22);}

        /* Gift modal */
        .gift-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(5,0,20,.88);backdrop-filter:blur(6px);animation:fadeIn .4s ease;}
        .gift-modal{position:relative;width:min(95vw,500px);max-height:90vh;overflow-y:auto;background:linear-gradient(145deg,#1a0035,#0d0019);border:1px solid rgba(199,125,255,.3);border-radius:24px;padding:20px 18px 24px;box-shadow:0 0 60px rgba(199,125,255,.3),0 0 120px rgba(255,110,180,.15);animation:modalPop .5s cubic-bezier(.22,1,.36,1);}
        @keyframes modalPop{from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);}}
        .gift-modal h2{font-family:'Dancing Script',cursive;font-size:1.6rem;color:var(--gold);text-align:center;margin-bottom:14px;text-shadow:0 0 18px rgba(255,215,0,.5);}
        .slide-wrap{position:relative;width:100%;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:#0d0019;}
        .slide-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:14px;transition:opacity .35s ease,transform .35s ease;}
        .slide-img.in{opacity:1;transform:scale(1);}
        .slide-img.out{opacity:0;transform:scale(1.05);}
        .slide-num{text-align:center;margin-top:8px;color:rgba(255,230,245,.5);font-size:.75rem;letter-spacing:2px;}
        .dots{display:flex;justify-content:center;gap:6px;margin-top:10px;flex-wrap:wrap;}
        .dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2);cursor:pointer;transition:background .3s,transform .3s;}
        .dot.active{background:var(--rose);transform:scale(1.4);}
        .nav-row{display:flex;justify-content:space-between;margin-top:12px;}
        .nav-btn{background:rgba(255,110,180,.18);border:1px solid rgba(255,110,180,.3);color:#fff;border-radius:50px;padding:7px 18px;cursor:pointer;font-size:.85rem;transition:background .2s;}
        .nav-btn:hover{background:rgba(255,110,180,.35);}
        .close-btn{position:absolute;top:10px;right:13px;background:none;border:none;color:rgba(255,255,255,.6);font-size:1.5rem;cursor:pointer;line-height:1;}
        .close-btn:hover{color:#fff;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>

      {/* Shared background */}
      <div className="bg" />
      <div className="bg-photo" />
      <canvas ref={canvasRef} />
      <audio ref={audioRef} src="/birthday.mp3" preload="auto" />

      {/* Mute button — only visible after reveal */}
      <button className={`mute-btn${revealed?' show':''}`} onClick={toggleMute} aria-label="Toggle music">
        {muted ? '🔇' : '🎵'}
      </button>

      {/* ── SPLASH SCREEN ── */}
      {!revealed && (
        <div className={`splash${hiding?' hiding':''}`}>
          <div className="splash-inner">
            <div className="splash-emoji">🎁</div>
            <div className="splash-for">You have a surprise</div>
            <div className="splash-title">Happy Birthday<br/>Kusha! 🎂</div>
            <div className="splash-sub">A special gift is waiting for you</div>
            <div className="splash-divider" />
            <div className="open-btn">
              <button onClick={handleOpen}>
                🎁 Open Your Surprise
              </button>
            </div>
            <div className="splash-hint">tap the button to begin ✨</div>
          </div>
        </div>
      )}

      {/* ── BIRTHDAY CARD ── */}
      <div className={`page${revealed?' show':''}`}>
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
              <img src={PROFILE_IMG} alt="Kusha" style={{width:'calc(100% - 8px)',height:'calc(100% - 8px)',borderRadius:'50%',objectFit:'cover',display:'block'}} />
            </div>
          </div>

          <div className="name-tag">
            <div className="label">✦ Happy Birthday ✦</div>
            <div className="name">Kusha</div>
          </div>

          <div className="hb-line">
            <span style={{fontSize:'clamp(1.2rem,4vw,1.5rem)'}}>🎂</span>
            <span className="hb-text"> Wishing You a Wonderful Day </span>
            <span style={{fontSize:'clamp(1.2rem,4vw,1.5rem)'}}>🎂</span>
          </div>

          <div className="divider" />

          <p className="wish">
            May your birthday be as bright as your smile 🌸<br/>
            May every dream you hold come true 🌺<br/>
            May joy, love, and laughter surround you always<br/>
            Wishing you all the happiness in the world ✨
          </p>

          <div className="from-line">
            <div className="from-label">with love from</div>
            <div className="from-name">Tharindu</div>
          </div>

          <div className="bottom-crown">🌺 🌸 💜 🌸 🌺</div>
        </div>

        <div className="gift-btn">
          <button onClick={openGift}>🎁 Open Your Gift</button>
        </div>
      </div>

      {/* ── GIFT GALLERY MODAL ── */}
      {giftOpen && (
        <div className="gift-overlay" onClick={closeGift}>
          <div className="gift-modal" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={closeGift}>×</button>
            <h2>🎁 Your Special Memories 💖</h2>

            <div className="slide-wrap">
              {GIFT_PHOTOS.map((src,i)=>(
                <img key={src} src={src} alt={`Memory ${i+1}`}
                  className={`slide-img ${i===activeIdx?slideAnim:'out'}`}
                  style={{zIndex:i===activeIdx?2:1}} />
              ))}
            </div>

            <div className="slide-num">{activeIdx+1} / {GIFT_PHOTOS.length}</div>

            <div className="dots">
              {GIFT_PHOTOS.map((_,i)=>(
                <div key={i} className={`dot${i===activeIdx?' active':''}`} onClick={()=>goTo(i)} />
              ))}
            </div>

            <div className="nav-row">
              <button className="nav-btn" onClick={()=>goTo((activeIdx-1+GIFT_PHOTOS.length)%GIFT_PHOTOS.length)}>← Prev</button>
              <button className="nav-btn" onClick={()=>goTo((activeIdx+1)%GIFT_PHOTOS.length)}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
