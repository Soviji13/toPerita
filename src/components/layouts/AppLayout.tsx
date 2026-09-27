import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { SendButton } from "../common/SendButton"
import { useAuthContext } from "../../context/AuthContext";
import { useEffect } from "react";

export function AppLayout () { 

  // Para cerrar sesión
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  }

  // Calculamos la ruta en la que estemos
  const textButtonAdd = {
    "/gallery": "Añadir imagen",
    "/notes": "Añadir nota",
    "/map": "Añadir nombre a ubicación"
  }

  const textButtonDel = {
    "/gallery": "Eliminar imagen",
    "/notes": "Eliminar nota",
    "/map": "Eliminar nombre a ubicación"
  }

  const location = useLocation();

  // Manejamos evento de botones en función de lo que deba hacer
  function handleAddButton () {
    switch (location.pathname) {
      case "/gallery":
        alert("Vas a añadir una foto");
        return;
      case "/notes":
        alert("Vas a añadir una nota");
        return;
      case "/map":
        alert("Vas a añadir un nombre a una ubicación");
        return;
    }
  }

  function handleDelButton () {
    switch (location.pathname) {
      case "/gallery":
        alert("Vas a eliminar una foto");
        return;
      case "/notes":
        alert("Vas a eliminar una nota");
        return;
      case "/map":
        alert("Vas a eliminar un nombre a una ubicación");
        return;
    }
  }

  return (
    <main className='bg-background min-h-screen' >

      {/* Cabecera */}
      <header className="flex min-w-screen justify-between box-border p-5">
        <h1 className="text-7xl">toPeritaBlog</h1>
        <div className="flex space-x-10">
          <SendButton type="button">Mi Usuario</SendButton>
          <SendButton type="button" onClick={handleLogout}>Cerrar sesión</SendButton>
        </div>
      </header>

      {/* Nav y botón dinámico de añadir */}
      <div className="flex min-w-screen justify-between">
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
        {/* Botones dinámicos de añadir y eliminar*/}
        <div className="space-x-4">
          <SendButton type="button" onClick={handleAddButton}>
            {textButtonAdd[location.pathname as keyof typeof textButtonAdd]}
          </SendButton>
          <SendButton type="button" onClick={handleDelButton}>
            {textButtonDel[location.pathname as keyof typeof textButtonDel]}
          </SendButton>
        </div>
      </div>
      <Outlet />
    </main>
  )
}