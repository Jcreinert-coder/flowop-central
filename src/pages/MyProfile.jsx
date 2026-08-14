import { ArrowLeft, Briefcase, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/production/Sidebar';
import { useRole } from '@/lib/RoleContext';
import { profileLabel } from '@/lib/areas';

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon size={16} className="text-[#9CA3AF]" />
      <span className="w-28 shrink-0 text-xs text-[#9CA3AF]">{label}</span>
      <span className="text-sm text-[#1F2937]">{value}</span>
    </div>
  );
}

export default function MyProfile() {
  const { user, name, profile, area } = useRole();
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const funcao = profileLabel(profile);
  const areaLabel = profile === 'tecnico' ? (area || '—') : (area || funcao);

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#374151]">
      <Sidebar />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937]"><ArrowLeft size={16} />Dashboard</Link>
          <div>
            <p className="text-sm text-blue-600">Conta</p>
            <h1 className="text-3xl font-semibold text-[#1F2937]">Meu Perfil</h1>
          </div>
          <section className="glass p-8">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-xl font-semibold text-blue-700">{initials}</span>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-[#1F2937]">{name}</h2>
                <p className="text-sm text-[#9CA3AF]">{funcao} · {areaLabel}</p>
              </div>
            </div>
            <div className="mt-6 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
              <Row icon={Mail} label="E-mail" value={user?.email || '—'} />
              <Row icon={Briefcase} label="Função" value={funcao} />
              <Row icon={MapPin} label="Área / Setor" value={areaLabel} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}