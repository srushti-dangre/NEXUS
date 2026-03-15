"use client";
import { useSocket } from "./components/SocketProvider";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const SYMS = ["BTC","ETH","AAPL","NIFTY","GOOGL","TSLA"];

export default function Home() {
  const { isConnected, latestTicks, alerts } = useSocket();
  const [selectedSym, setSelectedSym] = useState("BTC");
  const [time, setTime] = useState("");
  const [user, setUser] = useState<{username:string;role:string}|null>(null);
  const histRef = useRef<Record<string,number[]>>({});
  const volHRef = useRef<number[]>(Array.from({length:40},()=>0.4+Math.random()*1.6));
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("nexus_user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    SYMS.forEach(s => { if (!histRef.current[s]) histRef.current[s] = []; });
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    SYMS.forEach(s => {
      const tick = latestTicks[s];
      if (!tick) return;
      if (!histRef.current[s]) histRef.current[s] = [];
      histRef.current[s].push(tick.price);
      if (histRef.current[s].length > 80) histRef.current[s].shift();
    });
    const btc = latestTicks["BTC"];
    if (btc) {
      volHRef.current.push(btc.volume || 0.3 + Math.random()*1.9);
      if (volHRef.current.length > 40) volHRef.current.shift();
    }
  }, [latestTicks]);

  const logout = () => {
    localStorage.removeItem("nexus_user");
    router.push("/login");
  };

  const navTo = (item: string) => {
    const routes: Record<string,string> = {
      OVERVIEW: "/",
      ANALYTICS: "/analytics",
      SIGNALS: "/signals",
      ALERTS: "/alerts",
    };
    router.push(routes[item] || "/");
  };

  return (
    <div style={{position:"relative",zIndex:1,height:"100vh",display:"flex",flexDirection:"column",background:"#030508",overflow:"hidden"}}>
      <ParticleBg />
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}} />

      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px",background:"rgba(3,5,8,0.96)",borderBottom:"1px solid rgba(0,200,255,0.12)",flexShrink:0,backdropFilter:"blur(20px)",position:"relative",zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,border:"2px solid #00c8ff",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Orbitron,monospace",fontSize:15,fontWeight:900,color:"#00c8ff",animation:"logoPulse 2s ease-in-out infinite"}}>N</div>
          <div>
            <div style={{fontFamily:"Orbitron,monospace",fontSize:20,fontWeight:900,letterSpacing:5,color:"#e8f4ff",animation:"glitch 9s infinite"}}>NEX<span style={{color:"#00c8ff"}}>US</span></div>
            <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:2}}>MARKET INTELLIGENCE v2.4</div>
          </div>
        </div>

        <div style={{display:"flex",gap:6}}>
          {["OVERVIEW","ANALYTICS","SIGNALS","ALERTS"].map((item)=>(
            <button key={item} onClick={()=>navTo(item)}
              style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,letterSpacing:1,padding:"4px 14px",borderRadius:20,border:`1px solid ${item==="OVERVIEW"?"#00c8ff":"rgba(0,200,255,0.12)"}`,background:item==="OVERVIEW"?"rgba(0,200,255,0.08)":"transparent",color:item==="OVERVIEW"?"#00c8ff":"#4a7090",cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>{(e.currentTarget).style.borderColor="#00c8ff";(e.currentTarget).style.color="#00c8ff";}}
              onMouseLeave={e=>{if(item!=="OVERVIEW"){(e.currentTarget).style.borderColor="rgba(0,200,255,0.12)";(e.currentTarget).style.color="#4a7090";}}}
            >{item}</button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {user && (
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#ffbe00",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,190,0,0.3)",background:"rgba(255,190,0,0.05)",letterSpacing:1}}>
              {user.role.toUpperCase()}
            </span>
          )}
          <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#00ff9d",padding:"4px 12px",borderRadius:4,border:"1px solid rgba(0,255,157,0.3)",background:"rgba(0,255,157,0.05)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d",boxShadow:"0 0 8px #00ff9d",animation:"blink 1.2s infinite"}} />
            {isConnected ? "LIVE FEED" : "OFFLINE"}
          </div>
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"#00c8ff",letterSpacing:2}}>{time}</div>
          <button onClick={logout}
            style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#ff2d55",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,45,85,0.3)",background:"rgba(255,45,85,0.05)",cursor:"pointer",letterSpacing:1,transition:"all 0.2s"}}
            onMouseEnter={e=>{(e.currentTarget).style.background="rgba(255,45,85,0.15)";}}
            onMouseLeave={e=>{(e.currentTarget).style.background="rgba(255,45,85,0.05)";}}
          >LOGOUT</button>
        </div>
      </nav>

      <TickerBar latestTicks={latestTicks} />

      <div style={{flex:1,minHeight:0,display:"grid",gridTemplateColumns:"210px 1fr 270px",gridTemplateRows:"1fr 1fr",gap:10,padding:10,position:"relative",zIndex:10}}>
        <Card>
          <CardHead title="LIVE PRICES" badge="LIVE" badgeType="live" />
          <PriceList latestTicks={latestTicks} selectedSym={selectedSym} onSelect={setSelectedSym} />
        </Card>
        <Card id="chart-card">
          <PriceChart latestTicks={latestTicks} selectedSym={selectedSym} histRef={histRef} />
        </Card>
        <Card>
          <CardHead title="VOLUME" badge="30 TICKS" />
          <VolumeChart volHRef={volHRef} latestTicks={latestTicks} />
        </Card>
        <Card>
          <CardHead title="HEATMAP" badge="% CHANGE" />
          <HeatMap latestTicks={latestTicks} onSelect={setSelectedSym} />
        </Card>
        <Card>
          <CardHead title="ANOMALY FEED" badge={`${alerts.length} EVENTS`} badgeType="live" />
          <AlertFeed alerts={alerts} />
        </Card>
        <Card style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <CardHead title="AI SIGNALS" badge="LIVE" badgeType="live" />
          <AISignalPanel latestTicks={latestTicks} alerts={alerts} />
          <div style={{borderTop:"1px solid rgba(0,200,255,0.12)",flexShrink:0}}>
            <CardHead title="SIMULATION" badge="⚠ DEMO" badgeType="warn" />
          </div>
          <SimulationControls selectedSym={selectedSym} onSelect={setSelectedSym} />
        </Card>
      </div>

      <style>{`
        @keyframes logoPulse {
          0%,100%{box-shadow:0 0 16px rgba(0,200,255,0.4),inset 0 0 10px rgba(0,200,255,0.1);}
          50%{box-shadow:0 0 28px rgba(0,200,255,0.8),inset 0 0 18px rgba(0,200,255,0.2);}
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes glitch {
          0%,94%,100%{clip-path:none;transform:none}
          95%{clip-path:inset(20% 0 60% 0);transform:translateX(-3px)}
          96%{clip-path:inset(60% 0 10% 0);transform:translateX(3px)}
          97%{clip-path:inset(40% 0 40% 0);transform:translateX(-2px)}
        }
        @keyframes tickScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes alin { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:#060c12}
        ::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.5);border-radius:2px}
      `}</style>
    </div>
  );
}

