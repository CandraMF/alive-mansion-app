import { CMS_COMPONENTS } from '@/lib/cms-registry';

export function useAtomicCss(block: any) {
  const data = block.content || {};
  const states = data.states || {};

  const atomClass = `atom-${block.id}`;
  const wrapperClass = `wrap-${block.id}`;
  const imgClass = `img-${block.id}`;

  const isAbsolute = (data.position === 'absolute');

  const blueprint = CMS_COMPONENTS[block.type];
  if (!blueprint) return { atomClass, wrapperClass, imgClass, injectedCSS: '', getValue: () => '', isAbsolute: false, baseInlineStyle: {} };

  const getDefault = (key: string) => blueprint.fields?.find(f => f.key === key)?.defaultValue;

  // 1. GET VALUE: Untuk Komponen React (Sekarang Desktop adalah Master)
  const getValue = (key: string, stateName = 'default') => {
    if (stateName !== 'default' && states[stateName] && states[stateName][key] !== undefined && states[stateName][key] !== '') {
      return states[stateName][key];
    }
    return (data[key] !== undefined && data[key] !== '') ? data[key] : getDefault(key);
  };

  // 2. GET STRICT VALUE: Khusus untuk Engine CSS Hover/Focus
  const getStrictStateValue = (key: string, stateName: string) => {
    if (states[stateName] && states[stateName][key] !== undefined && states[stateName][key] !== '') {
      return states[stateName][key];
    }
    return '';
  };

  // 🚀 ARSITEKTUR BARU: Pemetaan CSS Desktop-First
  const cssMap = {
    atom: { baseDesk: '', baseMob: '', hoverDesk: '', hoverMob: '', focusDesk: '', focusMob: '' },
    wrap: { baseDesk: '', baseMob: '', hoverDesk: '', hoverMob: '', focusDesk: '', focusMob: '' },
    img: { baseDesk: '', baseMob: '', hoverDesk: '', hoverMob: '', focusDesk: '', focusMob: '' },
  };

  // Aturan Bawaan
  if (block.type === 'ATOMIC_IMAGE') {
    cssMap.img.baseDesk += `width: 100%; height: 100%; `;
  }
  if (block.type === 'ATOMIC_BUTTON') {
    cssMap.wrap.baseDesk += `display: inline-flex; `;
    cssMap.atom.baseDesk += `border-style: solid; `;
  }

  // Meloop Data Registry
  blueprint.fields.forEach(field => {
    if (!field.cssProp) return;
    const unit = field.cssUnit || '';
    const buildCss = (val: any) => (val === undefined || val === '') ? '' : `${field.cssProp}: ${val}${unit}; `;

    // Menentukan elemen mana yang ditarget (Atom utama, Pembungkus, atau Gambar)
    const target = field.cssTarget === 'wrapper' ? cssMap.wrap : (field.cssTarget === 'img' ? cssMap.img : cssMap.atom);

    // 🚀 DESKTOP-FIRST: 'key' adalah Master (Desktop)
    target.baseDesk += buildCss(getValue(field.key));
    target.hoverDesk += buildCss(getStrictStateValue(field.key, 'hover'));
    target.focusDesk += buildCss(getStrictStateValue(field.key, 'focus'));

    // 🚀 MOBILE OVERRIDE: 'keyMobile' adalah Override
    if (field.responsive) {
      target.baseMob += buildCss(data[`${field.key}Mobile`]);
      target.hoverMob += buildCss(getStrictStateValue(`${field.key}Mobile`, 'hover'));
      target.focusMob += buildCss(getStrictStateValue(`${field.key}Mobile`, 'focus'));
    }
  });

  // Fitur Advanced Custom CSS
  const applyCustomCss = (customArray: any[], state: 'base' | 'hover' | 'focus') => {
    if (!Array.isArray(customArray)) return;
    customArray.forEach((item: any) => {
      if (!item.prop || !item.val) return;
      const cssLine = `${item.prop}: ${item.val}; `;
      if (item.device === 'desktop') {
        cssMap.atom[`${state}Desk`] += cssLine;
      } else if (item.device === 'mobile') {
        cssMap.atom[`${state}Mob`] += cssLine;
      } else {
        cssMap.atom[`${state}Mob`] += cssLine;
        cssMap.atom[`${state}Desk`] += cssLine;
      }
    });
  };

  applyCustomCss(data.customCss, 'base');
  applyCustomCss(states.hover?.customCss, 'hover');
  applyCustomCss(states.focus?.customCss, 'focus');

  // 🚀 KOMPILASI AKHIR MENJADI KODE CSS (DESKTOP FIRST)
  let rawCSS = `
    /* --- DESKTOP (MASTER) --- */
    .${atomClass} { ${cssMap.atom.baseDesk} transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    ${cssMap.img.baseDesk ? `.${imgClass} { ${cssMap.img.baseDesk} transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }` : ''}
    ${cssMap.wrap.baseDesk ? `.${wrapperClass} { ${cssMap.wrap.baseDesk} transition: all 0.3s ease; }` : ''}
  `;

  // Suntikkan Pseudo-class Desktop (Master)
  if (cssMap.atom.hoverDesk) rawCSS += `.${atomClass}:hover { ${cssMap.atom.hoverDesk} } `;
  if (cssMap.atom.focusDesk) rawCSS += `.${atomClass}:focus-within, .${atomClass}:focus { ${cssMap.atom.focusDesk} } `;

  if (cssMap.wrap.hoverDesk) rawCSS += `.${wrapperClass}:hover { ${cssMap.wrap.hoverDesk} } `;
  if (cssMap.wrap.focusDesk) rawCSS += `.${wrapperClass}:focus-within, .${wrapperClass}:focus { ${cssMap.wrap.focusDesk} } `;

  if (cssMap.img.hoverDesk) rawCSS += `.${wrapperClass}:hover .${imgClass}, .${atomClass}:hover .${imgClass} { ${cssMap.img.hoverDesk} } `;

  // Suntikkan Media Query Mobile (Override)
  // Perhatikan max-width: 767px menggantikan min-width: 768px!
  rawCSS += `
    /* --- MOBILE (OVERRIDE) --- */
    @media (max-width: 767px) {
      ${cssMap.atom.baseMob ? `.${atomClass} { ${cssMap.atom.baseMob} }` : ''}
      ${cssMap.img.baseMob ? `.${imgClass} { ${cssMap.img.baseMob} }` : ''}
      ${cssMap.wrap.baseMob ? `.${wrapperClass} { ${cssMap.wrap.baseMob} }` : ''}

      ${cssMap.atom.hoverMob ? `.${atomClass}:hover { ${cssMap.atom.hoverMob} } ` : ''}
      ${cssMap.atom.focusMob ? `.${atomClass}:focus-within, .${atomClass}:focus { ${cssMap.atom.focusMob} } ` : ''}

      ${cssMap.wrap.hoverMob ? `.${wrapperClass}:hover { ${cssMap.wrap.hoverMob} } ` : ''}
      ${cssMap.wrap.focusMob ? `.${wrapperClass}:focus-within, .${wrapperClass}:focus { ${cssMap.wrap.focusMob} } ` : ''}

      ${cssMap.img.hoverMob ? `.${wrapperClass}:hover .${imgClass}, .${atomClass}:hover .${imgClass} { ${cssMap.img.hoverMob} } ` : ''}
    }
  `;

  const injectedCSS = rawCSS.replace(/\s+/g, ' ').trim();

  return { atomClass, wrapperClass, imgClass, injectedCSS, getValue, isAbsolute, baseInlineStyle: {} };
}