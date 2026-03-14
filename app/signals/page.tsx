"use client";
import { useSocket } from "../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SYMS = ["BTC","ETH","AAPL","NIFTY","GOOGL","TSLA"];

export default function SignalsPage() {
  const { latestTicks, alerts } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("nexus_user")) router.push("/login");
  }, []);

  const signals = SYMS.map(symbol => {
    const tick = latestTicks[symbol];
    const recentAlerts = alerts.filter((a:any) => a.message.includes(symbol)).slice(0,3);
    if (!tick) return {symbol,signal:"HOLD",confidence:50,reason:"Awaiting data",pct:0};
    const pct = tick.changePct;
    const hasAnomaly = !!tick.anomaly;
    const hasHighAlert = recentAlerts.some((a:any) => a.severity==="HIGH");
    let signal:"BUY"|"SELL"|"HOLD"="HOLD", confidence=50, reason="Stable market conditions";
    if (hasHighAlert||pct<-1){signal="SELL";confidence=75;reason="High anomaly detected";}
    else if (pct>0.5&&!hasAnomaly){signal="BUY";confidence=65;reason="Positive momentum";}
    else if (pct<-0.3){signal="SELL";confidence=60;reason="Negative trend";}
    else if (hasAnomaly){signal="HOLD";confidence=55;reason="Anomaly — wait for clarity";}
    return {symbol,signal,confidence,reason,pct};
  });

  const col=(s:string)=>s==="BUY"?"#00ff9d":s==="SELL"?"#ff2d55":"#00c8ff";
  const bg=(s:string)=>s==="BUY"?"rgba(0,255,157,0.08)":s==="SELL"?"rgba(255,45,85,0.08)":"rgba(0,200,255,0.08)";

  return (
    <div style={{minHeight:"100vh",background:"#030508",color:"#e8f4ff",fontFamily:"Rajdhani,sans-serif"}}>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}} />
      <NavBar active="SIGNALS" />

      <div style={{padding:20,position:"relative",zIndex:10}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontFamily:"Orbitron,monospace",fontSize:18,fontWeight:900,color:"#00c8ff",letterSpacing:3}}>AI SIGNAL ENGINE</h1>
          <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090",marginTop:4}}>Real-time buy/sell/hold recommendations powered by anomaly detection</p>
        </div>

        {/* Summary pills */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[
            {label:"BUY SIGNALS",count:signals.filter(s=>s.signal==="BUY").length,color:"#00ff9d"},
            {label:"SELL SIGNALS",count:signals.filter(s=>s.signal==="SELL").length,color:"#ff2d55"},
            {label:"HOLD SIGNALS",count:signals.filter(s=>s.signal==="HOLD").length,color:"#00c8ff"},
          ].map(p=>(
            <div key={p.label} style={{background:"rgba(10,25,45,0.7)",border:`1px solid ${p.color}30`,borderRadius:12,padding:"16px 24px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:28,fontWeight:900,color:p.color}}>{p.count}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:1}}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* Signal Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {signals.map(s=>(
            <div key={s.symbol} style={{background:"rgba(10,25,45,0.7)",border:`1px solid ${col(s.signal)}25`,borderRadius:14,padding:20,position:"relative",overflow:"hidden",transition:"border-color 0.3s"}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=`${col(s.signal)}60`}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=`${col(s.signal)}25`}
            >
              <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:`linear-gradient(90deg,transparent,${col(s.signal)},transparent)`,opacity:0.4}} />
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontFamily:"Orbitron,monospace",fontSize:16,fontWeight:900,color:"#ffbe00"}}>{s.symbol}</span>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,padding:"4px 14px",borderRadius:20,background:bg(s.signal),border:`1px solid ${col(s.signal)}50`,color:col(s.signal),fontWeight:700,letterSpacing:2}}>{s.signal}</span>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:1}}>CONFIDENCE</span>
                  <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:col(s.signal)}}>{s.confidence}%</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                  <div style={{height:"100%",width:`${s.confidence}%`,background:`linear-gradient(90deg,${col(s.signal)},${col(s.signal)}80)`,borderRadius:3,boxShadow:`0 0 8px ${col(s.signal)}60`,transition:"width 0.6s"}} />
                </div>
              </div>
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090",padding:"8px 12px",background:"rgba(0,0,0,0.2)",borderRadius:6}}>
                {s.reason}
              </div>
              <div style={{marginTop:12,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090"}}>CHANGE</span>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,color:s.pct>=0?"#00ff9d":"#ff2d55"}}>{s.pct>=0?"+":""}{s.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes logoPulse{0%,100%{box-shadow:0 0 16px rgba(0,200,255,0.4)}50%{box-shadow:0 0 28px rgba(0,200,255,0.8)}}`}</style>
    </div>
  );
}

function NavBar({active}:{active:string}) {
  const router = useRouter();
  const tabs = ["OVERVIEW","ANALYTICS","SIGNALS","ALERTS"];
  const routes: Record<string,string> = {OVERVIEW:"/",ANALYTICS:"/analytics",SIGNALS:"/signals",ALERTS:"/alerts"};
  return (
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px",background:"rgba(3,5,8,0.96)",borderBottom:"1px solid rgba(0,200,255,0.12)",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:34,height:34,border:"2px solid #00c8ff",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Orbitron,monospace",fontSize:15,fontWeight:900,color:"#00c8ff",animation:"logoPulse 2s ease-in-out infinite"}}>N</div>
        <div>
          <div style={{fontFamily:"Orbitron,monospace",fontSize:20,fontWeight:900,letterSpacing:5,color:"#e8f4ff"}}>NEX<span style={{color:"#00c8ff"}}>US</span></div>
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:2}}>MARKET INTELLIGENCE v2.4</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>router.push(routes[t])} style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,letterSpacing:1,padding:"4px 14px",borderRadius:20,border:`1px solid ${t===active?"#00c8ff":"rgba(0,200,255,0.12)"}`,background:t===active?"rgba(0,200,255,0.08)":"transparent",color:t===active?"#00c8ff":"#4a7090",cursor:"pointer",transition:"all 0.2s"}}>{t}</button>
        ))}
      </div>
      <button onClick={()=>{localStorage.removeItem("nexus_user");router.push("/login");}} style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#ff2d55",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,45,85,0.3)",background:"rgba(255,45,85,0.05)",cursor:"pointer",letterSpacing:1}}>LOGOUT</button>
    </nav>
  );
}