import { CMS_COMPONENTS } from '@/lib/cms-registry';

export function useAtomicCss(block: any) {
  const data = block.content || {};
  const atomClass = `atom-${block.id}`;
  const wrapperClass = `wrap-${block.id}`;
  const imgClass = `img-${block.id}`;

  const isAbsolute = (data.position === 'absolute');

  const getDefault = (key: string) => CMS_COMPONENTS[block.type]?.fields?.find(f => f.key === key)?.defaultValue;
  const getValue = (key: string) => (data[key] !== undefined && data[key] !== '') ? data[key] : getDefault(key);

  const baseInlineStyle: React.CSSProperties = {
    color: getValue('color') || (block.type === 'ATOMIC_TEXT' ? '#4B5563' : '#111827'),
    fontFamily: getValue('fontFamily') || 'inherit',
    fontWeight: getValue('fontWeight') || (block.type === 'ATOMIC_HEADING' ? '700' : '400'),
  };

  if (block.type === 'ATOMIC_BUTTON') {
    baseInlineStyle.backgroundColor = getValue('backgroundColor') || '#000000';
    baseInlineStyle.color = getValue('textColor') || '#ffffff';
    baseInlineStyle.borderColor = getValue('borderColor') || 'transparent';
    const bw = getValue('borderWidth');
    baseInlineStyle.borderWidth = bw ? `${bw}px` : '0px';
    baseInlineStyle.borderStyle = bw ? 'solid' : 'none';
  }

  if (block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') {
    baseInlineStyle.backgroundColor = getValue('backgroundColor') || 'transparent';
  }

  let mob = ''; let desk = ''; let wrapMob = ''; let wrapDesk = ''; let imgMob = ''; let imgDesk = '';

  const addCss = (key: string, prop: string, suffix = '') => {
    const v = getValue(key);
    if (v !== undefined && v !== '') mob += `${prop}: ${v}${suffix};\n`;
    if (data[`${key}Desktop`] !== undefined && data[`${key}Desktop`] !== '') desk += `${prop}: ${data[`${key}Desktop`]}${suffix};\n`;
  };

  addCss('position', 'position');
  addCss('top', 'top');
  addCss('bottom', 'bottom');
  addCss('left', 'left');
  addCss('right', 'right');
  addCss('transform', 'transform');
  addCss('zIndex', 'z-index');
  addCss('maxWidth', 'max-width');

  addCss('marginTop', 'margin-top', 'px');
  addCss('marginBottom', 'margin-bottom', 'px');
  addCss('margin', 'margin');
  addCss('padding', 'padding');
  addCss('borderRadius', 'border-radius', 'px');

  if (block.type === 'ATOMIC_CONTAINER') {
    mob += `display: ${getValue('display') || 'flex'};\n`;
    if (data.displayDesktop) desk += `display: ${data.displayDesktop};\n`;
    if (data.display === 'grid' || data.displayDesktop === 'grid') addCss('gridColumns', 'grid-template-columns');
    mob += `flex-direction: ${getValue('flexDirection') || 'column'};\n`;
    if (data.flexDirectionDesktop) desk += `flex-direction: ${data.flexDirectionDesktop};\n`;
    addCss('gap', 'gap', 'px');
    addCss('alignItems', 'align-items');
    addCss('justifyContent', 'justify-content');
  }

  if (block.type === 'ATOMIC_HEADING') {
    addCss('fontSize', 'font-size', 'px');
    addCss('letterSpacing', 'letter-spacing', 'px');
    addCss('align', 'text-align');
  }

  if (block.type === 'ATOMIC_TEXT') {
    addCss('fontSize', 'font-size', 'px');
    addCss('lineHeight', 'line-height');
    addCss('align', 'text-align');
  }

  if (block.type === 'ATOMIC_IMAGE') {
    addCss('width', 'width');
    addCss('height', 'height');
    imgMob += `width: 100%; height: 100%; object-fit: ${getValue('objectFit') || 'cover'};\n`;
    if (data.objectFitDesktop) imgDesk += `object-fit: ${data.objectFitDesktop};\n`;
  }

  if (block.type === 'ATOMIC_BUTTON') {
    addCss('fontSize', 'font-size', 'px');
    if (!data.padding && !data.paddingDesktop) mob += `padding: ${getValue('padding') || '12px 24px'};\n`;
    wrapMob += `display: flex; width: 100%; justify-content: ${getValue('align') || 'flex-start'};\n`;
    if (data.alignDesktop) wrapDesk += `justify-content: ${data.alignDesktop};\n`;
  }

  const injectedCSS = `
    .${atomClass} { ${mob} }
    ${imgMob ? `.${imgClass} { ${imgMob} }` : ''}
    ${wrapMob ? `.${wrapperClass} { ${wrapMob} }` : ''}
    @media (min-width: 768px) {
      .${atomClass} { ${desk} }
      ${imgDesk ? `.${imgClass} { ${imgDesk} }` : ''}
      ${wrapDesk ? `.${wrapperClass} { ${wrapDesk} }` : ''}
    }
  `;

  return { atomClass, wrapperClass, imgClass, baseInlineStyle, injectedCSS, getValue, isAbsolute };
}