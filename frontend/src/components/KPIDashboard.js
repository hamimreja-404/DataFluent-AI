import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, AlertTriangle, Package, Activity } from 'lucide-react';

export default function KPIDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/kpi');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch KPIs");
      }
      setLoading(false);
    };
    fetchKPIs();
    
    // Refresh every 1 min on frontend
    const interval = setInterval(fetchKPIs, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data || !data.data) {
    return <div style={styles.loading}>Loading Supply Chain Metrics...</div>;
  }

  const kpiData = data.data;

  return (
    <div style={styles.container} className="animate-fade">
      
      {/* AI Synthesis Report (Supply Chain Guard) */}
      <div style={styles.reportCard}>
        <div style={styles.reportHeader}>
          <Activity size={18} color="var(--accent-blue)" />
          <span style={styles.reportTitle}>Supply Chain & Credit Guard</span>
          <span style={styles.reportTime}>Updated: {new Date(data.lastUpdated).toLocaleTimeString()}</span>
        </div>
        <div style={styles.reportText}>
          {data.report}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconWrapper}><TrendingUp size={20} color="var(--accent-gold)"/></div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiLabel}>Total Revenue</span>
            <span style={styles.kpiValue}>₹{Number(kpiData.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrapper, background: 'rgba(239, 68, 68, 0.1)'}}><AlertTriangle size={20} color="var(--red)"/></div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiLabel}>Pending Bills</span>
            <span style={styles.kpiValue}>₹{Number(kpiData.pendingBills?.total_pending_value || 0).toLocaleString()}</span>
            <span style={styles.kpiSubLabel}>{kpiData.pendingBills?.pending_count || 0} Open Invoices</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrapper, background: 'rgba(79, 142, 247, 0.1)'}}><Package size={20} color="var(--accent-blue)"/></div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiLabel}>Low Stock Alerts</span>
            <span style={styles.kpiValue}>{kpiData.lowStockCount || 0} Items</span>
            <span style={styles.kpiSubLabel}>{(kpiData.lowStockItems || []).slice(0,2).join(', ')}{kpiData.lowStockCount > 2 ? '...' : ''}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrapper, background: 'rgba(34, 197, 94, 0.1)'}}><TrendingUp size={20} color="#22c55e"/></div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiLabel}>Top Product</span>
            <span style={{...styles.kpiValue, fontSize: 16}}>{kpiData.topProduct?.product_name || 'N/A'}</span>
            <span style={styles.kpiSubLabel}>{kpiData.topProduct?.total_sold || 0} units sold</span>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  loading: { padding: 20, textAlign: 'center', color: 'var(--text-muted)' },
  reportCard: { background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 },
  reportHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  reportTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-main)', flex: 1 },
  reportTime: { fontSize: 11, color: 'var(--text-muted)' },
  reportText: { fontSize: 14, color: 'var(--accent-blue)', lineHeight: 1.5, background: 'rgba(79, 142, 247, 0.05)', padding: 12, borderRadius: 6 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  kpiCard: { background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 },
  kpiIconWrapper: { background: 'rgba(235, 172, 38, 0.1)', padding: 10, borderRadius: 8, display: 'flex' },
  kpiContent: { display: 'flex', flexDirection: 'column', gap: 4 },
  kpiLabel: { fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 20, fontWeight: 700, color: 'var(--text-main)' },
  kpiSubLabel: { fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }
};