function Card({children,id,style}:{children:React.ReactNode;id?:string;style?:React.CSSProperties}) {
  const [hovered,setHovered]=useState(false);
  return (
    <div id={id} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{background:"rgba(10,25,45,0.7)",border:`1px solid ${hovered?"rgba(0,200,255,0.28)":"rgba(0,200,255,0.12)"}`,borderRadius:14,backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",transition:"border-color 0.4s",...style}}>
      <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,#00c8ff,transparent)",opacity:0.4,pointerEvents:"none"}} />
      {children}
    </div>
  );
}

function CardHead({title,badge,badgeType}:{title:string;badge:string;badgeType?:"live"|"warn"}) {
  const badgeBg=badgeType==="live"?"rgba(0,255,157,0.08)":badgeType==="warn"?"rgba(255,190,0,0.08)":"rgba(0,200,255,0.08)";
  const badgeBorder=badgeType==="live"?"rgba(0,255,157,0.3)":badgeType==="warn"?"rgba(255,190,0,0.3)":"rgba(0,200,255,0.12)";
  const badgeColor=badgeType==="live"?"#00ff9d":badgeType==="warn"?"#ffbe00":"#4a7090";
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 8px",borderBottom:"1px solid rgba(0,200,255,0.12)",flexShrink:0}}>
      <span style={{fontFamily:"Orbitron,monospace",fontSize:10,fontWeight:700,letterSpacing:2,color:"#00c8ff",textShadow:"0 0 10px rgba(0,200,255,0.4)"}}>{title}</span>
      <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,padding:"2px 8px",borderRadius:10,background:badgeBg,border:`1px solid ${badgeBorder}`,color:badgeColor}}>{badge}</span>
    </div>
  );
}

