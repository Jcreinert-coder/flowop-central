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

function byUnit(rows) {
  const map = {};
  rows.forEach((r) => { map[r.unit] = (map[r.unit] || 0) + (Number(r.quantity) || 0); });
  return Object.entries(map).map(([n, v]) => ({ n, v }));
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

export default function ChartsGrid({ rows, profile, sector }) {
  const scoped = profile === 'tecnico' ? rows.filter((r) => r.sector === sector) : rows;
  const porDia = byDay(scoped);
  const porProduto = tally(scoped, 'product').slice(0, 6);
  const porUnidade = byUnit(scoped);
  const porMes = byMonth(scoped);

  return (
    <section id="graficos" className="grid gap-4 xl:grid-cols-3">
      <article className="glass p-5 xl:col-span-2">
        <h2 className="section-title">Solicitações por dia</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={porDia.length ? porDia : [{ n: 'Hoje', v: scoped.length }]}>
              <CartesianGrid vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#8b5cf6" radius={[8, 8, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">{profile === 'tecnico' ? 'Produtos mais solicitados' : 'Solicitações por setor'}</h2>
        <div className="h-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={profile === 'tecnico' ? porProduto : tally(scoped, 'sector')} dataKey="v" innerRadius={52} outerRadius={78} paddingAngle={5}>
                {(profile === 'tecnico' ? porProduto : tally(scoped, 'sector')).map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      {profile !== 'tecnico' && (
        <article className="glass p-5">
          <h2 className="section-title">Solicitações por técnico</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={tally(scoped, 'technician_name')} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="v" name="Solicitações" fill="#22d3ee" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      )}

      <article className="glass p-5">
        <h2 className="section-title">Quantidade por unidade de medida</h2>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={porUnidade}>
              <CartesianGrid vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Quantidade" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5 xl:col-span-2">
        <h2 className="section-title">Histórico mensal</h2>
        <div className="h-48">
          <ResponsiveContainer>
            <AreaChart data={porMes.length ? porMes : [{ n: '2026-07', v: scoped.length }]}>
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<Tip />} />
              <Area dataKey="v" name="Solicitações" stroke="#22d3ee" strokeWidth={3} fill="#22d3ee18" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}