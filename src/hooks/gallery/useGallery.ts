import { useEffect, useState } from "react";
import { galleryService } from "../../services/gallery.service"
import { supabase } from "../../lib/supabaseClient";

interface ImageInterface {
  title: string,
  created_at: string | null,
  id: string,
  signedUrl: string
}

export function useGallery () {

  const [allImages, setAllImages] = useState<ImageInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)

  // Obtener las imagenes
  const getImages = async () => {
    try {
      // Se la solicitamos al service
      const images = await galleryService.getAll();

      // Si todo va bien
      if (images && images.length > 0) {

        // Recorremos cada una
        const imagesWithUrls = await Promise.all(

          // Recorremos cada imagen
          images.map (async (img) => {

            const { data, error } = await supabase.functions.invoke ("sign-image", {
              body: { publicId: img.cloudinary_public_id },
            });

            if (error) throw error;

            return {
              id: img.id,
              title: img.title,
              created_at: img.created_at,
              signedUrl: data.signedUrl
            }
          })
        );

        setAllImages(imagesWithUrls);
      } 
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar la galería");
    } finally {
      setLoading(false);
    }
  }
  
  useEffect (() => {
    getImages();
  }, []);

  return { error, loading, allImages, getImages};
}