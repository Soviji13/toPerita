import { useEffect, useState } from "react";
import { galleryService } from "../../services/gallery.service"

interface ImageInterface {
  title: string,
  created_at: string | null,
  id: string,
  signedUrl: string,
  cloudinary_id: string
}

// Para que no se recarguen constantemente
let galleryMemoryCache: ImageInterface[] | null = [];

export function useGallery () {

  const [allImages, setAllImages] = useState<ImageInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener las imagenes
  const getImages = async () => {

    // Si no hay guardadas en la caché
    if (!galleryMemoryCache || galleryMemoryCache.length === 0) {
      console.log("Se están firmando las imágenes y obteniéndose de la BBDD")
      try {
        // Se la solicitamos al service
        const images = await galleryService.getAll();

        // Si todo va bien
        if (images && images.length > 0) {

          // Recorremos cada una
          const imagesWithUrls = await Promise.all(

            // Recorremos cada imagen
            images.map (async (img) => {

              // Intentamos obtener el url firmado
              try {
                const signedUrl = await galleryService.getSignedImageUrl(img.cloudinary_public_id);

                if (!signedUrl) {
                  throw new Error("No se recibió la URL firmada");
                }

                return {
                  id: img.id,
                  title: img.title,
                  created_at: img.created_at,
                  signedUrl: signedUrl,
                  cloudinary_id: img.cloudinary_public_id
                }
              } catch (err: any) {
                console.error("Error en la firma");
                throw error;
              }  
            })
          );

          galleryMemoryCache = imagesWithUrls;
          setAllImages(imagesWithUrls);
        } 
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar la galería");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Se están cargando las imágenes del caché");
      setAllImages(galleryMemoryCache);
      setLoading(false);
    }
  }

  const removeCache = () => {
    if (galleryMemoryCache && galleryMemoryCache.length > 0) {
      galleryMemoryCache = [];
    }
  }
  
  useEffect (() => {
    getImages();
  }, []);

  return { error, loading, allImages, getImages, removeCache};
}