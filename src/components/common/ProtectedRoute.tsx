import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export function ProtectedRoute() {

  // Obtenemos la sesión inicial y si aún se está cargando
  const { session, loading } = useAuthContext();

  // Mientras Supabase verifica el token en localStorage, mostramos un estado neutro
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // Si no hay sesión válida devuelta por el motor de autenticación, redirige al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Si la sesión existe, renderiza las pantallas hijas
  return <Outlet />;
}