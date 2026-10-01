import { useState } from "react"

interface ImageProps extends React.ImgHTMLAttributes <HTMLImageElement>{
  title: string
};

export function ImagePreview ({src, alt, title, ...props}: ImageProps) {

  const [showHover, setShowHover] = useState(false);

  return (
    <div>
      <div 
        className="w-40 h-40 overflow-hidden border-2 border-white"
        onMouseEnter={() => {setShowHover(true)}}
        onMouseLeave={() => {setShowHover(false)}}
      >
        <img 
          src={src} 
          alt={alt} 
          className="object-cover h-full w-full" 
          {...props}
        />
      </div>
      <p className={ !showHover ? "text-transparent" : "text-black" } >{title}</p>
    </div>
    
  )
}