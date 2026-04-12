import { useState } from "react";

const AGES = [13, 14, 15, 16, 17, 18, 19];

type GateState = "pending" | "passed" | "failed";

interface Props {
  children?: React.ReactNode;
  onPass?: () => void;
}

export default function AgeGate({ children, onPass }: Props) {
  const alreadyPassed = sessionStorage.getItem("gate") === "1";
  const [state, setState] = useState<GateState>(alreadyPassed ? "passed" : "pending");

  // If already passed on mount and used with onPass callback, fire it
  useState(() => {
    if (alreadyPassed && onPass) onPass();
  });

  const handlePass = () => {
    sessionStorage.setItem("gate", "1");
    setState("passed");
    onPass?.();
  };

  if (state === "passed") return children ? <>{children}</> : null;

  if (state === "failed") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f1f1f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ color: "#999", fontSize: "13px" }}>
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <p
        onClick={handlePass}
        className="mb-8 cursor-default text-sm text-muted-foreground select-none"
      >
        before you continue
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {AGES.map((age) => (
          <button
            key={age}
            onClick={() => setState("failed")}
            className="h-12 w-12 rounded-lg border bg-card text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
          >
            {age}
          </button>
        ))}
      </div>
    </div>
  );
}