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
  Play
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

  // Predefined scenarios for demonstration
  const scenarios = [
    {
      name: "1. Brand New Identity",
      desc: "Creates a brand new primary contact.",
      email: "doc@timetravel.com",
      phone: "1234567890"
    },
    {
      name: "2. Add New Information",
      desc: "Shares email but introduces a new phone number. Creates a secondary contact.",
      email: "doc@timetravel.com",
      phone: "0987654321"
    },
    {
      name: "3. Merge Two Primary Clusters",
      desc: "Connects two previously separate primary clusters into one unified identity.",
      email: "marty@future.com",
      phone: "0987654321"
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
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="space-y-4 text-center max-w-2xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono">
          <Sparkles className="h-3 w-3" />
          Real-time Identity Resolution Engine
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-100 bg-clip-text text-transparent">
          Zamazon Identity Engine
        </h1>
        <p className="text-sm text-neutral-400 font-mono tracking-wide">
          One customer, many emails and phones — reconciled in real time.
        </p>
      </section>

      {/* Try Preset Scenarios */}
      <section className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
          <Play className="h-3.5 w-3.5 text-teal-400" />
          Interactive Demo Scenarios
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(sc)}
              className="text-left p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-teal-500/30 hover:bg-neutral-800/20 transition-all group flex flex-col justify-between h-full space-y-3"
            >
              <div className="space-y-1">
                <h3 className="font-mono text-xs font-bold text-neutral-200 group-hover:text-teal-400 transition-colors">
                  {sc.name}
                </h3>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {sc.desc}
                </p>
              </div>
              <div className="bg-neutral-950/60 p-2 rounded border border-neutral-850 font-mono text-[10px] text-neutral-400 w-full space-y-1">
                <div className="truncate flex items-center gap-1.5">
                  <span className="text-teal-500/70">E:</span> {sc.email || "null"}
                </div>
                <div className="truncate flex items-center gap-1.5">
                  <span className="text-teal-500/70">P:</span> {sc.phone || "null"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Form and Output Layout */}
      <section className="grid md:grid-cols-5 gap-8 items-start">
        {/* Left Side: Request Builder */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-5">
            <h2 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
              <TerminalIcon className="h-3.5 w-3.5 text-teal-400" />
              Request Builder
            </h2>

            <form onSubmit={handleIdentify} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-10 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-sm font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-neutral-500" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full h-10 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-sm font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
                  <strong className="text-red-300">Error:</strong> {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (!email.trim() && !phoneNumber.trim())}
                  className="flex-1 h-10 px-4 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
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
                  className="h-10 px-3 rounded-lg border border-neutral-800 hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200 transition-colors text-xs font-mono cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Output Panels */}
        <div className="md:col-span-3 space-y-6">
          {isLoading && (
            <div className="bg-neutral-900/20 border border-neutral-800/60 rounded-xl p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
              <RefreshCw className="h-8 w-8 text-teal-500 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-mono text-sm text-neutral-300 font-bold">Reconciling Identity...</h3>
                <p className="text-xs text-neutral-500 font-mono">Running cluster-merge checks and updating graph...</p>
              </div>
            </div>
          )}

          {!isLoading && !rawResponse && (
            <div className="bg-neutral-900/10 border border-neutral-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-center min-h-[300px]">
              <TerminalIcon className="h-8 w-8 text-neutral-600" />
              <div className="space-y-1">
                <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">Awaiting Execution</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Configure a query on the left or select a preset scenario to see the engine resolve identity relationships.
                </p>
              </div>
            </div>
          )}

          {!isLoading && rawResponse && (
            <div className="grid gap-6">
              {/* Human-Readable Identity Card */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 space-y-5">
                <h2 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5 text-teal-400" />
                  Resolved Identity Card
                </h2>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-col items-center justify-center font-mono">
                    <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">Primary</span>
                    <span className="text-lg font-bold text-neutral-200 leading-tight">
                      #{rawResponse.contact.primaryContactId.slice(-4)}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    {/* Primary Identifier info */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">Primary Cluster ID (Full)</span>
                      <code className="text-xs font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-800 text-neutral-300 block truncate select-all">
                        {rawResponse.contact.primaryContactId}
                      </code>
                    </div>

                    {/* Email Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">Emails</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rawResponse.contact.emails.map((email: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded text-xs font-mono border flex items-center gap-1.5 ${
                              idx === 0
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400 font-semibold"
                                : "bg-neutral-950 border-neutral-800 text-neutral-300"
                            }`}
                          >
                            {idx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>}
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Phone Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">Phone Numbers</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rawResponse.contact.phoneNumbers.map((phone: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded text-xs font-mono border flex items-center gap-1.5 ${
                              idx === 0
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400 font-semibold"
                                : "bg-neutral-950 border-neutral-800 text-neutral-300"
                            }`}
                          >
                            {idx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>}
                            {phone}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Linked Secondaries */}
                    <div className="pt-2 border-t border-neutral-800/60">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                        Linked Secondary IDs ({rawResponse.contact.secondaryContactIds.length})
                      </span>
                      {rawResponse.contact.secondaryContactIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {rawResponse.contact.secondaryContactIds.map((sid: string) => (
                            <span
                              key={sid}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-400"
                              title={sid}
                            >
                              #{sid.slice(-4)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-600 italic">No secondary contacts linked</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw JSON Panel */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-teal-400" />
                    Raw /identify Response
                  </h2>
                  <span className="text-[10px] font-mono text-neutral-500">200 OK</span>
                </div>
                <div className="bg-neutral-950 rounded-lg border border-neutral-850 p-4 overflow-hidden">
                  <pre className="font-mono text-[11px] text-teal-400 overflow-x-auto leading-relaxed select-all">
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
