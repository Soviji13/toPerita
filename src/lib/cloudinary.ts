import { supabase } from "./supabaseClient";

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
}

export async function uploadImageToCloudinary(file: File) {
  // 1. AQUÍ se llama a la Edge Function para pedir permiso y la firma criptográfica:
  const { data: signData, error: signError } = await supabase.functions.invoke('sign-upload');

  if (signError || !signData) {
    throw new Error('No se pudo autorizar la subida en el servidor');
  }

  // La Edge Function te devuelve estos datos calculados con tu secreto:
  const { 
    signature, 
    timestamp, 
    apiKey, 
    cloudName, 
    folder, 
    type,
    allowedFormats
  } = signData;

  // 2. Ahora sí construyes el body con la firma que Cloudinary exige:
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  formData.append('type', type);
  formData.append('allowed_formats', allowedFormats);

  // 3. Envías el archivo a Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error (errorData.error?.message || 'Error al subir la imagen a Cloudinary')
  }

  const data = await response.json();
  return {
    public_id: data.public_id, // Solo nos quedamos con el public_id
  };
}