import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { SendButton } from "../common/SendButton"
import { useAuthContext } from "../../context/AuthContext";
import { useState } from "react";
import { UploadImgModal } from "../common/UploadImgModal";
import { useMediaContext } from "../../context/MediaContext";

export function AppLayout () { 

  // Variables iniciales necesarias
  const navigate = useNavigate();
  const { logout, userName, role, user } = useAuthContext();

  // Para cerrar sesión
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  }

  // Para abrir modales
  const [addImgModal, setAddImgModal] = useState(false);
  const { pushOnDeleteImage, myImagesId, refreshDeleteImage } = useMediaContext();

  // Gestionar quitar los modales
  const handleCloseImgModal = () => {
    setAddImgModal(false);
    window.location.reload();

  }

  // Calculamos la ruta en la que estemos
  const textButtonAdd = {
    "/gallery": "Añadir imagen",
    "/notes": "Añadir nota",
    "/map": "Añadir nombre a ubicación"
  }

  const textButtonDel = {
    "/gallery": (myImagesId.length > 0 ? "Cancelar elimiación" : "Eliminar imagen"),
    "/notes": "Eliminar nota",
    "/map": "Eliminar nombre a ubicación"
  }

  const location = useLocation();

  // Manejamos evento de botones en función de lo que deba hacer
  function handleAddButton () {
    switch (location.pathname) {
      case "/gallery":
        setAddImgModal(true);
        return;
      case "/notes":
        alert("Vas a añadir una nota");
        return;
      case "/map":
        alert("Vas a añadir un nombre a una ubicación");
        return;
    }
  }

  async function handleDelButton () {
    switch (location.pathname) {
      case "/gallery":
        if (user && myImagesId.length === 0) {
          await pushOnDeleteImage(user.id);
        } else if (user && myImagesId.length > 0) {
          refreshDeleteImage();
        }
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
    <main className='bg-background min-h-screen min-w-screen flex flex-col items-center' >

      {/* Cabecera */}
      <header className="flex w-95/100 justify-between box-border">
        <h1 className="text-7xl">toPeritaBlog</h1>
        <div className="flex space-x-10">
          <SendButton type="button">{userName} - {role}</SendButton>
          <SendButton type="button" onClick={handleLogout}>Cerrar sesión</SendButton>
        </div>
      </header>

      {/* Nav y botón dinámico de añadir */}
      <div className="flex justify-between w-95/100">
        {/* Nav */}
        <nav className="flex space-x-10 mt-4">
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
      {/* Gestionamos modales */}
      <UploadImgModal isOpen={addImgModal} onClose={handleCloseImgModal} />
      <Outlet />
    </main>
  )
}