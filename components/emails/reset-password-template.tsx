import * as React from 'react';

interface ResetPasswordTemplateProps {
  resetLink: string;
}

export const ResetPasswordTemplate: React.FC<Readonly<ResetPasswordTemplateProps>> = ({
  resetLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '20px' }}>
    <h1 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Alive Mansion</h1>
    <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
      Someone has requested to reset the password for your account.
    </p>
    <a href={resetLink} style={{ backgroundColor: '#000', color: '#fff', padding: '15px 30px', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', display: 'inline-block' }}>
      Reset Password
    </a>
    <p style={{ color: '#aaa', fontSize: '10px', marginTop: '30px' }}>
      If you didn't request this, please ignore this email. This link is valid for 1 hour.
    </p>
  </div>
);