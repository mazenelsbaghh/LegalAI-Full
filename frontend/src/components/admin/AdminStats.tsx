
import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminStats() {
  const [caseStats, setCaseStats] = useState({ open: 0, inProgress: 0, closed: 0 });
  const [lawyerStats, setLawyerStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedCases = JSON.parse(localStorage.getItem('cases') || '[]');
    const storedLawyers = JSON.parse(localStorage.getItem('lawyers') || '[]');

    const stats = { open: 0, inProgress: 0, closed: 0 };
    const lawyerCount: Record<string, number> = {};

    for (const c of storedCases) {
      stats[c.status] = (stats[c.status] || 0) + 1;
      if (c.lawyer_id) {
        lawyerCount[c.lawyer_id] = (lawyerCount[c.lawyer_id] || 0) + 1;
      }
    }

    setCaseStats(stats);

    const lawyerStatsMapped: Record<string, number> = {};
    for (const l of storedLawyers) {
      lawyerStatsMapped[l.name] = lawyerCount[l.id] || 0;
    }

    setLawyerStats(lawyerStatsMapped);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6 my-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">توزيع القضايا حسب الحالة</h3>
        <Pie
          data={{
            labels: ['مفتوحة', 'جارية', 'مغلقة'],
            datasets: [{
              data: [caseStats.open, caseStats.inProgress, caseStats.closed],
              backgroundColor: ['#4f46e5', '#facc15', '#10b981'],
            }]
          }}
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">عدد القضايا لكل محامي</h3>
        <Bar
          data={{
            labels: Object.keys(lawyerStats),
            datasets: [{
              label: 'عدد القضايا',
              data: Object.values(lawyerStats),
              backgroundColor: '#6366f1'
            }]
          }}
          options={{ indexAxis: 'y' }}
        />
      </div>
    </div>
  );
}
