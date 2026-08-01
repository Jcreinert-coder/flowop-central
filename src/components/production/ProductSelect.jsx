import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function ProductSelect({ products = [], value, onChange, disabled = false, placeholder = 'Selecione...' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = products.filter((p) => p.toLowerCase().includes(query.toLowerCase().trim()));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(!open); setQuery(''); } }}
        className={`form-input flex items-center justify-between text-left ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <span className={value ? 'text-white' : 'text-slate-600'}>{value || placeholder}</span>
        <ChevronDown size={16} className="shrink-0 text-slate-500" />
      </button>
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b1224] shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => { onChange(p); setOpen(false); setQuery(''); }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-white/5 ${value === p ? 'text-violet-300' : 'text-slate-300'}`}
              >
                {p}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-4 py-3 text-sm text-slate-600">Nenhum produto encontrado.</p>}
          </div>
        </div>
      )}
    </div>
  );
}