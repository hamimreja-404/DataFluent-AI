import { useState } from "react";
import { ShieldAlert, X, Loader2, Play } from "lucide-react";

export default function PasswordModal({
  visible,
  sql,
  queryType,
  onConfirm,
  onCancel,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm(password);
      setPassword("");
    } catch (e) {
      setError(e?.message || "Invalid password or operation failed.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <div className="overlay">
      <div style={styles.modal} className="animate-fade">
        <div style={styles.iconWrap}>
          <ShieldAlert size={32} color="var(--red)" strokeWidth={1.5} />
        </div>

        <h2 style={styles.title}>Admin Verification Required</h2>
        <p style={styles.sub}>
          The AI generated a{" "}
          <span style={{ color: "var(--red)", fontWeight: 700 }}>
            {queryType}
          </span>{" "}
          operation. This is destructive and requires admin authorization.
        </p>

        <div style={styles.sqlPreview}>
          <pre style={styles.sqlCode}>{sql}</pre>
        </div>

        <div style={styles.inputWrap}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter admin password…"
            style={{
              ...styles.input,
              borderColor: error ? "var(--red)" : "var(--border)",
            }}
            autoFocus
          />
          {error && (
            <div style={styles.error}>
              <X size={13} /> {error}
            </div>
          )}
          <div style={styles.hint}>
            Hint: Set in{" "}
            <code style={{ color: "var(--accent)" }}>
              .env → ADMIN_PASSWORD
            </code>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            onClick={handleCancel}
            className="btn btn-ghost"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !password}
            className="btn btn-danger"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Verifying…
              </>
            ) : (
              <>
                <Play size={14} /> Execute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modal: {
    background: "#0d1526",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "var(--radius-xl)",
    padding: "32px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    alignItems: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "rgba(239,68,68,0.1)",
    border: "2px solid rgba(239,68,68,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: "var(--text-primary)",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: "var(--text-secondary)",
    textAlign: "center",
    lineHeight: 1.6,
  },
  sqlPreview: {
    width: "100%",
    background: "#070d1a",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10,
    overflow: "auto",
    maxHeight: 100,
  },
  sqlCode: {
    padding: "12px 16px",
    margin: 0,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#ef4444",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  inputWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  input: {
    width: "100%",
    background: "rgba(0,0,0,0.4)",
    border: "1.5px solid",
    borderRadius: 10,
    padding: "13px 16px",
    color: "var(--text-primary)",
    fontSize: 15,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.2s",
  },
  error: {
    color: "var(--red)",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  hint: { fontSize: 12, color: "var(--text-muted)" },
  actions: { display: "flex", gap: 12, width: "100%" },
};
