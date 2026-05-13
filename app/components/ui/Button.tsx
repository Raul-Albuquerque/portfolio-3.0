interface ButtonProps {
  text: string;
  onClick: () => void;
  theme: string;
}

function Button({ text, onClick, theme }: ButtonProps) {
  return (
    <>
      {theme === "hero" ? (
        <button
          className="bg-linear-to-r from-[#0061FF] to-[#60EFFF] px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-white font-regular text-sm sm:text-base"
          onClick={onClick}
        >
          {text}
        </button>
      ) : (
        <button onClick={onClick}>{text}</button>
      )}
    </>
  );
}

export default Button;
