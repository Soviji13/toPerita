import { supabase } from "../lib/supabaseClient";

export const galleryService = {

  // Obtener el URL firmado de la imagen
  async getSignedImageUrl (publicId: string): Promise<String> {

    const { data, error} = await supabase.functions.invoke('sign-image', {
      body: {publicId},
    });

    if (error) {
      throw error;
    }

    return data.signedUrl;
  },

  // Obtener las imágenes
  async getAll () {
    const { data, error } = await  supabase
    .from('images')
    .select('id, title, cloudinary_public_id, created_at')
    .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? {};
  }
}