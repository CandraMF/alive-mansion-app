'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function IFrameWrapper({ children }: { children: React.ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const meta = doc.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    doc.head.appendChild(meta);

    const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => doc.head.appendChild(style.cloneNode(true)));

    doc.body.className = document.body.className;
    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.backgroundColor = 'transparent';
    doc.body.style.minHeight = '100vh';
    doc.documentElement.style.overflowX = 'hidden';
    doc.body.style.overflowX = 'hidden';
    doc.body.style.width = '100%';

    setIframeBody(doc.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') doc.head.appendChild(node.cloneNode(true));
        });
      });
    });
    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, []);

  return (
    <iframe ref={iframeRef} className="w-full h-full border-0 bg-white block" title="CMS Preview Canvas">
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
}