import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_NAME = "D.L.L.Mconfessionable";

interface Visitor {
  id: string;
  display_name: string;
}

interface LoginResult {
  success: boolean;
  banned?: boolean;
  wrongPassword?: boolean;
  reason?: string;
  expires_at?: string;
  is_permanent?: boolean;
}

interface VisitorContextType {
  visitor: Visitor | null;
  loading: boolean;
  isAdmin: boolean;
  login: (name: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const VisitorContext = createContext<VisitorContextType>({
  visitor: null,
  loading: true,
  isAdmin: false,
  login: async (_n: string, _p: string) => ({ success: false }),
  logout: () => {},
});

export function useVisitor() {
  return useContext(VisitorContext);
}

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("visitor");
    if (stored) {
      try {
        setVisitor(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (name: string, password: string): Promise<LoginResult> => {
    try {
      const response = await supabase.functions.invoke("visitor-auth", {
        body: { display_name: name, password },
      });
      
      // Check for ban (403)
      if (response.data?.error === "You are banned") {
        return {
          success: false,
          banned: true,
          reason: response.data.reason,
          expires_at: response.data.expires_at,
          is_permanent: response.data.is_permanent,
        };
      }
      
      if (response.error || !response.data?.visitor) return { success: false };
      const v = { id: response.data.visitor.id, display_name: response.data.visitor.display_name };
      setVisitor(v);
      sessionStorage.setItem("visitor", JSON.stringify(v));
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const logout = () => {
    setVisitor(null);
    sessionStorage.removeItem("visitor");
  };

  const isAdmin = visitor?.display_name === ADMIN_NAME;

  return (
    <VisitorContext.Provider value={{ visitor, loading, isAdmin, login, logout }}>
      {children}
    </VisitorContext.Provider>
  );
}
