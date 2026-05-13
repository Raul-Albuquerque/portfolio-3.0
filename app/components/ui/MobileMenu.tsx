import NavItem from "./NavItem";
import LanguageSwitch from "./LanguageSwitch";

export interface NavItemDef {
  label: string;
  sectionId?: string;
}

interface MobileMenuProps {
  items: NavItemDef[];
  onClose: () => void;
}

export default function MobileMenu({ items, onClose }: MobileMenuProps) {
  return (
    <div className="md:hidden border-t border-(--color-header-border) px-4 sm:px-6 pb-4">
      <ul className="flex flex-col gap-1 pt-3">
        {items.map((item) => (
          <NavItem key={item.label} label={item.label} sectionId={item.sectionId} onClick={onClose} mobile />
        ))}
      </ul>
      <div className="pt-3 border-t border-(--color-header-border) flex justify-end mt-2">
        <LanguageSwitch />
      </div>
    </div>
  );
}
