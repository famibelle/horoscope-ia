'use client';

import { useState } from 'react';
import SignSelector from './SignSelector';
import HoroscopeCard from './HoroscopeCard';

export default function InteractiveHoroscope() {
  const [selectedSignId, setSelectedSignId] = useState<string>('lion');

  return (
    <>
      <SignSelector selected={selectedSignId} onSelect={setSelectedSignId} />
      <HoroscopeCard signId={selectedSignId} />
    </>
  );
}