function ParticleBg() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current;
    if(!c) return;
    const ctx=c.getContext("2d");
    if(!ctx) return;
    let pts:{x:number;y:number;r:number;vx:number;vy:number;a:number}[]=[];
    let raf:number;
    function init(){
      if(!c) return;
      c.width=window.innerWidth;
      c.height=window.innerHeight;
      pts=Array.from({length:55},()=>({
        x:Math.random()*(c as HTMLCanvasElement).width,
        y:Math.random()*(c as HTMLCanvasElement).height,
        r:Math.random()*1.4+0.3,
        vx:(Math.random()-0.5)*0.25,
        vy:(Math.random()-0.5)*0.25,
        a:Math.random()*0.35+0.08
      }));
    }
    function draw(){
      if(!c || !ctx) return;
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(!c) return;
        if(p.x<0||p.x>c.width) p.vx*=-1;
        if(p.y<0||p.y>c.height) p.vy*=-1;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,200,255,${p.a})`;
        ctx.fill();
      });
      if(!c) return;
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        if(!c || !ctx) return;
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<110){
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(0,200,255,${0.07*(1-d/110)})`;
          ctx.lineWidth=1;ctx.stroke();
        }
      }));
      raf=requestAnimationFrame(draw);
    }
    init();
    draw();
    window.addEventListener("resize",init);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",init);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}} />;
}

