import * as React from 'react';

interface VerificationTemplateProps {
  confirmLink: string;
}

export const VerificationTemplate: React.FC<Readonly<VerificationTemplateProps>> = ({
  confirmLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '20px' }}>
    <h1 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Alive Mansion</h1>
    <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
      Thank you for registering. Please confirm your email address to activate your account.
    </p>
    <a href={confirmLink} style={{ backgroundColor: '#000', color: '#fff', padding: '15px 30px', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', display: 'inline-block' }}>
      Verify Email
    </a>
    <p style={{ color: '#aaa', fontSize: '10px', marginTop: '30px' }}>
      If you didn't request this, please ignore this email.
    </p>
  </div>
);