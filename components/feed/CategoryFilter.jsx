import { CATEGORIES } from '../../lib/campus.js';

export default function CategoryFilter({ value, onChange }) {
  const all = [{ id: 'all', label: 'Everything' }, ...CATEGORIES];
  return (
    <div className="chips" role="radiogroup" aria-label="Category">
      {all.map((c) => (
        <button key={c.id} type="button" role="radio" aria-checked={value === c.id} className={`chip ${value === c.id ? 'on' : ''}`} onClick={() => onChange(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}