function TickerBar({latestTicks}:{latestTicks:Record<string,any>}) {
  const content=SYMS.map(s=>{
    const t=latestTicks[s]; if(!t) return null;
    const up=t.change>=0;
    return (
      <span key={s} style={{padding:"0 18px",borderRight:"1px solid rgba(0,200,255,0.12)",display:"inline-flex",alignItems:"center",gap:7}}>
        <span style={{color:"#ffbe00",fontWeight:700,letterSpacing:1}}>{s}</span>
        <span>${t.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        <span style={{color:up?"#00ff9d":"#ff2d55"}}>{up?"▲":"▼"} {Math.abs(t.changePct)}%</span>
      </span>
    );
  });
  return (
    <div style={{background:"rgba(0,200,255,0.03)",borderBottom:"1px solid rgba(0,200,255,0.12)",overflow:"hidden",height:26,display:"flex",alignItems:"center",flexShrink:0,position:"relative",zIndex:10}}>
      <span style={{color:"#00c8ff",fontSize:9,fontWeight:700,padding:"0 12px",borderRight:"1px solid rgba(0,200,255,0.12)",marginRight:8,whiteSpace:"nowrap",letterSpacing:2,fontFamily:"JetBrains Mono,monospace",flexShrink:0}}>MARKET</span>
      <div style={{flex:1,overflow:"hidden"}}>
        <div style={{whiteSpace:"nowrap",display:"inline-block",fontFamily:"JetBrains Mono,monospace",fontSize:11,animation:"tickScroll 22s linear infinite"}}>
          {content}{content}
        </div>
      </div>
    </div>
  );
}

function PriceList({latestTicks,selectedSym,onSelect}:{latestTicks:Record<string,any>;selectedSym:string;onSelect:(s:string)=>void}) {
  return (
    <div style={{flex:1,overflowY:"auto"}}>
      {SYMS.map(s=>{
        const t=latestTicks[s];
        const up=t?t.change>=0:true;
        const sel=s===selectedSym;
        return (
          <div key={s} onClick={()=>onSelect(s)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:"1px solid rgba(0,200,255,0.04)",cursor:"pointer",transition:"background 0.15s",background:sel?"rgba(0,200,255,0.1)":"transparent",borderLeft:sel?"2px solid #00c8ff":"2px solid transparent"}}
            onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLDivElement).style.background="rgba(0,200,255,0.06)"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background=sel?"rgba(0,200,255,0.1)":"transparent"}}
          >
            <div style={{width:3,height:22,borderRadius:2,flexShrink:0,background:up?"#00ff9d":"#ff2d55",boxShadow:`0 0 6px ${up?"#00ff9d":"#ff2d55"}`}} />
            <span style={{fontFamily:"Orbitron,monospace",fontSize:11,fontWeight:700,color:"#ffbe00",width:50}}>{s}</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,flex:1,textAlign:"right",color:up?"#00ff9d":"#ff2d55"}}>
              {t?t.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"---"}
            </span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,width:62,textAlign:"right",color:up?"#00ff9d":"#ff2d55"}}>
              {t?`${up?"+":""}${t.changePct}%`:"---"}
            </span>
            {t?.anomaly&&<span style={{color:"#ffbe00",fontSize:10,marginLeft:4,animation:"blink 1s infinite"}}>⚠</span>}
          </div>
        );
      })}
    </div>
  );
}

