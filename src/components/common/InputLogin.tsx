import { useId } from 'react';

// Hacemos que el input del login también tenga las propiedades de un input de HTML
interface InputProps extends React.InputHTMLAttributes <HTMLInputElement> {
  label: string;
}

export function InputLogin ({label, id, ...props}:InputProps) {

  // Generamos un id por si no añadimos
  const defaultId: string = useId();
  // Si el usuario no introdujo un ID se pone el que hemos generado
  const inputId: string = id || defaultId;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <br />
      <input id={inputId} {...props} className='bg-white text-black'/>
    </div>
  )
}