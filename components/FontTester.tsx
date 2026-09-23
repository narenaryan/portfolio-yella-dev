'use client';

import { useEffect, useState } from 'react';

const fonts = [
  { label: 'Merriweather', family: 'Merriweather, ui-serif, Georgia, serif', href: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap' },
  { label: 'System Serif', family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', href: '' },
  { label: 'Lora', family: 'Lora, ui-serif, Georgia, serif', href: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' },
  { label: 'Libre Baskerville', family: '"Libre Baskerville", ui-serif, Georgia, serif', href: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap' },
  { label: 'Playfair Display', family: '"Playfair Display", ui-serif, Georgia, serif', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap' },
  { label: 'Inter', family: 'Inter, ui-sans-serif, system-ui, sans-serif', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { label: 'Source Serif 4', family: '"Source Serif 4", ui-serif, Georgia, serif', href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap' },
];

export function FontTester() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(fonts[0]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-body', current.family);
    if (!current.href || document.querySelector(`link[data-font-tester="${current.label}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = current.href;
    link.dataset.fontTester = current.label;
    document.head.appendChild(link);
  }, [current]);

  if (process.env.NODE_ENV !== 'development') return null;

  return <div className="font-tester">
    <button type="button" onClick={() => setOpen(!open)}>Font: {current.label}</button>
    {open && <div className="font-tester-panel">
      {fonts.map((font) => <button key={font.label} type="button" onClick={() => { setCurrent(font); setOpen(false); }}>{font.label}</button>)}
    </div>}
  </div>;
}
