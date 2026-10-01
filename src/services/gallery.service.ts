import { uploadImageToCloudinary } from "../lib/cloudinary";
import { supabase } from "../lib/supabaseClient";

export interface CreateImagePayload {
  file: File,
  titleBD: string,
}

export const galleryService = {

  // Obtener el URL firmado de la imagen -----------------------------------------------------
  async getSignedImageUrl (publicId: string): Promise<string> {

    const { data, error} = await supabase.functions.invoke('sign-image', {
      body: {publicId},
    });

    if (error || !data) {
      throw error;
    }

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const signedUrl = parsedData?.signedUrl;

    return signedUrl;
  },

  // Obtener las imágenes ---------------------------------------------------------
  async getAll () {
    const { data, error } = await  supabase
    .from('images')
    .select('id, title, cloudinary_public_id, created_at')
    .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? {};
  },

  // Añadir foto ----------------------------------------------------------------------------------
  async uploadAndSave ({ file, titleBD }: CreateImagePayload) {
    const {data: {user}, error: userError} = await supabase.auth.getUser();

    if (!user || userError) {
      throw new Error("No se ha podido obtener el usuario");
    }

    // Subimos la imagen a cloudinary
    const cloudinaryData = await uploadImageToCloudinary(file);

    // Guardamos en supabase los datos de la imagen
    const { data, error } = await supabase
    .from('images')
    .insert({
      title: titleBD,
      user_id: user.id,
      cloudinary_public_id: cloudinaryData.public_id,
    })
    .select()
    .single();

    // Evitamos huérfanos en cloudinary 
    if (error || !data) {
      console.error("No se ha podido guardar la imagen en la bd, eliminando de Cloudinary...");
      await supabase.functions.invoke("delete-image", {
        body: { publicId: cloudinaryData.public_id }
      })
      throw new Error("No se pudo registrar la imagen en la base de datos. Subida cancelada.");
    }

    return data;
  },

  // Eliminar foto ---------------------------------------------------------------------
  async delete (imageId: string, cloudinaryId: string): Promise<void> {

    if (!cloudinaryId) {
      throw new Error("El id de Cloudinary no está definido");
    }

    // Intentamos eliminarla de cloudinary
    const { data, error } = await supabase.functions.invoke('delete-image', {
      body: {publicId: cloudinaryId}
    })

    if (error || !data?.success) {
      throw error || new Error("Error al eliminar imagen en Cloudinary");
    }

    // Eliminamos de Supabase
    const {error: errorDb } = await supabase
      .from("images")
      .delete()
      .eq('id', imageId)

    if (errorDb) {
      throw error;
    }
  }
}