import { NavLink } from "react-router-dom"

import { Outlet } from "react-router-dom"
import { SendButton } from "../common/SendButton"

export function AppLayout () { 
  return (
    <main className='bg-background min-h-screen' >

      {/* Cabecera */}
      <header className="flex min-w-screen justify-between box-border p-5">
        <h1 className="text-7xl">toPeritaBlog</h1>
        <div className="flex space-x-10">
          <SendButton type="button">Mi Usuario</SendButton>
          <SendButton type="button">Cerrar sesión</SendButton>
        </div>
      </header>

      {/* Nav */}
      <nav className="flex space-x-10 mt-4 ml-5">
        <NavLink
          to="/gallery"
        >
          Galería
        </NavLink>
        <NavLink
          to="/notes"
        >
          Notas
        </NavLink>
        <NavLink
          to="/map"
        >
          Mapa
        </NavLink>
      </nav>
      <Outlet />
    </main>
  )
}