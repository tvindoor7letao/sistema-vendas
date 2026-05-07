import LandingPage from './landing-page'

// Visitantes não logados veem a landing page.
// Usuários logados são redirecionados pelo middleware (ver middleware.js).
export default function Home() {
  return <LandingPage />
}
