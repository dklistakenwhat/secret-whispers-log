import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Ban, Clock, ShieldOff, Eye, EyeOff, Users } from "lucide-react";
import { useVisitor } from "@/contexts/VisitorContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { banVisitor, unbanVisitor, getActiveBans, type VisitorBan } from "@/lib/bans";
import { toast } from "sonner";

interface ConfessionRow {
  id: string;
  confession_number: number;
  text: string;
  likes: number;
  created_at: string;
  visitor_id: string | null;
  hidden: boolean;
}

interface VisitorInfo {
  id: string;
  display_name: string;
  ip_address: string;
  created_at: string;
}

export default function AdminPanel() {
  const { isAdmin, visitor } = useVisitor();
  const [confessions, setConfessions] = useState<ConfessionRow[]>([]);
  const [visitors, setVisitors] = useState<Map<string, VisitorInfo>>(new Map());
  const [bans, setBans] = useState<VisitorBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"confessions" | "bans">("confessions");

  // Ban dialog state
  const [banTarget, setBanTarget] = useState<{ visitorId: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("60");
  const [banPermanent, setBanPermanent] = useState(false);

  const refresh = async () => {
    // Fetch confessions
    const { data: cData } = await supabase
      .from("confessions")
      .select("*")
      .order("created_at", { ascending: false });
    setConfessions((cData as ConfessionRow[]) ?? []);

    // Fetch visitor info via edge function
    const { data: vData } = await supabase.functions.invoke("admin-visitors");
    if (vData?.visitors) {
      const map = new Map<string, VisitorInfo>();
      vData.visitors.forEach((v: VisitorInfo) => map.set(v.id, v));
      setVisitors(map);
    }

    // Fetch bans
    const banData = await getActiveBans();
    setBans(banData);

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!isAdmin) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Access denied.</p>
        <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">Go back</Link>
      </div>
    );
  }

  const handleBan = async () => {
    if (!banTarget || !visitor) return;
    try {
      await banVisitor(
        banTarget.visitorId,
        banReason || "No reason provided",
        visitor.id,
        banPermanent ? undefined : parseInt(banDuration),
        banPermanent
      );
      toast.success(`Banned ${banTarget.name}`);
      setBanTarget(null);
      setBanReason("");
      setBanDuration("60");
      setBanPermanent(false);
      refresh();
    } catch {
      toast.error("Failed to ban");
    }
  };

  const handleUnban = async (banId: string) => {
    await unbanVisitor(banId);
    toast.success("Ban removed");
    refresh();
  };

  const getVisitorInfo = (visitorId: string | null) => {
    if (!visitorId) return { name: "anonymous", ip: "N/A", initials: "??" };
    const v = visitors.get(visitorId);
    if (!v) return { name: visitorId.substring(0, 8), ip: "N/A", initials: "??" };
    const initials = v.display_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
    return { name: v.display_name, ip: v.ip_address, initials };
  };

  const isBanned = (visitorId: string | null) => {
    if (!visitorId) return false;
    const now = new Date();
    return bans.some(
      (b) => b.visitor_id === visitorId && (b.is_permanent || !b.expires_at || new Date(b.expires_at) > now)
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          back to confessions
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users and confessions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "confessions" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("confessions")}
          className="gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Confessions ({confessions.length})
        </Button>
        <Button
          variant={tab === "bans" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("bans")}
          className="gap-1.5"
        >
          <Ban className="h-3.5 w-3.5" />
          Bans ({bans.length})
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-20 text-center">loading...</p>
      ) : tab === "confessions" ? (
        <div className="space-y-3">
          {confessions.map((c) => {
            const info = getVisitorInfo(c.visitor_id);
            const banned = isBanned(c.visitor_id);
            return (
              <div key={c.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-heading text-sm font-bold">#{c.confession_number}</span>
                  <div className="flex items-center gap-2">
                    {c.hidden && (
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">hidden</span>
                    )}
                    {banned && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">banned</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-card-foreground mb-3 leading-relaxed">
                  {c.text}
                </p>

                {/* Visitor Info */}
                <div className="rounded-md bg-muted/50 p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Poster Info</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Name: </span>
                      <span className="text-foreground font-medium">{info.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Initials: </span>
                      <span className="text-foreground font-medium">{info.initials}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP: </span>
                      <span className="text-foreground font-mono text-[11px]">{info.ip}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Likes: </span>
                      <span className="text-foreground">{c.likes}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {c.visitor_id && !banned && info.name !== "D.L.L.Mconfessionable" && (
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        setBanTarget({ visitorId: c.visitor_id!, name: info.name })
                      }
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Ban / Timeout
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Bans Tab */
        <div className="space-y-3">
          {bans.length === 0 ? (
            <p className="text-sm text-muted-foreground py-20 text-center">No bans yet</p>
          ) : (
            bans.map((b) => {
              const info = getVisitorInfo(b.visitor_id);
              const isActive =
                b.is_permanent || !b.expires_at || new Date(b.expires_at) > new Date();
              return (
                <div key={b.id} className={`rounded-lg border bg-card p-4 ${!isActive ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-sm font-bold text-foreground">{info.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({info.initials})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.is_permanent ? (
                        <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">
                          PERMANENT
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {b.expires_at
                            ? isActive
                              ? `Expires ${new Date(b.expires_at).toLocaleString()}`
                              : "Expired"
                            : "No expiry"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3 mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm text-foreground">{b.reason}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    IP: <span className="font-mono">{info.ip}</span> · Banned {new Date(b.banned_at).toLocaleString()}
                  </div>
                  {isActive && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleUnban(b.id)}
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                        Remove Ban
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ban Dialog */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-1">Ban / Timeout</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Banning <span className="font-medium text-foreground">{banTarget.name}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Why are you banning this user?"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permanent"
                  checked={banPermanent}
                  onChange={(e) => setBanPermanent(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="permanent" className="text-sm">Permanent ban</label>
              </div>

              {!banPermanent && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Duration (minutes)
                  </label>
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="360">6 hours</option>
                    <option value="1440">24 hours</option>
                    <option value="4320">3 days</option>
                    <option value="10080">7 days</option>
                    <option value="43200">30 days</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBanTarget(null);
                  setBanReason("");
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBan} className="gap-1.5">
                <Ban className="h-3.5 w-3.5" />
                Confirm Ban
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
