"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { username: "trader", password: "trade123", role: "Trader" },
  { username: "analyst", password: "analyst123", role: "Analyst" },
  { username: "admin", password: "admin123", role: "Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("nexus_user", JSON.stringify(user));
      router.push("/");
    } else {
      setError("Invalid credentials. Try trader/trade123");
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#030508",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Rajdhani,sans-serif",position:"relative",overflow:"hidden"}}>

      {/* Grid overlay */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}} />

      {/* Glow orbs */}
      <div style={{position:"fixed",top:"-20%",left:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,200,255,0.06) 0%,transparent 70%)",pointerEvents:"none"}} />
      <div style={{position:"fixed",bottom:"-20%",right:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,255,0.06) 0%,transparent 70%)",pointerEvents:"none"}} />

      {/* Login Card */}
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:420,padding:"0 20px"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,border:"2px solid #00c8ff",borderRadius:14,fontFamily:"Orbitron,monospace",fontSize:24,fontWeight:900,color:"#00c8ff",marginBottom:16,boxShadow:"0 0 24px rgba(0,200,255,0.4),inset 0 0 14px rgba(0,200,255,0.1)",animation:"logoPulse 2s ease-in-out infinite"}}>N</div>
          <div style={{fontFamily:"Orbitron,monospace",fontSize:28,fontWeight:900,letterSpacing:6,color:"#e8f4ff"}}>NEX<span style={{color:"#00c8ff"}}>US</span></div>
          <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#4a7090",letterSpacing:3,marginTop:4}}>MARKET INTELLIGENCE TERMINAL</div>
        </div>

        {/* Card */}
        <div style={{background:"rgba(10,25,45,0.8)",border:"1px solid rgba(0,200,255,0.15)",borderRadius:16,padding:32,backdropFilter:"blur(20px)",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,#00c8ff,transparent)",opacity:0.5}} />

          <div style={{fontFamily:"Orbitron,monospace",fontSize:12,fontWeight:700,color:"#00c8ff",letterSpacing:2,marginBottom:24,textAlign:"center"}}>SECURE ACCESS</div>

          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Username */}
            <div>
              <label style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:2,display:"block",marginBottom:6}}>USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                placeholder="Enter username..."
                style={{width:"100%",background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:8,color:"#e8f4ff",fontFamily:"JetBrains Mono,monospace",fontSize:12,padding:"10px 14px",outline:"none",transition:"border-color 0.2s"}}
                onFocus={e=>(e.target.style.borderColor="#00c8ff")}
                onBlur={e=>(e.target.style.borderColor="rgba(0,200,255,0.2)")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:2,display:"block",marginBottom:6}}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Enter password..."
                style={{width:"100%",background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:8,color:"#e8f4ff",fontFamily:"JetBrains Mono,monospace",fontSize:12,padding:"10px 14px",outline:"none",transition:"border-color 0.2s"}}
                onFocus={e=>(e.target.style.borderColor="#00c8ff")}
                onBlur={e=>(e.target.style.borderColor="rgba(0,200,255,0.2)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"#ff6b6b",background:"rgba(255,45,85,0.08)",border:"1px solid rgba(255,45,85,0.2)",borderRadius:6,padding:"8px 12px"}}>
                ⚠ {error}
              </div>
            )}

            {/* Role pills */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {USERS.map(u=>(
                <button key={u.username} type="button" onClick={()=>{setUsername(u.username);setPassword(u.password);}}
                  style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,padding:"3px 10px",borderRadius:20,border:"1px solid rgba(0,200,255,0.2)",background:"rgba(0,200,255,0.05)",color:"#4a7090",cursor:"pointer",transition:"all 0.2s",letterSpacing:1}}
                  onMouseEnter={e=>{(e.currentTarget).style.borderColor="#00c8ff";(e.currentTarget).style.color="#00c8ff";}}
                  onMouseLeave={e=>{(e.currentTarget).style.borderColor="rgba(0,200,255,0.2)";(e.currentTarget).style.color="#4a7090";}}
                >{u.role.toUpperCase()}</button>
              ))}
              <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",paddingTop:4}}>← quick fill</span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"12px",borderRadius:8,border:"1px solid #00c8ff",background:loading?"rgba(0,200,255,0.05)":"rgba(0,200,255,0.1)",color:"#00c8ff",fontFamily:"Orbitron,monospace",fontSize:11,fontWeight:700,letterSpacing:3,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s",boxShadow:loading?"none":"0 0 20px rgba(0,200,255,0.15)"}}
              onMouseEnter={e=>{if(!loading){(e.currentTarget).style.background="rgba(0,200,255,0.2)";(e.currentTarget).style.boxShadow="0 0 30px rgba(0,200,255,0.3)";}}}
              onMouseLeave={e=>{if(!loading){(e.currentTarget).style.background="rgba(0,200,255,0.1)";(e.currentTarget).style.boxShadow="0 0 20px rgba(0,200,255,0.15)";}}}
            >
              {loading ? "AUTHENTICATING..." : "ACCESS TERMINAL"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:20,fontFamily:"JetBrains Mono,monospace",fontSize:9,color:"#4a7090",letterSpacing:1}}>
          SMART INDIA HACKATHON 2024 — TEAM NEXUS
        </div>
      </div>

      <style>{`
        @keyframes logoPulse {
          0%,100%{box-shadow:0 0 24px rgba(0,200,255,0.4),inset 0 0 14px rgba(0,200,255,0.1);}
          50%{box-shadow:0 0 40px rgba(0,200,255,0.8),inset 0 0 24px rgba(0,200,255,0.2);}
        }
        input::placeholder { color: #4a7090; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}