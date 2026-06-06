'use client';
import CookieConsent from 'react-cookie-consent';
import Link from 'next/link';

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accepter"
      declineButtonText="Refuser"
      enableDeclineButton
      cookieName="zodyak-cookie-consent"
      style={{
        background: '#13111f',
        borderTop: '1px solid #2a2040',
        fontSize: '13px',
        alignItems: 'center',
        zIndex: 200,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)',
      }}
      buttonStyle={{
        background: '#D4AF50',
        color: '#0d0d1a',
        fontWeight: 'bold',
        borderRadius: '6px',
        padding: '8px 20px',
        fontSize: '13px',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid #2a2040',
        color: '#c8c8a0',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '13px',
      }}
      contentStyle={{ flex: '1 0 200px', margin: '8px 12px' }}
    >
      Ce site utilise des cookies pour personnaliser votre expérience et afficher des publicités via Google AdSense.{' '}
      <Link href="/politique-de-confidentialite" style={{ color: '#D4AF50', textDecoration: 'underline' }}>
        En savoir plus
      </Link>
    </CookieConsent>
  );
}
