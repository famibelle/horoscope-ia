'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window { adsbygoogle: unknown[]; }
}

interface AdSpaceProps {
  variant: 'banner' | 'square';
}

export default function AdSpace({ variant }: AdSpaceProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !insRef.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className="px-4 my-8 max-w-5xl mx-auto overflow-hidden">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3159683365493434"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
