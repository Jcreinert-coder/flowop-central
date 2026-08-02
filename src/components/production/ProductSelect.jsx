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
        <span className={value ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}>{value || placeholder}</span>
        <ChevronDown size={16} className="shrink-0 text-[#9CA3AF]" />
      </button>
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-3 py-2">
            <Search size={14} className="shrink-0 text-[#9CA3AF]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => { onChange(p); setOpen(false); setQuery(''); }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#F7F7F8] ${value === p ? 'text-emerald-600' : 'text-[#374151]'}`}
              >
                {p}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-4 py-3 text-sm text-[#9CA3AF]">Nenhum produto encontrado.</p>}
          </div>
        </div>
      )}
    </div>
  );
}