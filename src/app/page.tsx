"use client";

import { useState } from "react";
import { 
  Send, 
  Sparkles, 
  Terminal as TerminalIcon, 
  Mail, 
  Phone, 
  UserCheck, 
  Layers, 
  RefreshCw, 
  Play,
  Zap,
  Info,
  Database,
  ArrowRight
} from "lucide-react";

interface IdentifyResponse {
  contact: {
    primaryContactId: string;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: string[];
  };
}

export default function Playground() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<IdentifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scenarios = [
    {
      name: "1. Create New Parent",
      desc: "Creates a brand new primary contact record.",
      email: "doc@timetravel.com",
      phone: "1234567890",
      icon: Database,
      iconColor: "text-teal-400 bg-teal-500/10"
    },
    {
      name: "2. Link Secondary",
      desc: "Shares email but introduces a new phone number. Creates a linked secondary.",
      email: "doc@timetravel.com",
      phone: "0987654321",
      icon: Zap,
      iconColor: "text-cyan-400 bg-cyan-500/10"
    },
    {
      name: "3. Merge Two Clusters",
      desc: "Connects two previously separate primary clusters. The oldest primary survives.",
      email: "marty@future.com",
      phone: "0987654321",
      icon: Layers,
      iconColor: "text-indigo-400 bg-indigo-500/10"
    }
  ];

  const handleApplyPreset = (preset: typeof scenarios[0]) => {
    setEmail(preset.email);
    setPhoneNumber(preset.phone);
    setErrorMsg(null);
  };

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setRawResponse(null);

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || null,
          phoneNumber: phoneNumber.trim() || null
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrorMsg(data.error?.message || "An error occurred during reconciliation.");
      } else {
        setRawResponse(data);
      }
    } catch {
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setEmail("");
    setPhoneNumber("");
    setRawResponse(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 sm:space-y-10 relative">
      {/* Hero Section */}
      <section className="space-y-3 text-center max-w-2xl mx-auto py-3 sm:py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono shadow-inner">
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Real-time Graph Reconciliation Engine</span>
          <span className="sm:hidden">Reconciliation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-100 via-teal-100 to-indigo-100 bg-clip-text text-transparent leading-tight px-2">
          Zamazon Identity Playground
        </h1>
        <p className="text-[10px] sm:text-xs text-neutral-400 font-mono tracking-widest uppercase px-4">
          Consolidate guest checkouts and account mappings instantly.
        </p>
      </section>

      {/* Preset Scenarios Panel */}
      <section className="glass-card rounded-2xl p-4 sm:p-6 space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-teal-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
        <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-2 border-b border-white/5 pb-3">
          <Play className="h-3.5 w-3.5 text-teal-400" />
          Reconciliation Presets
        </h2>
        {/* Horizontal scroll on mobile, 3-col grid on md+ */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-3 md:gap-4 snap-x snap-mandatory scrollbar-thin">
          {scenarios.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <button
                key={i}
                onClick={() => handleApplyPreset(sc)}
                className="text-left p-3.5 sm:p-4 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-teal-500/30 hover:bg-neutral-900 active:bg-neutral-900 transition-all duration-300 group flex flex-col justify-between space-y-3 sm:space-y-4 hover:-translate-y-0.5 shadow-md snap-start shrink-0 w-64 md:w-auto"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${sc.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-mono text-xs font-bold text-neutral-200 group-hover:text-teal-400 transition-colors">
                      {sc.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    {sc.desc}
                  </p>
                </div>
                <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-neutral-400 w-full space-y-1.5 shadow-inner">
                  <div className="truncate flex items-center gap-1.5">
                    <span className="text-neutral-600 font-semibold">EMAIL:</span> {sc.email || "null"}
                  </div>
                  <div className="truncate flex items-center gap-1.5">
                    <span className="text-neutral-600 font-semibold">PHONE:</span> {sc.phone || "null"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Inputs / Outputs Section */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-8 items-start">
        {/* Request Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5 relative">
            <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-2 border-b border-white/5 pb-3">
              <TerminalIcon className="h-3.5 w-3.5 text-teal-400" />
              API Controller
            </h2>

            <form onSubmit={handleIdentify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. doc@timetravel.com"
                  className="w-full h-11 px-3.5 rounded-xl bg-neutral-950/80 border border-white/5 text-xs font-mono text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-teal-500/80 focus:bg-neutral-950 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-neutral-500" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full h-11 px-3.5 rounded-xl bg-neutral-950/80 border border-white/5 text-xs font-mono text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-teal-500/80 focus:bg-neutral-950 transition-all shadow-inner"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/15 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl flex gap-2 items-start">
                  <Info className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (!email.trim() && !phoneNumber.trim())}
                  className="flex-1 h-11 px-4 rounded-xl btn-neon disabled:bg-neutral-800 disabled:shadow-none disabled:text-neutral-500 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send /identify
                </button>
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 px-3.5 rounded-xl border border-white/5 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 transition-colors text-xs font-mono cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-3 space-y-6">
          {isLoading && (
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[340px]">
              <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-mono text-sm text-neutral-300 font-bold">Consolidating Identities...</h3>
                <p className="text-xs text-neutral-500 font-mono">Running transaction-isolated merges on Atlas...</p>
              </div>
            </div>
          )}

          {!isLoading && !rawResponse && (
            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[340px] border-dashed border-white/5">
              <div className="h-12 w-12 rounded-xl bg-neutral-900/60 flex items-center justify-center border border-white/5 text-neutral-500 shadow-md">
                <TerminalIcon className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">Awaiting execution</h3>
                <p className="text-xs text-neutral-500 leading-normal">
                  Send a reconciliation request on the left controller or apply a preset scenario to view output.
                </p>
              </div>
            </div>
          )}

          {!isLoading && rawResponse && (
            <div className="grid gap-6">
              {/* Graphical Reconciled Customer Card */}
              <div className="glass-card rounded-2xl p-6 space-y-5 relative overflow-hidden">
                {/* Visual scanline decorations */}
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-teal-500/5 to-transparent pointer-events-none"></div>

                <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-2 border-b border-white/5 pb-3">
                  <UserCheck className="h-3.5 w-3.5 text-teal-400" />
                  Resolved Identity Card
                </h2>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Neon Initials Badge */}
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-teal-950/40 border border-teal-500/40 flex flex-col items-center justify-center font-mono shadow-md shadow-teal-950/20">
                    <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider">Primary</span>
                    <span className="text-base font-bold text-neutral-100 tracking-tight">
                      #{rawResponse.contact.primaryContactId.slice(-4)}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    {/* Primary Identifier */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1 tracking-wider">Cluster Root ID</span>
                      <code className="text-[11px] font-mono bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-white/5 text-neutral-300 block truncate select-all">
                        {rawResponse.contact.primaryContactId}
                      </code>
                    </div>

                    {/* Email Chips */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block tracking-wider">Consolidated Emails</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rawResponse.contact.emails.map((email: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border flex items-center gap-1.5 transition-all ${
                              idx === 0
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400 font-bold shadow-md shadow-teal-950/10"
                                : "bg-neutral-950/70 border-white/5 text-neutral-400"
                            }`}
                          >
                            {idx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>}
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Phone Chips */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block tracking-wider">Consolidated Phones</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rawResponse.contact.phoneNumbers.map((phone: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border flex items-center gap-1.5 transition-all ${
                              idx === 0
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400 font-bold shadow-md shadow-teal-950/10"
                                : "bg-neutral-950/70 border-white/5 text-neutral-400"
                            }`}
                          >
                            {idx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>}
                            {phone}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Children row */}
                    <div className="pt-3.5 border-t border-white/5">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5 tracking-wider">
                        Secondary Links ({rawResponse.contact.secondaryContactIds.length})
                      </span>
                      {rawResponse.contact.secondaryContactIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {rawResponse.contact.secondaryContactIds.map((sid: string) => (
                            <span
                              key={sid}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-950 border border-white/5 text-neutral-450 hover:text-neutral-300 hover:border-neutral-800 transition-colors flex items-center gap-1"
                              title={sid}
                            >
                              <ArrowRight className="h-2.5 w-2.5 text-neutral-600" />
                              #{sid.slice(-4)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-600 italic">No secondary links connected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Console Terminal */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-teal-400" />
                    Terminal Console Output
                  </h2>
                  <span className="text-[9px] font-mono bg-neutral-900 border border-white/5 px-2 py-0.5 rounded text-teal-400">200 OK</span>
                </div>
                <div className="bg-neutral-950 rounded-xl border border-white/5 p-4 overflow-hidden shadow-inner">
                  <pre className="font-mono text-[11px] text-cyan-400 overflow-x-auto leading-relaxed select-all">
                    {JSON.stringify(rawResponse, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
