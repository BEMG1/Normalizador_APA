import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SupportForm from "./SupportForm";
import { useLanguage } from "@/context/AppContext";

export function SupportWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  // Cerrar si se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-2 z-50 flex flex-col items-end gap-4">
      {/* Formulario con animación */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <SupportForm onClose={handleClose} />
      </div>

      {/* Botón flotante con Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleOpen}
            aria-label="Abrir formulario de soporte"
            className={`flex items-center justify-center rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isOpen ? "w-12 h-12" : "w-14 h-14"
            }`}
            style={{
              background: isOpen ? 'var(--surface-3)' : 'var(--accent)',
              color: isOpen ? 'var(--text)' : 'var(--bg)'
            }}
          >
            {isOpen ? (
              <X className="w-6 h-6 animate-in fade-in spin-in-90 duration-200" />
            ) : (
              <MessageCircle className="w-7 h-7 animate-in fade-in zoom-in duration-200" />
            )}
          </button>
        </TooltipTrigger>
        {!isOpen && (
          <TooltipContent side="left" sideOffset={12}>
            <p className="font-medium">{t('supportTitle')}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}
