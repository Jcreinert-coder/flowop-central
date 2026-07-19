import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const palette = ['#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#38bdf8'];

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white">{label || payload[0].name}: <b>{payload[0].value}</b></div>
  ) : null;

function tally(rows, key) {
  const map = {};
  rows.forEach((r) => { const k = r[key] || '—'; map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v);
}

function byDay(rows) {
  const map = {};
  rows.forEach((r) => { const d = (r.request_date || '').slice(5); if (!d) return; map[d] = (map[d] || 0) + 1; });
  return Object.entries(map).sort().map(([n, v]) => ({ n, v }));
}

function byMonth(rows) {
  const map = {};
  rows.forEach((r) => { const m = (r.request_date || '').slice(0, 7); if (!m) return; map[m] = (map[m] || 0) + 1; });
  return Object.entries(map).sort().map(([n, v]) => ({ n, v }));
}

const empty = [{ n: '—', v: 0 }];

export default function ChartsGrid({ rows, profile, area }) {
  const scoped = profile === 'tecnico' ? rows.filter((r) => r.area === area) : rows;
  const porDia = byDay(scoped);
  const porArea = tally(scoped, 'area');
  const porStatus = tally(scoped, 'status');
  const porProduto = tally(scoped, 'product').slice(0, 6);
  const porMes = byMonth(scoped);
  const pieData = profile === 'tecnico' ? porStatus : porArea;
  const pieTitle = profile === 'tecnico' ? 'Solicitações por status' : 'Solicitações por área';

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="glass p-5">
        <h2 className="section-title">Solicitações por dia</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={porDia.length ? porDia : empty}>
              <CartesianGrid vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#8b5cf6" radius={[8, 8, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">{pieTitle}</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData.length ? pieData : empty} dataKey="v" innerRadius={56} outerRadius={88} paddingAngle={4}>
                {(pieData.length ? pieData : empty).map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">Produtos mais solicitados</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={porProduto.length ? porProduto : empty} layout="vertical">
              <CartesianGrid horizontal={false} stroke="#ffffff0a" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#34d399" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">Evolução mensal</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <AreaChart data={porMes.length ? porMes : empty}>
              <defs>
                <linearGradient id="gMes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Area dataKey="v" name="Solicitações" stroke="#22d3ee" strokeWidth={3} fill="url(#gMes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}