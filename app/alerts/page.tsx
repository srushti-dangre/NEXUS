"use client";
import { useSocket } from "../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const TYPE_ICONS: Record<string,string> = {
  PRICE_SPIKE:"⚡",VOLUME_SPIKE:"📊",VOLATILITY_BURST:"🌊",
  FLASH_CRASH:"💥",SUDDEN_PUMP:"🚀",VOLATILITY_SPIKE:"⚠",
};

export default function AlertsPage() {
  const { alerts } = useSocket();
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [toasts, setToasts] = useState<Array<{id:number;message:string;severity:string;type:string}>>([]);
  const prevAlertCount = useRef(0);
  const dotColor:Record<string,string>={HIGH:"#ff2d55",MEDIUM:"#ffbe00",LOW:"#00c8ff"};

  useEffect(() => {
    if (!localStorage.getItem("nexus_user")) router.push("/login");
  }, []);

  // Request notification permission
  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications not supported");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotifEnabled(true);
      new Notification("NEXUS Terminal", {
        body: "🔔 Notifications enabled! You'll be alerted on HIGH severity anomalies.",
        icon: "/favicon.ico",
      });
    }
  };

  // Watch for new alerts and fire notifications + toasts
  useEffect(() => {
    if (alerts.length > prevAlertCount.current) {
      const newAlerts = alerts.slice(0, alerts.length - prevAlertCount.current);
      newAlerts.forEach((a: any) => {
        // Toast notification (always)
        const toast = { id: Date.now() + Math.random(), message: a.message, severity: a.severity, type: a.type };
        setToasts(prev => [toast, ...prev.slice(0, 4)]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 4000);

        // Browser notification (only HIGH severity)
        if (notifEnabled && a.severity === "HIGH" && Notification.permission === "granted") {
          new Notification(`⚠ NEXUS ALERT — ${a.severity}`, {
            body: `${TYPE_ICONS[a.type] || "•"} ${a.message}`,
            icon: "/favicon.ico",
            tag: a.type,
          });
        }
      });
    }
    prevAlertCount.current = alerts.length;
  }, [alerts, notifEnabled]);

  // Check if notifications already granted on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotifEnabled(true);
    }
  }, []);

  const filtered = filter === "ALL" ? alerts : alerts.filter((a: any) => a.severity === filter);

  return (
    <div style={{minHeight:"100vh",background:"#030508",color:"#e8f4ff",fontFamily:"Rajdhani,sans-serif"}}>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}} />

      {/* TOAST NOTIFICATIONS */}
      <div style={{position:"fixed",top:80,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:"rgba(10,25,45,0.95)",
            border:`1px solid ${dotColor[t.severity]||"#00c8ff"}`,
            borderLeft:`3px solid ${dotColor[t.severity]||"#00c8ff"}`,
            borderRadius:8,
            padding:"10px 14px",
            minWidth:280,
            maxWidth:360,
            backdropFilter:"blur(20px)",
            boxShadow:`0 4px 24px rgba(0,0,0,0.5), 0 0 12px ${dotColor[t.severity]||"#00c8ff"}30`,
            animation:"slideIn 0.3s ease-out",
            pointerEvents:"auto",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:dotColor[t.severity]||"#00c8ff",boxShadow:`0 0 6px ${dotColor[t.severity]||"#00c8ff"}`,flexShrink:0,animation:t.severity==="HIGH"?"blink 0.4s infinite":undefined}} />
              <span style={{fontFamily:"Orbitron,monospace",fontSize:9,color:dotColor[t.severity]||"#00c8ff",letterSpacing:2,fontWeight:700}}>{t.severity} ALERT</span>
              <span style={{marginLeft:"auto",fontSize:12}}>{TYPE_ICONS[t.type]||"•"}</span>
            </div>
            <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#e8f4ff",lineHeight:1.4}}>{t.message}</div>
          </div>
        ))}
      </div>

      <NavBar active="ALERTS" />

      <div style={{padding:20,position:"relative",zIndex:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <h1 style={{fontFamily:"Orbitron,monospace",fontSize:18,fontWeight:900,color:"#00c8ff",letterSpacing:3}}>ANOMALY ALERTS</h1>
            <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090",marginTop:4}}>Real-time market anomaly detection feed</p>
          </div>
          {/* Notification toggle button */}
          <button onClick={enableNotifications}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:8,border:`1px solid ${notifEnabled?"rgba(0,255,157,0.4)":"rgba(0,200,255,0.3)"}`,background:notifEnabled?"rgba(0,255,157,0.08)":"rgba(0,200,255,0.05)",color:notifEnabled?"#00ff9d":"#00c8ff",fontFamily:"JetBrains Mono,monospace",fontSize:10,cursor:"pointer",letterSpacing:1,transition:"all 0.2s"}}
            onMouseEnter={e=>{(e.currentTarget).style.boxShadow=notifEnabled?"0 0 16px rgba(0,255,157,0.2)":"0 0 16px rgba(0,200,255,0.2)";}}
            onMouseLeave={e=>{(e.currentTarget).style.boxShadow="none";}}
          >
            <span style={{fontSize:16}}>{notifEnabled ? "🔔" : "🔕"}</span>
            <span style={{fontWeight:700}}>{notifEnabled ? "NOTIFICATIONS ON" : "ENABLE NOTIFICATIONS"}</span>
            {notifEnabled && <span style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d",boxShadow:"0 0 6px #00ff9d",animation:"blink 1.2s infinite",display:"inline-block"}} />}
          </button>
        </div>

        {/* Summary filter cards */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[
            {label:"TOTAL",count:alerts.length,color:"#00c8ff",key:"ALL"},
            {label:"HIGH",count:alerts.filter((a:any)=>a.severity==="HIGH").length,color:"#ff2d55",key:"HIGH"},
            {label:"MEDIUM",count:alerts.filter((a:any)=>a.severity==="MEDIUM").length,color:"#ffbe00",key:"MEDIUM"},
            {label:"LOW",count:alerts.filter((a:any)=>a.severity==="LOW").length,color:"#00ff9d",key:"LOW"},
          ].map(p=>(
            <div key={p.key} onClick={()=>setFilter(p.key)}
              style={{background:filter===p.key?`${p.color}15`:"rgba(10,25,45,0.7)",border:`1px solid ${filter===p.key?p.color:"rgba(0,200,255,0.12)"}`,borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.2s",boxShadow:filter===p.key?`0 0 16px ${p.color}20`:"none"}}>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:24,fontWeight:900,color:p.color}}>{p.count}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:1}}>{p.label}<br/>ALERTS</div>
            </div>
          ))}
        </div>

        {/* Alerts Table */}
        <div style={{background:"rgba(10,25,45,0.7)",border:"1px solid rgba(0,200,255,0.12)",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(0,200,255,0.12)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"Orbitron,monospace",fontSize:11,fontWeight:700,color:"#00c8ff",letterSpacing:2}}>ALERT FEED — {filter}</span>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090"}}>{filtered.length} EVENTS</span>
          </div>
          <div style={{maxHeight:500,overflowY:"auto"}}>
            {filtered.length===0?(
              <div style={{padding:40,textAlign:"center",fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090"}}>NO ALERTS FOR THIS FILTER</div>
            ):filtered.map((a:any)=>(
              <div key={a.id}
                style={{display:"flex",alignItems:"center",gap:16,padding:"12px 20px",borderBottom:"1px solid rgba(0,200,255,0.04)",transition:"background 0.15s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(0,200,255,0.04)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}
              >
                <div style={{width:8,height:8,borderRadius:"50%",background:dotColor[a.severity]||"#00c8ff",boxShadow:`0 0 8px ${dotColor[a.severity]||"#00c8ff"}`,flexShrink:0,animation:a.severity==="HIGH"?"blink 0.4s infinite":undefined}} />
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090",width:70,flexShrink:0}}>{a.timestamp}</span>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:14}}>{TYPE_ICONS[a.type]||"•"}</span>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,flex:1,color:"#e8f4ff"}}>{a.message}</span>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,padding:"2px 10px",borderRadius:10,background:`${dotColor[a.severity]||"#00c8ff"}15`,border:`1px solid ${dotColor[a.severity]||"#00c8ff"}40`,color:dotColor[a.severity]||"#00c8ff",flexShrink:0}}>{a.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes logoPulse {0%,100%{box-shadow:0 0 16px rgba(0,200,255,0.4)}50%{box-shadow:0 0 28px rgba(0,200,255,0.8)}}
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
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
          <button key={t} onClick={()=>router.push(routes[t])}
            style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,letterSpacing:1,padding:"4px 14px",borderRadius:20,border:`1px solid ${t===active?"#00c8ff":"rgba(0,200,255,0.12)"}`,background:t===active?"rgba(0,200,255,0.08)":"transparent",color:t===active?"#00c8ff":"#4a7090",cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>{if(t!==active){(e.currentTarget).style.borderColor="#00c8ff";(e.currentTarget).style.color="#00c8ff";}}}
            onMouseLeave={e=>{if(t!==active){(e.currentTarget).style.borderColor="rgba(0,200,255,0.12)";(e.currentTarget).style.color="#4a7090";}}}
          >{t}</button>
        ))}
      </div>
      <button onClick={()=>{localStorage.removeItem("nexus_user");router.push("/login");}}
        style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#ff2d55",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(255,45,85,0.3)",background:"rgba(255,45,85,0.05)",cursor:"pointer",letterSpacing:1}}>LOGOUT</button>
    </nav>
  );
}