import { useState } from "react";
import { galleryService } from "../../services/gallery.service";
export function useDeleteImage () {

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = async (imageId: string, cloudinaryId: string) => {

    // Ahora sí podemos seleccionar la imagen que queramos
    setLoadingDelete(true);

    try {
      await galleryService.delete(imageId, cloudinaryId);
    } catch (err: any) {
      console.error ("Error al eliminar:", err);
      setError (err.message || "Error al eliminar la imagen");
      throw err;
    } finally {
      setLoadingDelete(false);
    };
  }

  return { deleteImage, loadingDelete, error };
}