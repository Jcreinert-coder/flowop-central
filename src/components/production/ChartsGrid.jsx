import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ETAPAS } from '@/lib/areas';

const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'];

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1F2937] shadow-md">{label || payload[0].name}: <b>{payload[0].value}</b></div>
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
  const nav = useNavigate();
  const scoped = profile === 'tecnico' ? rows.filter((r) => r.area === area) : rows;
  const porDia = byDay(scoped);
  const porArea = tally(scoped, 'area');
  const porStatus = tally(scoped, 'status');
  const porProduto = tally(scoped, 'product').slice(0, 6);
  const porMes = byMonth(scoped);
  const porEtapa = ETAPAS.map((e) => ({ n: e, v: scoped.filter((r) => r.etapa === e).length }));
  const pieData = profile === 'tecnico' ? porStatus : porArea;

  const goArea = (name) => name && name !== '—' && nav(`/solicitacoes?prefilter=area&value=${encodeURIComponent(name)}`);
  const goStatus = (name) => name && name !== '—' && nav(`/solicitacoes?prefilter=status&value=${encodeURIComponent(name)}`);
  const goProduct = (name) => name && name !== '—' && nav(`/solicitacoes?prefilter=product&value=${encodeURIComponent(name)}`);
  const goEtapa = (name) => name && name !== '—' && nav(`/solicitacoes?prefilter=etapa&value=${encodeURIComponent(name)}`);

  const axisColor = '#9CA3AF';
  const gridColor = '#F0F0F1';

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="glass p-5">
        <h2 className="section-title">Solicitações por dia</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={porDia.length ? porDia : empty}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#10b981" radius={[8, 8, 2, 2]} cursor={{ fill: '#10b9810a' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">{profile === 'tecnico' ? 'Solicitações por status' : 'Solicitações por área'}</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData.length ? pieData : empty} dataKey="v" innerRadius={56} outerRadius={88} paddingAngle={4} onClick={(d) => profile === 'tecnico' ? goStatus(d.n) : goArea(d.n)} cursor="pointer">
                {(pieData.length ? pieData : empty).map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">Solicitações por etapa</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={porEtapa.length ? porEtapa : empty}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#8b5cf6" radius={[8, 8, 2, 2]} cursor={{ fill: '#8b5cf60a' }} onClick={(d) => goEtapa(d.n)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">Produtos mais solicitados</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={porProduto.length ? porProduto : empty} layout="vertical">
              <CartesianGrid horizontal={false} stroke={gridColor} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
              <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={100} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#0ea5e9" radius={[0, 6, 6, 0]} cursor={{ fill: '#0ea5e90a' }} onClick={(d) => goProduct(d.n)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass p-5">
        <h2 className="section-title">OPs por status</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={porStatus.length ? porStatus : empty} layout="vertical">
              <CartesianGrid horizontal={false} stroke={gridColor} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
              <YAxis type="category" dataKey="n" axisLine={false} tickLine={false} width={120} tick={{ fill: '#6B7280', fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="v" name="Solicitações" fill="#f59e0b" radius={[0, 6, 6, 0]} cursor={{ fill: '#f59e0b0a' }} onClick={(d) => goStatus(d.n)} />
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
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Area dataKey="v" name="Solicitações" stroke="#0ea5e9" strokeWidth={3} fill="url(#gMes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}