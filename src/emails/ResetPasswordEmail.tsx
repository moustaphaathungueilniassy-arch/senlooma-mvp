import * as React from 'react';
import { Html, Body, Head, Heading, Container, Text, Button } from '@react-email/components';

interface ResetPasswordEmailProps {
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ resetLink }) => (
  <Html>
    <Head />
    <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
      <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <Heading style={{ color: '#2D6A4F', fontSize: '24px', marginBottom: '20px' }}>SAMA-DARAAL</Heading>
        <Text style={{ fontSize: '16px', color: '#333333' }}>Bonjour,</Text>
        <Text style={{ fontSize: '16px', color: '#333333', lineHeight: '1.5' }}>
          Vous avez demandé la réinitialisation de votre mot de passe sur SAMA-DARAAL.
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
        </Text>
        <Button
          href={resetLink}
          style={{
            backgroundColor: '#2D6A4F',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            display: 'inline-block',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          Réinitialiser mon mot de passe
        </Button>
        <Text style={{ fontSize: '14px', color: '#666666' }}>
          Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité. 
          Ce lien expirera dans 1 heure.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;
