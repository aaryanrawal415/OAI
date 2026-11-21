import { api } from "../api/client";

export function DemoStrip() {
  if (api.mode !== "mock") return null;
  return (
    <div className="demo-strip" role="note">
      <strong>Demonstration mode.</strong> Listings are invented and checked by a demo evaluator, not the production rules
      engine. Nothing here is real freight or a verified road distance.
    </div>
  );
}
