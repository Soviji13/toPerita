import { Outlet } from 'react-router-dom'


// Tiene el fondo y le indica al hijo que debe estar centrado
export function AuthLayout () {
  return (
    <main className='bg-background min-h-screen flex justify-center items-center' >
      <Outlet />
    </main>
  )
}