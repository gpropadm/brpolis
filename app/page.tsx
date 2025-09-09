import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona automaticamente para o login
  redirect('/login');
}