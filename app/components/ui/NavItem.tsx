interface NavItemProps {
  label: string;
  sectionId?: string;
  onClick?: () => void;
  mobile?: boolean;
}

function scrollToSection(sectionId?: string) {
  if (!sectionId) return;
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function NavItem({
  label,
  sectionId,
  onClick,
  mobile = false,
}: NavItemProps) {
  function handleClick() {
    scrollToSection(sectionId);
    onClick?.();
  }

  if (mobile) {
    return (
      <li>
        <button
          className="w-full text-right text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none py-2 text-sm"
          onClick={handleClick}
        >
          {label}
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none text-sm"
        onClick={handleClick}
      >
        {label}
      </button>
    </li>
  );
}