function PriceChart({latestTicks,selectedSym,histRef}:{latestTicks:Record<string,any>;selectedSym:string;histRef:React.MutableRefObject<Record<string,number[]>>}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);

  const draw=useCallback(()=>{
    const canvas=canvasRef.current; const container=containerRef.current;
    if(!canvas||!container) return;
    canvas.width=container.clientWidth; canvas.height=container.clientHeight;
    const cx=canvas.getContext("2d"); if(!cx) return;
    const data=histRef.current[selectedSym]||[];
    if(data.length<2) return;
    const w=canvas.width,h=canvas.height;
    cx.clearRect(0,0,w,h);
    const mn=Math.min(...data),mx=Math.max(...data),range=mx-mn||1;
    const pd={t:18,b:26,l:8,r:72};
    const gw=w-pd.l-pd.r,gh=h-pd.t-pd.b;
    const up=data[data.length-1]>=data[0];
    const col=up?"#00ff9d":"#ff2d55";
    for(let i=0;i<=4;i++){
      const y=pd.t+gh*(i/4);
      cx.beginPath();cx.moveTo(pd.l,y);cx.lineTo(w-pd.r,y);
      cx.strokeStyle="rgba(0,200,255,0.07)";cx.lineWidth=1;cx.stroke();
      const val=mx-range*(i/4);
      cx.fillStyle="#4a7090";cx.font="9px JetBrains Mono";cx.textAlign="left";
      cx.fillText(val>100?"$"+val.toLocaleString("en-US",{maximumFractionDigits:0}):"$"+val.toFixed(3),w-pd.r+6,y+3);
    }
    for(let i=0;i<=7;i++){
      const x=pd.l+gw*(i/7);
      cx.beginPath();cx.moveTo(x,pd.t);cx.lineTo(x,pd.t+gh);
      cx.strokeStyle="rgba(0,200,255,0.04)";cx.lineWidth=1;cx.stroke();
    }
    const pt=(v:number,i:number):[number,number]=>[pd.l+gw*(i/(data.length-1)),pd.t+gh*(1-(v-mn)/range)];
    const last=pt(data[data.length-1],data.length-1);
    cx.beginPath();cx.moveTo(pd.l,last[1]);cx.lineTo(w-pd.r,last[1]);
    cx.strokeStyle=col;cx.lineWidth=1;cx.setLineDash([4,4]);cx.globalAlpha=0.35;cx.stroke();
    cx.setLineDash([]);cx.globalAlpha=1;
    const grad=cx.createLinearGradient(0,pd.t,0,pd.t+gh);
    grad.addColorStop(0,up?"rgba(0,255,157,0.22)":"rgba(255,45,85,0.22)");
    grad.addColorStop(1,"rgba(0,0,0,0)");
    cx.beginPath();
    data.forEach((v,i)=>{const[x,y]=pt(v,i);i===0?cx.moveTo(x,y):cx.lineTo(x,y);});
    cx.lineTo(last[0],pd.t+gh);cx.lineTo(pd.l,pd.t+gh);cx.closePath();
    cx.fillStyle=grad;cx.fill();
    cx.beginPath();
    data.forEach((v,i)=>{const[x,y]=pt(v,i);i===0?cx.moveTo(x,y):cx.lineTo(x,y);});
    cx.strokeStyle=col;cx.lineWidth=2;cx.shadowColor=col;cx.shadowBlur=10;cx.stroke();cx.shadowBlur=0;
    cx.beginPath();cx.arc(last[0],last[1],4,0,Math.PI*2);
    cx.fillStyle=col;cx.shadowColor=col;cx.shadowBlur=14;cx.fill();cx.shadowBlur=0;
    cx.fillStyle=col;cx.font="bold 10px JetBrains Mono";cx.textAlign="left";
    cx.fillText("$"+(data[data.length-1]>100?data[data.length-1].toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):data[data.length-1].toFixed(3)),w-pd.r+6,last[1]+4);
  },[selectedSym]);

  useEffect(()=>{draw();},[latestTicks,selectedSym,draw]);
  useEffect(()=>{
    const ro=new ResizeObserver(()=>draw());
    if(containerRef.current) ro.observe(containerRef.current);
    return()=>ro.disconnect();
  },[draw]);

  const tick=latestTicks[selectedSym];
  const data=histRef.current[selectedSym]||[];
  const latest=data[data.length-1];
  const up=latest>=(data[0]||latest);
  const col=up?"#00ff9d":"#ff2d55";

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 8px",borderBottom:"1px solid rgba(0,200,255,0.12)",flexShrink:0}}>
        <span style={{fontFamily:"Orbitron,monospace",fontSize:10,fontWeight:700,letterSpacing:2,color:"#00c8ff",textShadow:"0 0 10px rgba(0,200,255,0.4)"}}>{selectedSym}/USD — PRICE CHART</span>
        <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,padding:"2px 8px",borderRadius:10,background:"rgba(0,200,255,0.08)",border:"1px solid rgba(0,200,255,0.12)",color:"#4a7090"}}>1s INTERVAL</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderBottom:"1px solid rgba(0,200,255,0.12)",flexShrink:0}}>
        <button style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,letterSpacing:1,padding:"3px 10px",borderRadius:4,border:"1px solid #a855f7",background:"rgba(124,58,255,0.15)",color:"#a855f7",cursor:"pointer"}}>LINE</button>
        <button style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,letterSpacing:1,padding:"3px 10px",borderRadius:4,border:"1px solid rgba(0,200,255,0.12)",background:"transparent",color:"#4a7090",cursor:"pointer"}}>AREA</button>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,fontFamily:"Orbitron,monospace",fontSize:12,fontWeight:700,color:"#00c8ff"}}>
          <span>{selectedSym}</span>
          <span style={{color:"#e8f4ff",fontSize:13}}>{tick?`$${tick.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`:"---"}</span>
          <span style={{fontSize:10,color:col}}>{up?"▲":"▼"} {tick?Math.abs(tick.changePct).toFixed(3)+"%":""}</span>
        </div>
      </div>
      <div ref={containerRef} style={{flex:1,position:"relative",overflow:"hidden"}}>
        <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
      </div>
    </div>
  );
}

