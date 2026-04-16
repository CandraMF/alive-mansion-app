import { CMS_COMPONENTS } from '@/lib/cms-registry';

export function useAtomicCss(block: any) {
  const data = block.content || {};
  const atomClass = `atom-${block.id}`;
  const wrapperClass = `wrap-${block.id}`;
  const imgClass = `img-${block.id}`;

  const isAbsolute = data.position === 'absolute';

  const blueprint = CMS_COMPONENTS[block.type];
  if (!blueprint) return { atomClass, wrapperClass, imgClass, injectedCSS: '', getValue: () => '', isAbsolute: false, baseInlineStyle: {} };

  const getDefault = (key: string) => blueprint.fields?.find(f => f.key === key)?.defaultValue;
  const getValue = (key: string) => (data[key] !== undefined && data[key] !== '') ? data[key] : getDefault(key);

  let mobAtom = ''; let deskAtom = '';
  let wrapMob = ''; let wrapDesk = '';
  let imgMob = ''; let imgDesk = '';

  if (block.type === 'ATOMIC_IMAGE') {
    imgMob += `width: 100%; height: 100%; `;
  }
  if (block.type === 'ATOMIC_BUTTON') {
    wrapMob += `display: flex; width: 100%; `;
    mobAtom += `border-style: solid; `;
  }

  blueprint.fields.forEach(field => {
    if (!field.cssProp) return;

    const valMob = getValue(field.key);
    const valDesk = data[`${field.key}Desktop`];

    const unit = field.cssUnit || '';
    const target = field.cssTarget || 'atom';

    const applyProp = (val: any, isDesk: boolean) => {
      if (val === undefined || val === '') return;
      const cssLine = `${field.cssProp}: ${val}${unit}; `;

      if (target === 'atom') {
        if (isDesk) deskAtom += cssLine; else mobAtom += cssLine;
      } else if (target === 'wrapper') {
        if (isDesk) wrapDesk += cssLine; else wrapMob += cssLine;
      } else if (target === 'img') {
        if (isDesk) imgDesk += cssLine; else imgMob += cssLine;
      }
    };

    applyProp(valMob, false);
    applyProp(valDesk, true);
  });

  // 🔥 PERBAIKAN HYDRATION: Hapus semua spasi/enter berlebih (Minify CSS)
  const rawCSS = `
    .${atomClass} { ${mobAtom} }
    ${imgMob ? `.${imgClass} { ${imgMob} }` : ''}
    ${wrapMob ? `.${wrapperClass} { ${wrapMob} }` : ''}
    @media (min-width: 768px) {
      .${atomClass} { ${deskAtom} }
      ${imgDesk ? `.${imgClass} { ${imgDesk} }` : ''}
      ${wrapDesk ? `.${wrapperClass} { ${wrapDesk} }` : ''}
    }
  `;

  const injectedCSS = rawCSS.replace(/\s+/g, ' ').trim();

  return { atomClass, wrapperClass, imgClass, injectedCSS, getValue, isAbsolute, baseInlineStyle: {} };
}