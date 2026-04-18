import React, { useState, useEffect } from 'react';

interface WhatsAppSupportProps {
  phoneNumber?: string;
  message?: string;
}

interface QuickQuestion {
  id: string;
  text: string;
  message: string;
  icon: React.ReactNode;
}

const quickQuestions: QuickQuestion[] = [
  {
    id: 'order-status',
    text: 'Track My Order',
    message: 'Hi! I would like to check the status of my order.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'shipping',
    text: 'Shipping Info',
    message: 'Hi! I need information about shipping and delivery options.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: 'product',
    text: 'Product Question',
    message: 'Hi! I have a question about a product.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'return',
    text: 'Returns & Refunds',
    message: 'Hi! I need help with a return or refund request.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  {
    id: 'payment',
    text: 'Payment Issue',
    message: 'Hi! I\'m having trouble with payment or need payment information.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: 'general',
    text: 'General Inquiry',
    message: 'Hello! I need help with TouchMunyun.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const WhatsAppSupport: React.FC<WhatsAppSupportProps> = ({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+15042486331',
  message = 'Hello! I need help with TouchMunyun Support.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Format phone number for WhatsApp (remove any non-numeric characters except +)
  const formattedPhone = phoneNumber.replace(/[^\d+]/g, '');

  const openWhatsApp = (customMessage?: string) => {
    const messageToSend = customMessage || message;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageToSend)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleQuestionClick = (question: QuickQuestion) => {
    setSelectedQuestion(question.id);
    setTimeout(() => {
      openWhatsApp(question.message);
      setSelectedQuestion(null);
    }, 300);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.whatsapp-popup') && !target.closest('.whatsapp-button')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-4 sm:left-6 z-50 group whatsapp-button"
        aria-label="Contact TouchMunyun Support on WhatsApp"
      >
        <div className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-2xl hover:shadow-[#25D366]/50 px-4 py-3 transform hover:scale-105 transition-all duration-300 animate-pulse-glow">
          {/* WhatsApp Icon */}
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          
          {/* Text Label */}
          <span className="font-semibold text-sm sm:text-base whitespace-nowrap hidden sm:block">
            TouchMunyun Support
          </span>
          
          {/* Arrow Icon */}
          <svg
            className={`w-4 h-4 flex-shrink-0 hidden sm:block transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      {/* Interactive Popup */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 whatsapp-popup animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-glass-lg border-2 border-gray-800/50 w-80 sm:w-96 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#25D366]/90 to-[#20BA5A]/90 backdrop-blur-md p-4 flex items-center justify-between border-b border-[#25D366]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-glass">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">WhatsApp Support</h3>
                  <p className="text-xs text-white/80">We&apos;re online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Quick Questions */}
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-300 mb-3">Quick Questions:</p>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {quickQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionClick(question)}
                    className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedQuestion === question.id
                        ? 'bg-[#25D366]/20 border-[#25D366]/50 scale-95'
                        : 'bg-gray-800/60 backdrop-blur-sm border-gray-700/50 hover:border-[#25D366]/50 hover:bg-[#25D366]/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedQuestion === question.id
                        ? 'bg-[#25D366]/30 text-[#25D366]'
                        : 'bg-gray-700/50 text-gray-400 group-hover:bg-[#25D366]/20 group-hover:text-[#25D366]'
                    }`}>
                      {question.icon}
                    </div>
                    <span className={`font-medium text-sm transition-colors ${
                      selectedQuestion === question.id
                        ? 'text-[#25D366]'
                        : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {question.text}
                    </span>
                    <svg
                      className={`w-4 h-4 ml-auto transition-transform ${
                        selectedQuestion === question.id
                          ? 'text-[#25D366] rotate-90'
                          : 'text-gray-500 group-hover:text-[#25D366] group-hover:translate-x-1'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Direct Chat Button */}
              <button
                onClick={() => openWhatsApp()}
                className="w-full bg-gradient-to-r from-[#25D366] to-[#20BA5A] text-white font-semibold py-3 px-4 rounded-xl hover:from-[#20BA5A] hover:to-[#1DA851] transform hover:scale-[1.02] transition-all duration-200 shadow-glass-lg hover:shadow-lg border border-[#25D366]/30 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

