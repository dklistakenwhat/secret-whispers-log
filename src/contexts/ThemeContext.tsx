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
      "--secondary": "0 0% 15%",
      "--secondary-foreground": "0 0% 100%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "0 0% 55%",
      "--accent": "0 0% 18%",
      "--border": "0 0% 18%",
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
      "--secondary": "210 35% 16%",
      "--secondary-foreground": "200 20% 95%",
      "--muted": "210 30% 16%",
      "--muted-foreground": "200 15% 50%",
      "--accent": "210 35% 20%",
      "--border": "210 30% 18%",
    },
  },
  {
    name: "sunset",
    label: "Sunset",
    emoji: "🌅",
    vars: {
      "--background": "15 30% 4%",
      "--foreground": "30 30% 95%",
      "--card": "15 25% 10%",
      "--card-foreground": "30 30% 95%",
      "--secondary": "15 20% 16%",
      "--secondary-foreground": "30 30% 95%",
      "--muted": "15 15% 16%",
      "--muted-foreground": "20 15% 50%",
      "--accent": "15 20% 20%",
      "--border": "15 15% 18%",
    },
  },
  {
    name: "forest",
    label: "Forest",
    emoji: "🌲",
    vars: {
      "--background": "150 30% 3%",
      "--foreground": "140 15% 92%",
      "--card": "150 25% 8%",
      "--card-foreground": "140 15% 92%",
      "--secondary": "150 20% 14%",
      "--secondary-foreground": "140 15% 92%",
      "--muted": "150 15% 14%",
      "--muted-foreground": "140 10% 45%",
      "--accent": "150 20% 18%",
      "--border": "150 15% 16%",
    },
  },
  {
    name: "lavender",
    label: "Lavender",
    emoji: "💜",
    vars: {
      "--background": "270 25% 5%",
      "--foreground": "270 15% 95%",
      "--card": "270 20% 10%",
      "--card-foreground": "270 15% 95%",
      "--secondary": "270 18% 16%",
      "--secondary-foreground": "270 15% 95%",
      "--muted": "270 14% 16%",
      "--muted-foreground": "270 10% 50%",
      "--accent": "270 18% 20%",
      "--border": "270 14% 18%",
    },
  },
  {
    name: "rose",
    label: "Rosé",
    emoji: "🌹",
    vars: {
      "--background": "340 25% 4%",
      "--foreground": "340 15% 95%",
      "--card": "340 20% 9%",
      "--card-foreground": "340 15% 95%",
      "--secondary": "340 18% 15%",
      "--secondary-foreground": "340 15% 95%",
      "--muted": "340 14% 15%",
      "--muted-foreground": "340 10% 48%",
      "--accent": "340 18% 19%",
      "--border": "340 14% 17%",
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
      if (found) setThemeState(found);
    }
    const soundPref = localStorage.getItem("sound-enabled");
    if (soundPref !== null) setSoundEnabled(soundPref === "true");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
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
