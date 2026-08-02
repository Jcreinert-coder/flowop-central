import { useEffect, useRef } from 'react';
import { Eraser } from 'lucide-react';

export default function SignaturePad({ onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let down = false;
    const pos = (e) => {
      const r = c.getBoundingClientRect(), p = e.touches?.[0] || e;
      return [(p.clientX - r.left) * (c.width / r.width), (p.clientY - r.top) * (c.height / r.height)];
    };
    const start = (e) => { down = true; ctx.beginPath(); ctx.moveTo(...pos(e)); e.preventDefault(); };
    const move = (e) => { if (!down) return; ctx.lineTo(...pos(e)); ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke(); e.preventDefault(); };
    const end = () => { if (down) { down = false; onChange(c.toDataURL()); } };
    c.addEventListener('mousedown', start);
    c.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    c.addEventListener('touchstart', start, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    c.addEventListener('touchend', end);
    return () => window.removeEventListener('mouseup', end);
  }, [onChange]);

  const clear = () => {
    const c = ref.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    onChange('');
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="form-label">Assinatura digital</label>
        <button type="button" onClick={clear} className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#1F2937]"><Eraser size={13} />Limpar</button>
      </div>
      <canvas ref={ref} width="900" height="180" className="h-36 w-full touch-none rounded-xl border border-dashed border-blue-300 bg-white" />
      <p className="mt-2 text-[11px] text-[#9CA3AF]">Desenhe sua assinatura no campo acima</p>
    </div>
  );
}