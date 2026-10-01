import { useState } from "react";
import { SendButton } from "./SendButton";
import { InputLogin } from "./InputLogin";
import { useAddImage } from "../../hooks/gallery/useAddImage";

interface UploadImgModalProps {
  isOpen: boolean,
  onClose: () => void
}

export function UploadImgModal ({isOpen, onClose}: UploadImgModalProps) {

  // Almacena una URL temporal para ver la foto
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Controla si se está arrastrando algo
  const [onDrag, setOnDrag] = useState(false);

  // Controla el título
  const [title, setTitle] = useState<string>("");

  // Obtenemos el file
  const [file, setFile] = useState<File | null>(null);

  // Obtenemos lo que nos devuelve el hook
  const {error, loading, uploadImage} = useAddImage();

  if (!isOpen) return null;

  // Controla el upload de la imagen
  const uploadHandler = async () => {
    if (file) {
      await uploadImage(file, title);
    }
  }

  // Controla cuando se suelta o se envía la imagen
  const handleDropImgDiv = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOnDrag(false);

    // Obtenemos el fichero soltado
    const droppedFile = e.dataTransfer.files?.[0];

    // Le asignamos una URL temporal
    if (droppedFile) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  }

  const handleDropImgInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnDrag(false);

    // Obtenemos el fichero soltado
    const droppedFile = e.target.files?.[0];
    if (!droppedFile) return;

    // Le asignamos una URL temporal
    if (droppedFile) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  }

  return (
    <div className="bg-gray-400/50 min-w-screen min-h-screen flex align-middle justify-center">
      <div className="bg-white box-border p-5 flex items-center justify-center flex-col">
        {!loading ? (
          <>
          <p>Sube una imagen:</p>
          <br />
          {/* Contenedor de la imagen, gestiona el arrastre */}
          <div 
            className="border-3 w-3/4 h-3/5 border-amber-950 rounded-2xl border-dashed flex justify-center align-baseline"
            onDragOver={(e) => {
              e.preventDefault();
              setOnDrag(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setOnDrag(false);
            }}
            onDrop={handleDropImgDiv}
          >
            {/* Si ya hay una imagen */}
            {previewUrl ? (
              <>
              {/* Solicitamos el título */}
              <InputLogin 
                type="text" 
                value={title} 
                onChange={(e) => {setTitle(e.target.value)}}
                label="Añade un título"
                id="img_title"
              />
              {/* Mostramos cómo se vería la imagen */}
              <img width="300px" src={previewUrl} alt="Preview de la imagen" />
              </>
            ) : (
              <>
              <div>
                <p>Arrastra una foto aquí o pulsa en añadir</p>
                <br />
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleDropImgInput}
                />
              </div>
              </>
            )}
          </div>
          {error && <p>{error}</p>}
          {/* Boton para aceptar los cambios */}
          <SendButton 
            type="submit" 
            onClick={(e) => {e.preventDefault(); uploadHandler()}} 
            disabled={(onDrag || !previewUrl || !title.trim() || !file) ? true : false}
          >
            Subir
          </SendButton>
          <SendButton type="button" onClick={onClose}>Salir</SendButton>
          </>
        ) : (
          <p>Cargando imagen...</p>
        )}
      </div>
    </div>
  )
}