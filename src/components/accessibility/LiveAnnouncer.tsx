"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface LiveAnnouncerContextValue {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextValue>({
  announce: () => undefined,
});

export function LiveAnnouncerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [politeMsg, setPoliteMsg] = useState("");
  const [assertiveMsg, setAssertiveMsg] = useState("");

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const setter = priority === "assertive" ? setAssertiveMsg : setPoliteMsg;
      // Reset briefly so identical consecutive announcements still trigger AT output
      setter("");
      window.setTimeout(() => {
        setter(message);
      }, 40);
    },
    []
  );

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMsg}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMsg}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

export function useLiveAnnouncer() {
  return useContext(LiveAnnouncerContext);
}
