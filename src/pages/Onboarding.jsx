import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Factory, Loader2, UserCog } from 'lucide-react';
import { useAreas } from '@/lib/useAreas';

const FUNCOES = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'supply', label: 'Supply' },
  { value: 'geral', label: 'Geral' },
];

export default function Onboarding() {
  const [funcao, setFuncao] = useState('');
  const [area, setArea] = useState('');
  const [saving, setSaving] = useState(false);
  const { names: areas } = useAreas();

  const canSubmit = !!funcao && (funcao !== 'tecnico' || !!area);

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const areaValue = funcao === 'tecnico' ? area : funcao === 'supply' ? 'Supply' : 'Geral';
      const cargoValue = funcao === 'tecnico' ? '' : areaValue;
      await base44.auth.updateMe({ profile: funcao, area: areaValue, cargo: cargoValue });
      window.location.href = '/';
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#F7F7F8] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Factory size={22} />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-[#1F2937]">Bem-vindo ao CSOP</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Para concluir seu cadastro, informe seu perfil de acesso.</p>
        </div>

        <div className="space-y-5">
          <div>
            <span className="form-label">Qual é sua função? *</span>
            <div className="grid gap-2">
              {FUNCOES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => { setFuncao(f.value); setArea(''); }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${funcao === f.value ? 'border-blue-500 bg-blue-50 font-medium text-blue-700' : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F7F7F8]'}`}
                >
                  <UserCog size={16} />{f.label}
                </button>
              ))}
            </div>
          </div>

          {funcao === 'tecnico' && (
            <div>
              <span className="form-label">Qual é sua área? *</span>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="form-input">
                <option value="">Selecione...</option>
                {areas.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={submit}
            disabled={saving || !canSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" />Salvando...</> : 'Concluir cadastro'}
          </button>
        </div>
      </div>
    </div>
  );
}