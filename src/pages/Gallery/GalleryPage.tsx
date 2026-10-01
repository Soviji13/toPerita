import { ImagePreview } from "../../components/common/ImagePreview";
import { SendButton } from "../../components/common/SendButton";
import { useMediaContext } from "../../context/MediaContext";
import { useDeleteImage } from "../../hooks/gallery/useDeleteImage";
import { useGallery } from "../../hooks/gallery/useGallery"

export  function GalleryPage () {

  // Obtenemos para empezar todas las imágenes y el estado
  const { error, loading, allImages, removeCache } = useGallery();

  // Obtenemos para si el usuario quiere eliminar imágenes
  const {loading: loadingImagesToDelete, error: errorImagesToDelete, myImagesId } = useMediaContext();

  // Obtenemos el loading y el error de eliminar una imagen concreta
  const { loadingDelete, error: errorDelete, deleteImage } = useDeleteImage();

  // Comprobaciones iniciales
  if (loading) {
    return(<p>Cargando imágenes...</p>)
  } else if (error || errorImagesToDelete || errorDelete ) {
    return (<p>{error || errorImagesToDelete || errorDelete}</p>)
  } else if (loadingImagesToDelete) {
    return (<p>Cargando tus imágenes...</p>)
  } else if (allImages.length === 0){
    return (
      <p>Aún no hay imágenes, añade imágenes</p>
    )
  } else if (loadingDelete) {
    return (<p>Eliminando imagen...</p>)
  } else {
    return (
      <>
      <p>Número de imágenes: {allImages.length}</p>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 w-95/100">
        {allImages.map((img) => (
          <div key={img.id} className="flex justify-center ">
            <div className="flex flex-col">
              <ImagePreview src={img.signedUrl} title={img.title} alt={img.title} />
              {myImagesId.length > 0 && <SendButton 
                type='button' 
                onClick={async () => {
                  await deleteImage(img.id, img.cloudinary_id); 
                  removeCache();
                  window.location.reload();
                }}
              >
                Eliminar imagen
              </SendButton>}
            </div>
          </div>
        ))}
      </div>
      </>
    )
  }
}