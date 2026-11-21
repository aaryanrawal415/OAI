import type { KeyboardEvent } from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({ tabs, value, onChange, label }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; label: string }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((t) => t.id === value);
    if (event.key === "ArrowRight") onChange(tabs[(index + 1) % tabs.length].id);
    if (event.key === "ArrowLeft") onChange(tabs[(index - 1 + tabs.length) % tabs.length].id);
  };
  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={tab.id === value}
          aria-controls={`panel-${tab.id}`}
          tabIndex={tab.id === value ? 0 : -1}
          className="tab"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null && <span className="mono"> ({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
