import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import { userService } from "../services/user.service";

// Podemos saber en cualquier momento cuáles son nuestras imágenes y notas (para eliminar)
interface MediaContextType {
  myImagesId: string[];
  refreshDeleteImage: () => void;
  pushOnDeleteImage: (userId: string) => Promise<void>;
  loading: boolean;
  error: null | string;
}

const MediaContext = createContext<MediaContextType>({
  myImagesId: [],
  pushOnDeleteImage: async () => {},
  refreshDeleteImage: () => {},
  loading: false,
  error: null
})

export function MediaProvider({ children }: { children: ReactNode }) {
  const [myImagesId, setMyImagesId] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pushOnDeleteImage = async (userId: string) => {
    // Primero debemos esperar a que se seleccionen solo las fotos de ese usuario
    setLoading(true);
    setError(null);

    try {
      const imagesId = await userService.getImagesId(userId);
      setMyImagesId(imagesId);
    } catch (error) {
        setError("No se han podido obtener tus imágenes");
    } finally {
      setLoading(false);
    }
  }

  const refreshDeleteImage = () => {
    setMyImagesId([],)
  }

  return (
    <MediaContext.Provider value={{myImagesId, pushOnDeleteImage, loading, error, refreshDeleteImage}}>
      {children}
    </MediaContext.Provider>
  )
}

export function useMediaContext() {
  return useContext(MediaContext);
}