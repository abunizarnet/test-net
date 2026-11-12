"use client";

import { useState } from "react";
import useSWR from "swr";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ExplainResponse {
  text: string;
  generatedByAI: boolean;
}

async function postExplain([, body]: [string, string]): Promise<ExplainResponse> {
  const response = await fetch("/api/ai-explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!response.ok) throw new Error("The AI helper is busy");
  return response.json();
}

interface AiPanelProps {
  title: string;
  requestKey: string;
  body: Record<string, unknown>;
  autoRun?: boolean;
  buttonLabel?: string;
}

export function AiPanel({ title, requestKey, body, autoRun = false, buttonLabel }: AiPanelProps) {
  const [requested, setRequested] = useState(false);
  const active = autoRun || requested;
  const { data, error, isLoading, mutate } = useSWR(
    active ? [requestKey, JSON.stringify(body)] : null,
    postExplain,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return (
    <section
      aria-label={`${title} (AI-generated)`}
      className="rounded-2xl border border-dashed border-accent/60 bg-accent/10 p-4 glow-purple"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-accent" aria-hidden="true" />
          {title}
        </h3>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
          AI-generated
        </span>
      </div>

      <div className="mt-3 text-sm leading-relaxed text-foreground" aria-live="polite">
        {!active && (
          <Button size="sm" variant="secondary" onClick={() => setRequested(true)}>
            {buttonLabel ?? "Ask the AI"}
          </Button>
        )}
        {active && isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-4" /> Thinking...
          </p>
        )}
        {active && error && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground">The AI helper could not answer right now.</p>
            <Button size="sm" variant="secondary" onClick={() => mutate()}>
              Try again
            </Button>
          </div>
        )}
        {data && (
          <>
            <p>{data.text}</p>
            {!data.generatedByAI && (
              <p className="mt-2 text-xs text-muted-foreground">
                The AI helper was unavailable, so this is a built-in explanation.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
