import { useState } from "react";
import { galleryService } from "../../services/gallery.service"

// En un futuro manejaremos también la subida de multimedia

export function useAddImage () {

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)

  // Subir la imagen
  const uploadImage = async (file: File, title: string) => {

    const titleBD = title.trim();

    // Manejo de errores
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

    if (!file) {
      setError("No se ha subido ningún archivo");
      return;
    } else if (!titleBD) {
      setError("No se ha asignado ningún título a la imagen");
      return;
    } else if (titleBD.length > 100) {
      setError("El título no puede superar los 100 caracteres");
      return;
    } else if (!allowedTypes.includes(file.type)) {
      setError("Solo se admiten imágenes válidas (JPG, PNG, WEBP, AVIF)");
      return;
    } else if (file.size > 20 * 1024 * 1024) {
      setError("Límite de tamaño en la imagen excedido");
      return;
    }

    try {
      setLoading(true)
      setError(null);
      // Se la solicitamos al service
      await galleryService.uploadAndSave({file, titleBD});
    } 
    catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar la galería");
    } finally {
      setLoading(false);
    }
  }

  return { error, loading, uploadImage };
}