function VolumeChart({volHRef,latestTicks}:{volHRef:React.MutableRefObject<number[]>;latestTicks:Record<string,any>}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);
  const draw=useCallback(()=>{
    const canvas=canvasRef.current;const container=containerRef.current;
    if(!canvas||!container) return;
    canvas.width=container.clientWidth;canvas.height=container.clientHeight;
    const vx=canvas.getContext("2d");if(!vx) return;
    const data=volHRef.current;if(!data.length) return;
    const w=canvas.width,h=canvas.height;
    vx.clearRect(0,0,w,h);
    const mx=Math.max(...data)||1;
    const pd={t:8,b:16,l:4,r:36};
    const gw=w-pd.l-pd.r,gh=h-pd.t-pd.b;
    const bw=gw/data.length-1.5;
    for(let i=0;i<=2;i++){
      const y=pd.t+gh*(i/2);
      vx.strokeStyle="rgba(0,200,255,0.06)";vx.lineWidth=1;
      vx.beginPath();vx.moveTo(pd.l,y);vx.lineTo(w-pd.r,y);vx.stroke();
      vx.fillStyle="#4a7090";vx.font="9px JetBrains Mono";vx.textAlign="left";
      vx.fillText((mx*(1-i/2)).toFixed(1),w-pd.r+4,y+3);
    }
    data.forEach((v,i)=>{
      const x=pd.l+i*(gw/data.length);
      const bh=gh*(v/mx),y=pd.t+gh-bh;
      const alpha=0.35+0.65*(v/mx);
      const g=vx.createLinearGradient(0,y,0,y+bh);
      g.addColorStop(0,`rgba(0,200,255,${alpha})`);
      g.addColorStop(1,`rgba(0,100,200,${alpha*0.4})`);
      vx.fillStyle=g;
      vx.fillRect(x+1,y,bw,bh);
    });
  },[]);
  useEffect(()=>{draw();},[latestTicks,draw]);
  useEffect(()=>{
    const ro=new ResizeObserver(()=>draw());
    if(containerRef.current) ro.observe(containerRef.current);
    return()=>ro.disconnect();
  },[draw]);
  return (
    <div ref={containerRef} style={{flex:1,position:"relative",overflow:"hidden"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
    </div>
  );
}

function HeatMap({latestTicks,onSelect}:{latestTicks:Record<string,any>;onSelect:(s:string)=>void}) {
  return (
    <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"1fr 1fr",gap:6,padding:10}}>
      {SYMS.map(s=>{
        const t=latestTicks[s];
        const p=t?t.changePct:0;
        const up=p>=0;
        const intensity=Math.min(Math.abs(p)/1.5,1);
        const bg=up?`rgba(0,${Math.round(80+intensity*140)},${Math.round(50+intensity*60)},${0.3+intensity*0.45})`:`rgba(${Math.round(100+intensity*130)},${Math.round(20+intensity*10)},${Math.round(25+intensity*15)},${0.3+intensity*0.45})`;
        const f=t?(t.price>10000?"$"+Math.round(t.price/1000)+"K":"$"+t.price.toLocaleString("en-US",{maximumFractionDigits:0})):"";
        return (
          <div key={s} onClick={()=>onSelect(s)}
            style={{borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"8px 4px",border:"1px solid rgba(0,0,0,0.2)",cursor:"pointer",background:bg,transition:"all 0.3s",position:"relative",overflow:"hidden"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="scale(1.04)";(e.currentTarget as HTMLDivElement).style.filter="brightness(1.2)"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="scale(1)";(e.currentTarget as HTMLDivElement).style.filter="none"}}
          >
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:up?"rgba(0,255,157,0.3)":"rgba(255,45,85,0.3)"}} />
            <span style={{fontFamily:"Orbitron,monospace",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.92)"}}>{s}</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,margin:"2px 0",color:up?"#00ff9d":"#ff2d55"}}>{t?`${p>=0?"+":""}${p.toFixed(2)}%`:"---"}</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:8,color:"rgba(255,255,255,0.5)"}}>{f}</span>
          </div>
        );
      })}
    </div>
  );
}

