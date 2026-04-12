import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ThemeConfig {
  name: string;
  label: string;
  emoji: string;
  vars: Record<string, string>;
}

export const THEMES: ThemeConfig[] = [
  {
    name: "midnight",
    label: "Midnight",
    emoji: "🌑",
    vars: {
      "--background": "0 0% 0%",
      "--foreground": "0 0% 100%",
      "--card": "0 0% 8%",
      "--card-foreground": "0 0% 100%",
      "--popover": "0 0% 8%",
      "--popover-foreground": "0 0% 100%",
      "--primary": "0 0% 100%",
      "--primary-foreground": "0 0% 0%",
      "--secondary": "0 0% 15%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "0 0% 55%",
      "--accent": "0 0% 18%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 62% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "0 0% 18%",
      "--input": "0 0% 18%",
      "--ring": "0 0% 100%",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    emoji: "🌊",
    vars: {
      "--background": "210 50% 4%",
      "--foreground": "200 20% 95%",
      "--card": "210 40% 10%",
      "--card-foreground": "200 20% 95%",
      "--popover": "210 40% 10%",
      "--popover-foreground": "200 20% 95%",
      "--primary": "200 80% 60%",
      "--primary-foreground": "210 50% 4%",
      "--secondary": "210 35% 16%",
      "--secondary-foreground": "200 20% 95%",
      "--muted": "210 30% 16%",
      "--muted-foreground": "200 15% 55%",
      "--accent": "200 40% 22%",
      "--accent-foreground": "200 20% 95%",
      "--destructive": "0 62% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "210 30% 18%",
      "--input": "210 30% 18%",
      "--ring": "200 80% 60%",
    },
  },
  {
    name: "sunset",
    label: "Sunset",
    emoji: "🌅",
    vars: {
      "--background": "15 30% 4%",
      "--foreground": "30 40% 93%",
      "--card": "15 25% 10%",
      "--card-foreground": "30 40% 93%",
      "--popover": "15 25% 10%",
      "--popover-foreground": "30 40% 93%",
      "--primary": "25 90% 58%",
      "--primary-foreground": "15 30% 4%",
      "--secondary": "15 20% 16%",
      "--secondary-foreground": "30 40% 93%",
      "--muted": "15 15% 16%",
      "--muted-foreground": "20 20% 52%",
      "--accent": "20 25% 20%",
      "--accent-foreground": "30 40% 93%",
      "--destructive": "0 62% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "15 15% 18%",
      "--input": "15 15% 18%",
      "--ring": "25 90% 58%",
    },
  },
  {
    name: "forest",
    label: "Forest",
    emoji: "🌲",
    vars: {
      "--background": "150 30% 3%",
      "--foreground": "140 15% 90%",
      "--card": "150 25% 8%",
      "--card-foreground": "140 15% 90%",
      "--popover": "150 25% 8%",
      "--popover-foreground": "140 15% 90%",
      "--primary": "145 60% 45%",
      "--primary-foreground": "150 30% 3%",
      "--secondary": "150 20% 14%",
      "--secondary-foreground": "140 15% 90%",
      "--muted": "150 15% 14%",
      "--muted-foreground": "140 10% 48%",
      "--accent": "145 22% 18%",
      "--accent-foreground": "140 15% 90%",
      "--destructive": "0 62% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "150 15% 16%",
      "--input": "150 15% 16%",
      "--ring": "145 60% 45%",
    },
  },
  {
    name: "lavender",
    label: "Lavender",
    emoji: "💜",
    vars: {
      "--background": "270 25% 5%",
      "--foreground": "270 20% 93%",
      "--card": "270 20% 10%",
      "--card-foreground": "270 20% 93%",
      "--popover": "270 20% 10%",
      "--popover-foreground": "270 20% 93%",
      "--primary": "270 70% 65%",
      "--primary-foreground": "270 25% 5%",
      "--secondary": "270 18% 16%",
      "--secondary-foreground": "270 20% 93%",
      "--muted": "270 14% 16%",
      "--muted-foreground": "270 12% 52%",
      "--accent": "270 20% 20%",
      "--accent-foreground": "270 20% 93%",
      "--destructive": "0 62% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "270 14% 18%",
      "--input": "270 14% 18%",
      "--ring": "270 70% 65%",
    },
  },
  {
    name: "rose",
    label: "Rosé",
    emoji: "🌹",
    vars: {
      "--background": "340 25% 4%",
      "--foreground": "340 20% 93%",
      "--card": "340 20% 9%",
      "--card-foreground": "340 20% 93%",
      "--popover": "340 20% 9%",
      "--popover-foreground": "340 20% 93%",
      "--primary": "340 70% 60%",
      "--primary-foreground": "340 25% 4%",
      "--secondary": "340 18% 15%",
      "--secondary-foreground": "340 20% 93%",
      "--muted": "340 14% 15%",
      "--muted-foreground": "340 12% 50%",
      "--accent": "340 20% 19%",
      "--accent-foreground": "340 20% 93%",
      "--destructive": "0 62% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "340 14% 17%",
      "--input": "340 14% 17%",
      "--ring": "340 70% 60%",
    },
  },
];

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (name: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[0],
  setTheme: () => {},
  soundEnabled: true,
  toggleSound: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(THEMES[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved) {
      const found = THEMES.find((t) => t.name === saved);
      if (found) {
        setThemeState(found);
        applyTheme(found);
      }
    }
    const soundPref = localStorage.getItem("sound-enabled");
    if (soundPref !== null) setSoundEnabled(soundPref === "true");
  }, []);

  const applyTheme = (t: ThemeConfig) => {
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (name: string) => {
    const found = THEMES.find((t) => t.name === name);
    if (found) {
      setThemeState(found);
      localStorage.setItem("app-theme", name);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      localStorage.setItem("sound-enabled", String(!prev));
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, soundEnabled, toggleSound }}>
      {children}
    </ThemeContext.Provider>
  );
}
