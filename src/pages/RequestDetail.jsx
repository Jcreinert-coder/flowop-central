import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Check, Clock3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { demo } from '@/components/production/QueueTable';
import StatusActions from '@/components/production/StatusActions';

const timeline = ['Solicitação criada', 'OP criada', 'Enviada para Produção', 'Apontada', 'Finalizada'];

export default function RequestDetail() {
  const { id } = useParams();
  const isDemo = id.startsWith('demo-');
  const [item, setItem] = useState(demo.find((x) => x.id === id) || null);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (!isDemo) base44.entities.ProductionRequest.get(id).then((x) => { setItem(x); setLoading(false); });
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#0F172A] text-violet-300">Carregando solicitação...</div>;
  if (!item) return <div className="grid min-h-screen place-items-center bg-[#0F172A] text-white">Solicitação não encontrada.</div>;

  const details = [
    ['Número da Solicitação', item.request_number],
    ['Número da OP', item.op_number || 'Aguardando'],
    ['Data', item.created_date ? new Date(item.created_date).toLocaleDateString('pt-BR') : '18/07/2026'],
    ['Hora', item.request_time],
    ['Técnico Solicitante', item.technician_name],
    ['Setor', item.sector],
    ['Produto', item.product],
    ['Quantidade', `${item.quantity?.toLocaleString('pt-BR')} ${item.unit}`],
    ['Prioridade', item.priority],
    ['Status', item.status],
  ];
  const done = item.history?.filter((x) => x.completed).length || (item.status === 'Concluída' ? 5 : item.status === 'OP Criada' ? 2 : 1);

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 text-slate-300 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/solicitacoes" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400">
          <ArrowLeft size={16} />Voltar às solicitações
        </Link>
        <div className="glass p-6 md:p-8">
          <div className="flex justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-sm text-violet-300">Detalhes da Solicitação</p>
              <h1 className="text-3xl font-semibold text-white">{item.request_number}</h1>
            </div>
            <span className="h-fit rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">{item.status}</span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {details.map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white/[.035] p-4">
                <small className="text-slate-500">{l}</small>
                <p className="mt-1 text-sm font-medium text-white">{v}</p>
              </div>
            ))}
          </div>

          <StatusActions item={item} onUpdate={setItem} isDemo={isDemo} />

          <h2 className="section-title mt-8">Histórico completo</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {timeline.map((t, i) => (
              <div key={t}>
                <span className={`grid h-9 w-9 place-items-center rounded-full ${i < done ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                  {i < done ? <Check size={16} /> : <Clock3 size={15} />}
                </span>
                <p className="mt-3 text-xs">{t}</p>
                <small className="text-[10px] text-slate-600">{i < done ? 'Concluído' : 'Pendente'}</small>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="section-title">Assinatura Digital do Técnico</h2>
            {item.signature ? <img src={item.signature} alt="Assinatura digital" className="mt-3 h-28 rounded-xl bg-white p-3" /> : <p className="mt-3 text-sm italic text-slate-600">Assinatura registrada eletronicamente</p>}
          </div>
        </div>
      </div>
    </div>
  );
}