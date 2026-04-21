interface NavItemProps {
  label: string;
  onClick?: () => void;
  mobile?: boolean;
}

export default function NavItem({
  label,
  onClick,
  mobile = false,
}: NavItemProps) {
  if (mobile) {
    return (
      <li>
        <button
          className="w-full text-right text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none py-2 text-sm"
          onClick={onClick}
        >
          {label}
        </button>
      </li>
    );
  }

  return (
    <li>
      <button className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none text-sm">
        {label}
      </button>
    </li>
  );
}
