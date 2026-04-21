import NavItem from "./NavItem";
import LanguageSwitch from "./LanguageSwitch";

interface MobileMenuProps {
  items: string[];
  onClose: () => void;
}

export default function MobileMenu({ items, onClose }: MobileMenuProps) {
  return (
    <div className="md:hidden border-t border-(--color-header-border) px-4 pb-4">
      <ul className="flex flex-col gap-1 pt-3">
        {items.map((item) => (
          <NavItem key={item} label={item} onClick={onClose} mobile />
        ))}
      </ul>
      <div className="pt-3 border-t border-(--color-header-border) flex justify-end mt-2">
        <LanguageSwitch />
      </div>
    </div>
  );
}
