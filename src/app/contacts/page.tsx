"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCw, 
  Database, 
  Users, 
  ArrowRight, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface Contact {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  linkPrecedence: "primary" | "secondary";
  linkedId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Cluster {
  primary: Contact;
  secondaries: Contact[];
}

export default function AdminConsole() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchContacts = async (query = "") => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = query ? `/api/contacts?search=${encodeURIComponent(query)}` : "/api/contacts";
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMsg(data.error?.message || "Failed to fetch contacts.");
      } else {
        setClusters(data.clusters || []);
      }
    } catch {
      setErrorMsg("Failed to connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts(search);
  };

  const handleRefresh = () => {
    fetchContacts(search);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-2 border-b border-white/5 pb-4 sm:pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <Database className="h-3.5 w-3.5" />
            Atlas Schema Records
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-100">
            Identity Clusters Database
          </h1>
          <p className="text-xs text-neutral-400 font-mono hidden sm:block">
            Audit and navigate parsed user relationship trees.
          </p>
        </div>

        {/* Action Controls */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or phone..."
              className="w-full h-11 pl-9 pr-4 rounded-xl bg-neutral-900/60 border border-white/5 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-teal-500/80 transition-colors shadow-inner"
            />
          </div>
          
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-11 w-11 shrink-0 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-teal-500/20 flex items-center justify-center text-neutral-400 hover:text-neutral-200 disabled:opacity-50 transition-all cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
          </button>
        </form>
      </section>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-950/15 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Database Clusters View */}
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="h-6 bg-neutral-850 rounded w-1/3"></div>
              <div className="space-y-2.5 pl-4 border-l border-neutral-800">
                <div className="h-4 bg-neutral-900 rounded w-1/2"></div>
                <div className="h-4 bg-neutral-900 rounded w-5/12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : clusters.length === 0 ? (
        // Empty State
        <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
          <Users className="h-10 w-10 text-neutral-700" />
          <div className="space-y-1.5">
            <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">No Clusters Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              {search 
                ? `No contact records in the database match "${search}". Try searching for another email or phone.`
                : "The database is currently empty. Go to the Playground page to create the first contact cluster."
              }
            </p>
          </div>
        </div>
      ) : (
        // Clusters List
        <div className="space-y-6">
          {clusters.map((cluster) => {
            const { primary, secondaries } = cluster;
            return (
              <div 
                key={primary.id} 
                className="glass-card rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Primary Contact Header Row */}
                <div className="bg-neutral-900/40 p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/10 border border-teal-500/30 text-teal-400 uppercase tracking-wider">
                        Primary Parent
                      </span>
                      <code className="text-[11px] font-mono text-neutral-400 bg-neutral-950/60 px-2 py-0.5 rounded border border-white/5 select-all max-w-[160px] sm:max-w-none truncate block sm:inline" title="Full DB Identifier">
                        <span className="hidden sm:inline">ID: </span>{primary.id}
                      </code>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1.5 text-xs font-mono text-neutral-200">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-neutral-600" />
                        {primary.email || <span className="text-neutral-700 italic">null</span>}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-neutral-600" />
                        {primary.phoneNumber || <span className="text-neutral-700 italic">null</span>}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5 self-start md:self-auto bg-neutral-950/40 border border-white/5 px-2.5 py-1 rounded-lg">
                    <Calendar className="h-3.5 w-3.5 text-neutral-600" />
                    <span>Created: {formatDate(primary.createdAt)}</span>
                  </div>
                </div>

                {/* Secondary Contacts Sub-list */}
                {secondaries.length > 0 ? (
                  <div className="p-4 pl-6 sm:pl-8 md:pl-12 bg-neutral-950/10 space-y-4 relative">
                    {/* Connecting vertical line */}
                    <div className="absolute left-4 sm:left-6 md:left-8 top-0 bottom-8 border-l border-dashed border-teal-500/10"></div>

                    {secondaries.map((sec: Contact) => (
                      <div 
                        key={sec.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-neutral-400 relative pl-4 hover:text-neutral-300 transition-colors"
                      >
                        {/* Bullet Connection Indicator */}
                        <span className="absolute -left-4 md:-left-4.5 top-2.5 h-1.5 w-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-teal-400"></span>
                        </span>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-neutral-900 border border-white/5 text-neutral-500 uppercase tracking-widest">
                              Secondary Child
                            </span>
                            <code className="text-[10px] text-neutral-500 bg-neutral-950/40 px-1.5 py-0.5 rounded border border-white/5" title="Full DB Identifier">
                              ID: {sec.id}
                            </code>
                            <div className="flex items-center gap-1 text-[9px] text-neutral-600">
                              <ArrowRight className="h-2.5 w-2.5" />
                              <span>linked to #{primary.id.slice(-4)}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1.5 text-neutral-300">
                            <span className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-neutral-700" />
                              {sec.email || <span className="text-neutral-700 italic">null</span>}
                            </span>
                            <span className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-neutral-700" />
                              {sec.phoneNumber || <span className="text-neutral-700 italic">null</span>}
                            </span>
                          </div>
                        </div>

                        <div className="text-[9px] text-neutral-600 self-start md:self-auto flex items-center gap-1 bg-neutral-950/20 px-2 py-0.5 rounded border border-white/5">
                          <Calendar className="h-3 w-3" />
                          <span>Linked: {formatDate(sec.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 pl-6 sm:pl-8 text-left text-neutral-600 font-mono text-[10px] italic bg-neutral-950/5">
                    No secondary contacts associated with this primary customer cluster.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
