import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_NAME = "D.L.L.Mconfessionable";

interface Visitor {
  id: string;
  display_name: string;
}

interface VisitorContextType {
  visitor: Visitor | null;
  loading: boolean;
  isAdmin: boolean;
  login: (name: string) => Promise<boolean>;
  logout: () => void;
}

const VisitorContext = createContext<VisitorContextType>({
  visitor: null,
  loading: true,
  isAdmin: false,
  login: async () => false,
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

  const login = async (name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("visitor-auth", {
        body: { display_name: name },
      });
      if (error || !data?.visitor) return false;
      const v = { id: data.visitor.id, display_name: data.visitor.display_name };
      setVisitor(v);
      sessionStorage.setItem("visitor", JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setVisitor(null);
    sessionStorage.removeItem("visitor");
  };

  return (
    <VisitorContext.Provider value={{ visitor, loading, login, logout }}>
      {children}
    </VisitorContext.Provider>
  );
}
