import { useEffect } from "react";
import { useGallery } from "../../hooks/gallery/useGallery"

export  function GalleryPage () {

  // Obtenemos para empezar todas las imágenes y el estado
  const { error, loading, allImages} = useGallery();

  // Comprobaciones iniciales
  if (loading) {
    return(<p>Cargando imágenes...</p>)
  } else if (error) {
    return (<p>{error}</p>)
  } else if (allImages.length === 0){
    return (
      <p>Aún no hay imágenes, añade imágenes</p>
    )
  } else {
    return (
      <>
      <p>Número de imágenes: {allImages.length}</p>
      </>
    )
  }
}