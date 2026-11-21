import { useState } from "react";
import type { Candidate } from "../api/types";
import { RejectionPanel } from "./RejectionPanel";
import { ResultCard } from "./ResultCard";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Tabs } from "./ui/Tabs";

interface Props {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export function ResultList({ candidates, selectedId, onSelect, compareIds, onToggleCompare }: Props) {
  const eligible = candidates.filter((c) => c.eligible === "pass");
  const unverified = candidates.filter((c) => c.eligible === "unknown");
  const rejected = candidates.filter((c) => c.eligible === "fail");
  const [tab, setTab] = useState<"pass" | "unknown" | "fail">("pass");

  const cards = (list: Candidate[]) => (
    <div className="stack">
      {list.map((c) => (
        <ResultCard
          key={c.id}
          candidate={c}
          selected={c.id === selectedId}
          onSelect={() => onSelect(c.id)}
          compared={compareIds.includes(c.id)}
          compareDisabled={compareIds.length >= 3}
          onToggleCompare={() => onToggleCompare(c.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="stack">
      <p className="sr-only" aria-live="polite">
        {eligible.length} eligible, {unverified.length} unverified, {rejected.length} rejected.
      </p>
      <Tabs
        label="Result groups"
        value={tab}
        onChange={(id) => setTab(id as "pass" | "unknown" | "fail")}
        tabs={[
          { id: "pass", label: "Eligible", count: eligible.length },
          { id: "unknown", label: "Unverified", count: unverified.length },
          { id: "fail", label: "Rejected", count: rejected.length },
        ]}
      />
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="stack">
        {tab === "pass" &&
          (eligible.length > 0 ? (
            cards(eligible)
          ) : (
            <Card flat>
              <EmptyState title="No eligible jobs for this truck and route">
                Nothing passed every check. Look at the Unverified and Rejected tabs to see why. Switching on off-route
                stops may allow more jobs.
              </EmptyState>
            </Card>
          ))}
        {tab === "unknown" &&
          (unverified.length > 0 ? (
            <>
              <p className="small muted">
                Nothing failed, but at least one check could not be verified. These are never shown as eligible.
              </p>
              {cards(unverified)}
            </>
          ) : (
            <Card flat>
              <EmptyState title="Nothing is waiting on verification" />
            </Card>
          ))}
        {tab === "fail" &&
          (rejected.length > 0 ? (
            <Card flat>
              <RejectionPanel candidates={rejected} kind="fail" />
            </Card>
          ) : (
            <Card flat>
              <EmptyState title="No jobs were rejected" />
            </Card>
          ))}
      </div>
    </div>
  );
}
