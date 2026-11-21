import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";
import { readJson, writeJson } from "../lib/storage";

interface ProofRecord {
  id: string;
  shipment_id: string;
  note: string;
  file_name: string;
  submitted_by: string;
  submitted_at: string;
  status: "pending" | "verified";
}

export function StaffVerificationPage() {
  usePageTitle("Verify deliveries");
  const key = "of_delivery_proofs";
  const [records, setRecords] = useState<ProofRecord[]>(() => readJson<ProofRecord[]>(key, []));

  const verify = (id: string) => {
    const next = records.map((record) => record.id === id ? { ...record, status: "verified" as const } : record);
    setRecords(next);
    writeJson(key, next);
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Staff portal</span>
          <h1>Delivery verification</h1>
        </div>
      </div>
      <Card title="Proof queue">
        {records.length === 0 ? <p className="muted">No delivery proof is waiting.</p> : (
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Shipment</th><th>Driver</th><th>Proof</th><th>Note</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{records.map((record) => (
                <tr key={record.id}>
                  <td>{record.shipment_id}</td>
                  <td>{record.submitted_by}</td>
                  <td>{record.file_name}</td>
                  <td>{record.note || "-"}</td>
                  <td><span className={`badge ${record.status === "verified" ? "badge--info" : "badge--demo"}`}>{record.status}</span></td>
                  <td>{record.status === "pending" ? <Button small onClick={() => verify(record.id)}>Verify</Button> : "-"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