function AlertFeed({alerts}:{alerts:Array<{id:number;timestamp:string;message:string;severity:string;type:string}>}) {
  const dotColor:Record<string,string>={HIGH:"#ff2d55",MEDIUM:"#ffbe00",LOW:"#00c8ff"};
  const msgColor:Record<string,string>={HIGH:"#ff6b6b",MEDIUM:"#ffbe00",LOW:"#e8f4ff"};
  const typeIcon:Record<string,string>={PRICE_SPIKE:"⚡",VOLUME_SPIKE:"📊",VOLATILITY_BURST:"🌊",FLASH_CRASH:"💥",SUDDEN_PUMP:"🚀",VOLATILITY_SPIKE:"⚠"};
  return (
    <div style={{flex:1,overflowY:"auto"}}>
      {alerts.length===0?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#4a7090",fontFamily:"JetBrains Mono,monospace",fontSize:10}}>MONITORING...</div>
      ):alerts.map(a=>(
        <div key={a.id}
          style={{display:"flex",alignItems:"flex-start",gap:10,padding:"6px 14px",borderBottom:"1px solid rgba(0,200,255,0.04)",animation:"alin 0.3s ease-out",transition:"background 0.15s"}}
          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(0,200,255,0.04)"}
          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}
        >
          <div style={{width:6,height:6,borderRadius:"50%",marginTop:4,flexShrink:0,background:dotColor[a.severity]||"#00c8ff",boxShadow:`0 0 6px ${dotColor[a.severity]||"#00c8ff"}`,animation:a.severity==="HIGH"?"blink 0.4s infinite":undefined}} />
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",flexShrink:0,paddingTop:1}}>{a.timestamp}</div>
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,lineHeight:1.5,color:msgColor[a.severity]||"#e8f4ff"}}>{typeIcon[a.type]||"•"} {a.message}</div>
        </div>
      ))}
    </div>
  );
}

