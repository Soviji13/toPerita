import { supabase } from "../lib/supabaseClient"

export interface PublicUser {
  userName: string;
  role: string;
}

export const userService = {
  // Obtener los datos públicos del usuario ----------------------------
  async getPublicUser (authUserId: string): Promise<PublicUser | null> {

    const { data,  error } = await supabase 
      .from("profiles")
      .select('username, role')
      .eq('id', authUserId as string)
      .single();

    if (error || !data) {
      throw error || new Error("No se ha podido obtener el usuario");
    }

    const publicUser = data ? {
      userName: data.username,
      role: data.role
    } : null

    return publicUser;
  },

  // Obtener todos los ids de las imágenes que ha subido un usuario
  async getImagesId (userId: string): Promise<string[]> {

    const { data, error } = await supabase
      .from('images')
      .select('id')
      .eq('user_id', userId);

    if ( error ) {
      throw error;
    }

    const ids = data.map(item => item.id);

    return ids;
  }
}