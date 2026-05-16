import { History, X } from "lucide-react";

export default function QueryHistory({ history, onSelect, onClose, visible }) {
  if (!visible) return null;

  return (
    <>
      <div onClick={onClose} style={styles.backdrop} />
      <div style={styles.drawer} className="animate-slideR">
        <div style={styles.header}>
          <span style={styles.title}>
            <History
              size={16}
              style={{
                display: "inline",
                marginRight: 6,
                verticalAlign: "text-bottom",
              }}
            />{" "}
            Query History
          </span>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: "4px 10px" }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={styles.list}>
          {history.length === 0 ? (
            <div style={styles.empty}>No queries yet. Ask something!</div>
          ) : (
            history.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  onSelect(item.question);
                  onClose();
                }}
                style={styles.item}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-card-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div style={styles.itemTop}>
                  <span
                    className={`badge badge-${item.queryType === "SELECT" ? "blue" : "red"}`}
                    style={{ fontSize: 10 }}
                  >
                    {item.queryType || "SELECT"}
                  </span>
                  <span style={styles.time}>{formatTime(item.timestamp)}</span>
                </div>
                <div style={styles.question} title={item.question}>
                  {item.question}
                </div>
                <div style={styles.meta}>
                  {item.total} row{item.total !== 1 ? "s" : ""} ·{" "}
                  {item.executionTime}ms
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(7,13,26,0.6)",
    backdropFilter: "blur(2px)",
    zIndex: 300,
  },
  drawer: {
    position: "fixed",
    right: 0,
    top: 0,
    bottom: 0,
    width: 360,
    zIndex: 400,
    background: "#0d1526",
    borderLeft: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid var(--border)",
  },
  title: { fontWeight: 700, fontSize: 16 },
  list: { flex: 1, overflowY: "auto", padding: "8px 0" },
  item: {
    padding: "14px 20px",
    cursor: "pointer",
    borderBottom: "1px solid var(--border)",
    transition: "background 0.15s",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  time: { fontSize: 11, color: "var(--text-muted)" },
  question: {
    fontSize: 13.5,
    color: "var(--text-primary)",
    lineHeight: 1.4,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  meta: { marginTop: 5, fontSize: 11, color: "var(--text-muted)" },
  empty: {
    padding: "40px 20px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 14,
  },
};
