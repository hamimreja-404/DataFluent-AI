import { useState } from 'react';
import { Trophy, Package, Users, Map, AlertTriangle, UserCheck } from 'lucide-react';

const CATEGORIES = [
  {
    Icon: Trophy, label: 'Sales', color: 'var(--accent)',
    questions: [
      'Show top 5 products by total sales',
      'Show monthly sales trend for this year',
      'List all pending payments',
      'Which employee made the most sales?',
    ],
  },
  {
    Icon: Package, label: 'Inventory', color: 'var(--green)',
    questions: [
      'Which products are below reorder level?',
      'Show inventory stock by region',
      'Products with zero stock available',
      'List all products with stock less than 50',
    ],
  },
  {
    Icon: Users, label: 'Customers', color: 'var(--purple)',
    questions: [
      'List all premium customers',
      'Which customers have open complaints?',
      'Top 10 customers by purchase value',
      'Customers from East zone',
    ],
  },
  {
    Icon: Map, label: 'Regions', color: 'var(--gold)',
    questions: [
      'Which region has highest revenue?',
      'Sales performance comparison by zone',
      'Employee count by region',
      'Show all regions and their sales totals',
    ],
  },
  {
    Icon: AlertTriangle, label: 'Complaints', color: 'var(--red)',
    questions: [
      'Show all open complaints',
      'Products with the most complaints',
      'Unresolved complaints older than 30 days',
      'Complaint resolution rate by product',
    ],
  },
  {
    Icon: UserCheck, label: 'Employees', color: '#38bdf8',
    questions: [
      'Top 5 employees by total sales revenue',
      'Average salary by department',
      'Employees joined in the last year',
      'Employee count by designation',
    ],
  },
];

export default function SuggestionChips({ onSelect }) {
  const [activeCat, setActiveCat] = useState(null);

  return (
    <div style={styles.wrap}>
      <div style={styles.tabs}>
        {CATEGORIES.map(({ Icon, label, color }) => (
          <button
            key={label}
            onClick={() => setActiveCat(activeCat === label ? null : label)}
            style={{
              ...styles.tab,
              background:   activeCat === label ? `${color}22` : 'transparent',
              borderColor:  activeCat === label ? color : 'var(--border)',
              color:        activeCat === label ? color : 'var(--text-secondary)',
            }}
          >
            <Icon size={13} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {activeCat && (() => {
        const cat = CATEGORIES.find(c => c.label === activeCat);
        return (
          <div style={styles.questions} className="animate-fade">
            {cat.questions.map(q => (
              <span key={q} onClick={() => onSelect(q)} style={styles.chip}>{q}</span>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

const styles = {
  wrap:      { display: 'flex', flexDirection: 'column', gap: 10 },
  tabs:      { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tab:       { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' },
  questions: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip:      { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: 99, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' },
};
