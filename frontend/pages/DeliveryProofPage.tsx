import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextField } from "../components/ui/Field";
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

export function DeliveryProofPage() {
  usePageTitle("Delivery proof");
  const { user } = useAuth();
  const key = "of_delivery_proofs";
  const [shipmentId, setShipmentId] = useState("");
  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState<ProofRecord[]>(() => readJson<ProofRecord[]>(key, []));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!shipmentId.trim() || !fileName.trim()) return;
    const record: ProofRecord = {
      id: `proof-${Date.now()}`,
      shipment_id: shipmentId.trim(),
      note: note.trim(),
      file_name: fileName,
      submitted_by: user?.name ?? "Unknown driver",
      submitted_at: new Date().toISOString(),
      status: "pending",
    };
    const next = [record, ...records];
    setRecords(next);
    writeJson(key, next);
    setShipmentId("");
    setNote("");
    setFileName("");
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Driver portal</span>
          <h1>Delivery proof</h1>
        </div>
      </div>
      <Card title="Submit proof">
        <form className="stack" onSubmit={submit}>
          <TextField label="Shipment or job ID" value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} />
          <TextField label="Delivery note" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="field">
            <span className="field__label">Proof image or PDF</span>
            <input
              className="field__control"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
            <span className="field__hint">Demonstration mode stores proof metadata only, not the file itself.</span>
          </label>
          <Button type="submit" variant="primary" disabled={!shipmentId.trim() || !fileName}>
            Submit for verification
          </Button>
        </form>
      </Card>
      <Card title="Recent submissions">
        {records.length === 0 ? <p className="muted">No proof has been submitted.</p> : (
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Shipment</th><th>File</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>{records.map((record) => (
                <tr key={record.id}>
                  <td>{record.shipment_id}</td>
                  <td>{record.file_name}</td>
                  <td><span className={`badge ${record.status === "verified" ? "badge--info" : "badge--demo"}`}>{record.status}</span></td>
                  <td>{new Date(record.submitted_at).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
