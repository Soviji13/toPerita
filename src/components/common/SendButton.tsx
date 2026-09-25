interface ButtonProps extends React.ButtonHTMLAttributes <HTMLButtonElement>{};

export function SendButton ({type, children, ...props}: ButtonProps) {
  return (
    <button
      {...props}
      className="bg-auth-button mt-5 text-black" 
      type={type}>{children}
    </button>
  )
}