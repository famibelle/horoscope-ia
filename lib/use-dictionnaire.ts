'use client';

import { useState, useEffect } from 'react';

export interface DictDef {
  definition: string;
  nomFrancais?: string;
  nomScientifique?: string;
  type: string;
  sacreSymbolique?: string;
}

// Cache module-level : chargé une seule fois par session navigateur
let _cache: Record<string, DictDef> | null = null;
let _promise: Promise<Record<string, DictDef>> | null = null;

function fetchDict(): Promise<Record<string, DictDef>> {
  if (_cache) return Promise.resolve(_cache);
  if (!_promise) {
    _promise = fetch('/api/dictionnaire')
      .then(r => r.ok ? r.json() : {})
      .then(data => { _cache = data; return data; })
      .catch(() => ({}));
  }
  return _promise;
}

export function useDictionnaire(): Record<string, DictDef> {
  const [dict, setDict] = useState<Record<string, DictDef>>(_cache ?? {});

  useEffect(() => {
    if (_cache) { setDict(_cache); return; }
    fetchDict().then(setDict);
  }, []);

  return dict;
}
