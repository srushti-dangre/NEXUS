"use client";
import { useSocket } from "../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SYMS = ["BTC","ETH","AAPL","NIFTY","GOOGL","TSLA"];

export default function AnalyticsPage() {
  const { latestTicks, marketData } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("nexus_user")) router.push("/login");
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"#030508",color:"#e8f4ff",fontFamily:"Rajdhani,sans-serif",overflow:"auto"}}>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}} />

      {/* NAV */}
      <NavBar active="ANALYTICS" />

      {/* CONTENT */}
      <div style={{padding:"20px",position:"relative",zIndex:10}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontFamily:"Orbitron,monospace",fontSize:18,fontWeight:900,color:"#00c8ff",letterSpacing:3}}>MARKET ANALYTICS</h1>
          <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090",marginTop:4}}>Deep dive into market performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:20}}>
          {SYMS.map(s => {
            const t = latestTicks[s];
            const up = t ? t.change >= 0 : true;
            return (
              <div key={s} style={{background:"rgba(10,25,45,0.7)",border:"1px solid rgba(0,200,255,0.12)",borderRadius:12,padding:16,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:`linear-gradient(90deg,transparent,${up?"#00ff9d":"#ff2d55"},transparent)`,opacity:0.5}} />
                <div style={{fontFamily:"Orbitron,monospace",fontSize:10,fontWeight:700,color:"#ffbe00",marginBottom:8}}>{s}</div>
                <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:14,fontWeight:700,color:up?"#00ff9d":"#ff2d55"}}>
                  {t ? "$"+t.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}) : "---"}
                </div>
                <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:up?"#00ff9d":"#ff2d55",marginTop:4}}>
                  {t ? `${up?"+":""}${t.changePct}%` : "---"}
                </div>
                <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",marginTop:4}}>
                  Vol: {t ? (t.volume/1000000).toFixed(2)+"M" : "---"}
                </div>
                {/* Mini bar */}
                <div style={{marginTop:8,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                  <div style={{height:"100%",width:`${Math.min(Math.abs(t?.changePct||0)*20,100)}%`,background:up?"#00ff9d":"#ff2d55",borderRadius:2,transition:"width 0.5s"}} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Table */}
        <div style={{background:"rgba(10,25,45,0.7)",border:"1px solid rgba(0,200,255,0.12)",borderRadius:12,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(0,200,255,0.12)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"Orbitron,monospace",fontSize:11,fontWeight:700,color:"#00c8ff",letterSpacing:2}}>PERFORMANCE TABLE</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090"}}>LIVE DATA</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid rgba(0,200,255,0.08)"}}>
                {["SYMBOL","PRICE","CHANGE","CHANGE %","VOLUME","STATUS"].map(h=>(
                  <th key={h} style={{padding:"10px 20px",textAlign:"left",fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:1,fontWeight:400}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SYMS.map((s,i) => {
                const t = latestTicks[s];
                const up = t ? t.change >= 0 : true;
                return (
                  <tr key={s} style={{borderBottom:"1px solid rgba(0,200,255,0.04)",transition:"background 0.15s"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="rgba(0,200,255,0.04)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}
                  >
                    <td style={{padding:"12px 20px",fontFamily:"Orbitron,monospace",fontSize:11,fontWeight:700,color:"#ffbe00"}}>{s}</td>
                    <td style={{padding:"12px 20px",fontFamily:"JetBrains Mono,monospace",fontSize:12,color:"#e8f4ff"}}>
                      {t?"$"+t.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"---"}
                    </td>
                    <td style={{padding:"12px 20px",fontFamily:"JetBrains Mono,monospace",fontSize:11,color:up?"#00ff9d":"#ff2d55"}}>
                      {t?`${up?"+":""}${t.change.toFixed(2)}`:"---"}
                    </td>
                    <td style={{padding:"12px 20px",fontFamily:"JetBrains Mono,monospace",fontSize:11,color:up?"#00ff9d":"#ff2d55"}}>
                      {t?`${up?"+":""}${t.changePct}%`:"---"}
                    </td>
                    <td style={{padding:"12px 20px",fontFamily:"JetBrains Mono,monospace",fontSize:11,color:"#4a7090"}}>
                      {t?(t.volume/1000000).toFixed(2)+"M":"---"}
                    </td>
                    <td style={{padding:"12px 20px"}}>
                      <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,padding:"2px 8px",borderRadius:10,background:up?"rgba(0,255,157,0.1)":"rgba(255,45,85,0.1)",border:`1px solid ${up?"rgba(0,255,157,0.3)":"rgba(255,45,85,0.3)"}`,color:up?"#00ff9d":"#ff2d55"}}>
                        {up?"BULLISH":"BEARISH"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Market Summary Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {label:"TOTAL VOLUME",value:SYMS.reduce((acc,s)=>acc+(latestTicks[s]?.volume||0),0),fmt:(v:number)=>(v/1000000).toFixed(2)+"M",color:"#00c8ff"},
            {label:"GAINERS",value:SYMS.filter(s=>(latestTicks[s]?.change||0)>=0).length,fmt:(v:number)=>v+"/"+SYMS.length,color:"#00ff9d"},
            {label:"LOSERS",value:SYMS.filter(s=>(latestTicks[s]?.change||0)<0).length,fmt:(v:number)=>v+"/"+SYMS.length,color:"#ff2d55"},
          ].map(card=>(
            <div key={card.label} style={{background:"rgba(10,25,45,0.7)",border:"1px solid rgba(0,200,255,0.12)",borderRadius:12,padding:20,textAlign:"center"}}>
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:2,marginBottom:8}}>{card.label}</div>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:28,fontWeight:900,color:card.color}}>{card.fmt(card.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes logoPulse {
          0%,100%{box-shadow:0 0 16px rgba(0,200,255,0.4),inset 0 0 10px rgba(0,200,255,0.1);}
          50%{box-shadow:0 0 28px rgba(0,200,255,0.8),inset 0 0 18px rgba(0,200,255,0.2);}
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
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
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>{localStorage.removeItem("nexus_user");router.push("/login");}} style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#ff2d55",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,45,85,0.3)",background:"rgba(255,45,85,0.05)",cursor:"pointer",letterSpacing:1}}>LOGOUT</button>
      </div>
    </nav>
  );
}