import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useVisitor } from "@/contexts/VisitorContext";
import WelcomeScreen from "./WelcomeScreen";
import AgeGate from "./AgeGate";
import NamePrompt from "./NamePrompt";
import GuidelinesScreen from "./GuidelinesScreen";

type Step = "welcome" | "gate" | "name" | "guidelines" | "done";

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
            i === current
              ? "scale-125 bg-foreground"
              : i < current
                ? "bg-muted-foreground/40"
                : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingFlow({
  children,
}: {
  children: React.ReactNode;
}) {
  const { visitor, loading } = useVisitor();
  const [step, setStep] = useState<Step | null>(null);

  useEffect(() => {
    if (loading) return;

    const welcomeSeen = localStorage.getItem("welcome_seen") === "1";
    const gatePassed = sessionStorage.getItem("gate") === "1";

    if (!welcomeSeen) {
      setStep("welcome");
    } else if (!gatePassed) {
      setStep("gate");
    } else if (!visitor) {
      setStep("name");
    } else {
      // Check guidelines
      checkGuidelines(visitor.id);
    }
  }, [loading, visitor]);

  const checkGuidelines = async (vid: string) => {
    const { data } = await supabase
      .from("guideline_agreements")
      .select("id")
      .eq("visitor_id", vid)
      .maybeSingle();
    setStep(data ? "done" : "guidelines");
  };

  if (loading || step === null) return null;
  if (step === "done") return <>{children}</>;

  const stepIndex = ["welcome", "gate", "name", "guidelines"].indexOf(step);
  const totalSteps = 4;

  return (
    <>
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen
              onContinue={() => {
                localStorage.setItem("welcome_seen", "1");
                setStep("gate");
              }}
            />
          </motion.div>
        )}

        {step === "gate" && (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AgeGate
              onPass={() => setStep("name")}
            />
          </motion.div>
        )}

        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <NamePrompt />
          </motion.div>
        )}

        {step === "guidelines" && visitor && (
          <motion.div
            key="guidelines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GuidelinesScreen
              visitorId={visitor.id}
              onAgree={() => setStep("done")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {step !== "done" && (
        <ProgressDots current={stepIndex} total={totalSteps} />
      )}
    </>
  );
}
