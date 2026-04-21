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
          className="bg-linear-to-r from-[#0061FF] to-[#60EFFF] px-6 py-3 rounded-lg text-white font-regular"
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