function AISignalPanel({latestTicks,alerts}:{latestTicks:Record<string,any>;alerts:Array<any>}) {
  const signals=SYMS.map(symbol=>{
    const tick=latestTicks[symbol];
    const recentAlerts=alerts.filter((a:any)=>a.message.includes(symbol)).slice(0,3);
    if(!tick) return {symbol,signal:"HOLD",confidence:50,reason:"Awaiting data"};
    const pct=tick.changePct;
    const hasAnomaly=!!tick.anomaly;
    const hasHighAlert=recentAlerts.some((a:any)=>a.severity==="HIGH");
    let signal:"BUY"|"SELL"|"HOLD"="HOLD",confidence=50,reason="Stable market conditions";
    if(hasHighAlert||pct<-1){signal="SELL";confidence=75;reason="High anomaly detected";}
    else if(pct>0.5&&!hasAnomaly){signal="BUY";confidence=65;reason="Positive momentum";}
    else if(pct<-0.3){signal="SELL";confidence=60;reason="Negative trend";}
    else if(hasAnomaly){signal="HOLD";confidence=55;reason="Anomaly — wait";}
    return {symbol,signal,confidence,reason};
  });
  const col=(s:string)=>s==="BUY"?"#00ff9d":s==="SELL"?"#ff2d55":"#00c8ff";
  const bg=(s:string)=>s==="BUY"?"rgba(0,255,157,0.12)":s==="SELL"?"rgba(255,45,85,0.12)":"rgba(0,200,255,0.08)";
  const br=(s:string)=>s==="BUY"?"rgba(0,255,157,0.3)":s==="SELL"?"rgba(255,45,85,0.3)":"rgba(0,200,255,0.2)";
  return (
    <div style={{overflowY:"auto",flex:1}}>
      {signals.map(s=>(
        <div key={s.symbol} style={{padding:"8px 14px",borderBottom:"1px solid rgba(0,200,255,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontFamily:"Orbitron,monospace",fontSize:11,fontWeight:700,color:"#ffbe00"}}>{s.symbol}</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,padding:"2px 8px",borderRadius:10,background:bg(s.signal),border:`1px solid ${br(s.signal)}`,color:col(s.signal),letterSpacing:1}}>{s.signal}</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",maxWidth:80,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.reason}</span>
          </div>
          <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
            <div style={{height:"100%",borderRadius:1,width:`${s.confidence}%`,background:col(s.signal),transition:"width 0.6s ease"}} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SimulationControls({selectedSym,onSelect}:{selectedSym:string;onSelect:(s:string)=>void}) {
  const [loading,setLoading]=useState<string|null>(null);
  const [lastEvent,setLastEvent]=useState<string|null>(null);
  const EVENTS=[
    {type:"FLASH_CRASH",label:"Flash Crash",color:"#ff2d55",icon:"↘",desc:"Simulate sudden sell-off"},
    {type:"SUDDEN_PUMP",label:"Sudden Pump",color:"#00ff9d",icon:"↗",desc:"Simulate rapid surge"},
    {type:"VOLATILITY_SPIKE",label:"Volatility Spike",color:"#ffbe00",icon:"⚡",desc:"Simulate erratic movement"},
  ];
  const trigger=async(type:string)=>{
    setLoading(type);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,symbol:selectedSym})});
      setLastEvent(`${type} triggered on ${selectedSym}`);
      setTimeout(()=>setLastEvent(null),4000);
    } catch { setLastEvent("Error: Backend not reachable"); }
    finally { setLoading(null); }
  };
  return (
    <div style={{padding:"8px 14px",display:"flex",flexDirection:"column",gap:8,flex:1,overflowY:"auto"}}>
      <div>
        <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:2,marginBottom:4}}>TARGET SYMBOL</div>
        <select value={selectedSym} onChange={e=>onSelect(e.target.value)} style={{width:"100%",background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.12)",borderRadius:8,color:"#e8f4ff",fontFamily:"Orbitron,monospace",fontSize:11,padding:"6px 10px",outline:"none",cursor:"pointer",letterSpacing:1}}>
          {SYMS.map(s=><option key={s} value={s} style={{background:"#0a1520"}}>{s}</option>)}
        </select>
      </div>
      {EVENTS.map(ev=>(
        <button key={ev.type} onClick={()=>trigger(ev.type)} disabled={!!loading}
          style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:8,border:`1px solid ${ev.color}40`,background:"transparent",cursor:"pointer",fontFamily:"JetBrains Mono,monospace",fontSize:11,color:ev.color,transition:"all 0.2s",opacity:loading?0.5:1,width:"100%"}}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=`${ev.color}10`;(e.currentTarget as HTMLButtonElement).style.borderColor=ev.color;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.borderColor=`${ev.color}40`;}}
        >
          <span style={{fontSize:16}}>{ev.icon}</span>
          <span style={{display:"flex",flexDirection:"column",textAlign:"left"}}>
            <span style={{fontWeight:700,letterSpacing:1}}>{ev.label}</span>
            <span style={{fontSize:9,opacity:0.5}}>{ev.desc}</span>
          </span>
          {loading===ev.type&&<span style={{marginLeft:"auto",fontSize:9,color:"#4a7090",animation:"blink 1s infinite"}}>RUNNING...</span>}
        </button>
      ))}
      {lastEvent&&(
        <div style={{fontSize:10,color:"#00ff9d",border:"1px solid rgba(0,255,157,0.2)",borderRadius:8,padding:"8px 12px",background:"rgba(0,255,157,0.05)",display:"flex",alignItems:"center",gap:8,fontFamily:"JetBrains Mono,monospace",animation:"alin 0.3s ease-out"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d",flexShrink:0,display:"inline-block"}} />
          {lastEvent}
        </div>
      )}
    </div>
  );
}
