import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/AppContext";

// Tiempo de espera entre envíos en milisegundos (ej: 3 minutos)
const SPAM_DELAY_MS = 3 * 60 * 1000;

interface SupportFormProps {
  onClose: () => void;
}

export default function SupportForm({ onClose }: SupportFormProps) {
  const { t } = useLanguage();

  const requestTypes = [
    t('supportReqBug'),
    t('supportReqSupport'),
    t('supportReqSuggestion'),
    t('supportReqFeature'),
    t('supportReqGeneral'),
    t('supportReqOther'),
  ];

  const [requestType, setRequestType] = useState<string>(t('supportReqSuggestion'));
  const [message, setMessage] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Verificar mecanismo anti-spam al cargar el componente
  useEffect(() => {
    checkSpamDelay();
    const interval = setInterval(checkSpamDelay, 10000); // Verificar cada 10s
    return () => clearInterval(interval);
  }, []);

  const checkSpamDelay = () => {
    const lastSentStr = localStorage.getItem("lastFeedbackSent");
    if (lastSentStr) {
      const lastSentTime = parseInt(lastSentStr, 10);
      const timePassed = Date.now() - lastSentTime;
      if (timePassed < SPAM_DELAY_MS) {
        setTimeRemaining(Math.ceil((SPAM_DELAY_MS - timePassed) / 1000 / 60));
      } else {
        setTimeRemaining(null);
      }
    } else {
      setTimeRemaining(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    if (timeRemaining !== null) {
      setErrorMessage(t('supportSpamWarning').replace('{0}', timeRemaining.toString()));
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Se leen las variables de entorno inyectadas por Vite
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "Default"; 
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      const templateParams = {
        title: requestType,
        message: message,
      };

      if (SERVICE_ID === "Default"){
        setStatus("error");
        setErrorMessage(t('supportError'));
      } else {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);      
      }

      localStorage.setItem("lastFeedbackSent", Date.now().toString());
      setStatus("success");
      
      // Cerrar automáticamente después de mostrar el mensaje de éxito
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setMessage("");
      }, 3000);
      
    } catch (error) {
      console.error("Error sending feedback:", error);
      setStatus("error");
      setErrorMessage(t('supportError'));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-80 sm:w-96 overflow-hidden flex flex-col">
      <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-medium text-sm">{t('supportTitle')}</h3>
      </div>

      <div className="p-4">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h4 className="text-gray-900 dark:text-gray-100 font-medium mb-1">{t('supportSuccessTitle')}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('supportSuccessMsg')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Aviso de Spam */}
            {timeRemaining !== null && status !== "error" && (
              <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 p-3 rounded-md text-xs flex gap-2 items-start border border-amber-200 dark:border-amber-900/50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  {t('supportSpamWarning').replace('{0}', timeRemaining.toString())}
                </p>
              </div>
            )}

            {/* Error message */}
            {status === "error" && errorMessage && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-xs flex gap-2 items-start border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="requestType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('supportType')}
              </label>
              <select
                id="requestType"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50"
                disabled={status === "loading" || timeRemaining !== null}
              >
                {requestTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('supportDescription')}
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('supportDescriptionPlaceholder')}
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none disabled:opacity-50"
                disabled={status === "loading" || timeRemaining !== null}
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                disabled={status === "loading"}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={status === "loading" || timeRemaining !== null || !message.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('supportSending')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('supportSend')}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
