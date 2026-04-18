import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  questions: Array<{
    question: string;
    answer: string;
    keywords?: string[];
  }>;
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    name: 'Orders & Tracking',
    icon: '📦',
    questions: [
      {
        question: 'How can I track my order?',
        answer: 'You can track your orders by logging into your account and visiting the "My Orders" page. You\'ll receive tracking updates via email and WhatsApp when your order status changes. You can also use the order code to track your order.',
        keywords: ['track', 'tracking', 'order status', 'where is my order', 'order update']
      },
      {
        question: 'How long does it take to process an order?',
        answer: 'Orders are typically processed within 1-2 business days. Once processed, you\'ll receive a confirmation email with tracking information.',
        keywords: ['process', 'processing time', 'how long', 'order processing']
      },
      {
        question: 'Can I cancel my order?',
        answer: 'Yes! You can cancel orders that are in "Pending" or "Paid" status. Simply go to your order details page and click "Cancel Order". Please note: If you cancel more than 5 orders, you may be temporarily blocked from placing new orders.',
        keywords: ['cancel', 'cancellation', 'cancel order', 'refund']
      },
      {
        question: 'What is an order code?',
        answer: 'An order code is a unique identifier for your order (e.g., ORD-12345). You can use it to track your order status and reference it when contacting support.',
        keywords: ['order code', 'order number', 'order id', 'reference']
      }
    ]
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    icon: '🚚',
    questions: [
      {
        question: 'What are your shipping options?',
        answer: 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Shipping costs are calculated at checkout based on your location and selected shipping method.',
        keywords: ['shipping', 'delivery', 'shipping options', 'delivery time', 'shipping cost']
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we ship within the country. For international shipping inquiries, please contact our support team at TouchMunyunLLC@gmail.com.',
        keywords: ['international', 'overseas', 'abroad', 'country']
      },
      {
        question: 'How can I change my shipping address?',
        answer: 'You can update your shipping address in your account settings or during checkout. For orders already placed, please contact support immediately if the order hasn\'t been shipped yet.',
        keywords: ['change address', 'update address', 'shipping address', 'delivery address']
      },
      {
        question: 'What happens if my package is lost?',
        answer: 'If your package is lost in transit, please contact our support team with your order code. We\'ll investigate and either reship your order or provide a full refund.',
        keywords: ['lost package', 'missing', 'not received', 'package lost']
      }
    ]
  },
  {
    id: 'returns',
    name: 'Returns & Refunds',
    icon: '↩️',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for unused items in original packaging with tags attached. Items must be in their original condition. You can initiate a return from your Orders page.',
        keywords: ['return', 'return policy', 'refund', 'return item', '30 days']
      },
      {
        question: 'How do I return an item?',
        answer: 'Go to your "My Orders" page, select the order you want to return, and click "Return Item". Follow the instructions to complete your return request. You\'ll receive a return label and instructions via email.',
        keywords: ['how to return', 'return process', 'return request', 'initiate return']
      },
      {
        question: 'How long does a refund take?',
        answer: 'Once we receive and inspect your returned item, refunds are processed within 5-7 business days. The refund will be credited to your original payment method.',
        keywords: ['refund time', 'refund processing', 'when will I get refund', 'refund duration']
      },
      {
        question: 'Can I exchange an item?',
        answer: 'Yes! You can request an exchange by initiating a return and selecting "Exchange" as the reason. Our support team will guide you through the process.',
        keywords: ['exchange', 'swap', 'change item', 'different size']
      }
    ]
  },
  {
    id: 'products',
    name: 'Products & Catalog',
    icon: '🛍️',
    questions: [
      {
        question: 'How do I search for products?',
        answer: 'Use the search bar in the navigation menu to search by product name, category, or keywords. You can also browse by category on our Products page and use filters to narrow down your search.',
        keywords: ['search', 'find product', 'browse', 'catalog', 'products']
      },
      {
        question: 'What are "New Arrivals" and "Best Sellers"?',
        answer: '"New Arrivals" shows our latest products added to the store. "Best Sellers" displays our most popular items based on sales. Both sections are updated regularly.',
        keywords: ['new arrivals', 'best sellers', 'popular', 'latest', 'trending']
      },
      {
        question: 'Are products in stock?',
        answer: 'Product availability is shown on each product page. If an item is out of stock, you\'ll see a notification. We restock regularly, so check back soon!',
        keywords: ['stock', 'availability', 'in stock', 'out of stock', 'quantity']
      },
      {
        question: 'What is the maximum quantity I can order?',
        answer: 'You can order up to 10 units of each product per order. This limit helps ensure fair distribution and availability for all customers.',
        keywords: ['quantity', 'max quantity', 'limit', 'how many', 'maximum']
      }
    ]
  },
  {
    id: 'payments',
    name: 'Payments & Coupons',
    icon: '💳',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and Google Pay — all processed securely through Stripe.',
        keywords: ['payment', 'payment method', 'how to pay', 'credit card', 'cod', 'cash on delivery']
      },
      {
        question: 'How do I apply a coupon code?',
        answer: 'During checkout, enter your coupon code in the "Coupon Code" field and click "Apply". Valid codes will show the discount applied to your order total. Check our header banner for active coupon codes!',
        keywords: ['coupon', 'discount', 'promo code', 'voucher', 'code', 'apply coupon']
      },
      {
        question: 'Do you offer first-time customer discounts?',
        answer: 'Yes! First-time customers can use the "WELCOME10" coupon code for 10% off their first purchase. Check the coupon slider at the top of the page for current offers.',
        keywords: ['first time', 'welcome', 'new customer', 'discount', 'first purchase']
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely! We use Stripe for secure payment processing. Your payment information is encrypted and never stored on our servers. We follow industry-standard security practices.',
        keywords: ['secure', 'security', 'safe', 'payment security', 'encryption']
      }
    ]
  },
  {
    id: 'account',
    name: 'Account & Support',
    icon: '👤',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign Up" in the navigation menu or user menu. Fill in your details, accept the Terms and Conditions, and verify your email. Having an account lets you track orders, save addresses, and access exclusive offers.',
        keywords: ['sign up', 'register', 'create account', 'new account', 'signup']
      },
      {
        question: 'I forgot my password. What should I do?',
        answer: 'Click "Login" and then "Forgot Password". Enter your email address, and we\'ll send you a password reset link. The link is valid for 1 hour.',
        keywords: ['forgot password', 'reset password', 'password reset', 'lost password']
      },
      {
        question: 'How do I contact support?',
        answer: 'You can reach us via email at TouchMunyunLLC@gmail.com, visit our Contact Us page, or use WhatsApp support (available in the bottom right corner). We typically respond within 24 hours.',
        keywords: ['contact', 'support', 'help', 'customer service', 'email', 'phone']
      },
      {
        question: 'Can I update my account information?',
        answer: 'Yes! Log into your account and go to your profile settings. You can update your name, email, password, and shipping addresses at any time.',
        keywords: ['update profile', 'edit account', 'change email', 'account settings', 'profile']
      }
    ]
  }
];

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; text: string }>>([
    {
      type: 'bot',
      text: "Hello! 👋 I'm TouchMunyun Support. I'm here to help you with orders, shipping, products, payments, and more. How can I assist you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, selectedCategory]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findBestMatch = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    let bestMatch: { answer: string; score: number } | null = null;

    // Search through all categories and questions
    for (const category of faqCategories) {
      for (const qa of category.questions) {
        let score = 0;

        // Check if question matches
        if (lowerMessage.includes(qa.question.toLowerCase().substring(0, 10))) {
          score += 10;
        }

        // Check keywords
        if (qa.keywords) {
          for (const keyword of qa.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
              score += 5;
            }
          }
        }

        // Check if answer contains relevant terms
        const answerLower = qa.answer.toLowerCase();
        const messageWords = lowerMessage.split(' ');
        for (const word of messageWords) {
          if (word.length > 3 && answerLower.includes(word)) {
            score += 2;
          }
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { answer: qa.answer, score };
        }
      }
    }

    return bestMatch?.answer || getFallbackResponse(lowerMessage);
  };

  const getFallbackResponse = (lowerMessage: string): string => {
    // General greetings
    if (lowerMessage.match(/\b(hello|hi|hey|greetings)\b/)) {
      return "Hello! Welcome to TouchMunyun! How can I help you today? You can ask me about orders, shipping, products, payments, returns, or account questions.";
    }

    // General help
    if (lowerMessage.match(/\b(help|support|assist)\b/)) {
      return "I'm here to help! You can ask me about:\n\n📦 Orders & Tracking\n🚚 Shipping & Delivery\n↩️ Returns & Refunds\n🛍️ Products & Catalog\n💳 Payments & Coupons\n👤 Account & Support\n\nOr select a category below to see common questions!";
    }

    // Default response
    return "I understand you're looking for help. Could you be more specific? You can:\n\n• Select a category below to see common questions\n• Ask about orders, shipping, products, payments, or returns\n• Type your question and I'll do my best to help!\n\nFor urgent matters, contact our support team at TouchMunyunLLC@gmail.com";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setInputValue('');
    setSelectedCategory(null); // Clear category selection when user types
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = findBestMatch(userMessage);
      setMessages((prev) => [...prev, { type: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = faqCategories.find((c) => c.id === categoryId);
    if (category) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: `Here are common questions about **${category.name}**:\n\n${category.questions
            .map((qa, idx) => `${idx + 1}. ${qa.question}`)
            .join('\n')}\n\nClick on any question above, or type your own question!`,
        },
      ]);
    }
  };

  const handleQuestionClick = (question: string, answer: string) => {
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: question },
      { type: 'bot', text: answer },
    ]);
    setSelectedCategory(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentCategory = selectedCategory
    ? faqCategories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-button text-button-text backdrop-blur-md rounded-full shadow-glass-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 hover:bg-button-200 border-2 border-foreground/20"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-primary/95 backdrop-blur-xl rounded-3xl shadow-glass-lg flex flex-col overflow-hidden border-2 border-foreground/20">
          {/* Header */}
          <div className="bg-button text-button-text backdrop-blur-md p-4 flex items-center justify-between flex-shrink-0 border-b-2 border-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-foreground/20 shadow-glass">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-button-text">TouchMunyun Support</h3>
                <p className="text-xs text-button-text/80 font-medium">We&apos;re online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-button-text/80 hover:text-button-text transition-colors"
              aria-label="Close chatbot"
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

          {/* Category Selection */}
          {!selectedCategory && messages.length <= 1 && (
            <div className="px-4 pt-3 pb-2 border-b border-foreground/10 bg-primary/60 backdrop-blur-sm flex-shrink-0">
              <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Browse by Category:</p>
              <div className="grid grid-cols-2 gap-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/40 backdrop-blur-sm hover:bg-button/20 border-2 border-foreground/10 hover:border-button/50 rounded-xl text-left transition-all hover:shadow-glass text-foreground hover:text-button font-semibold text-xs"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-xs font-semibold">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary/40">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-button text-button-text shadow-glass-lg border-2 border-foreground/10'
                      : 'bg-primary/60 backdrop-blur-sm text-foreground shadow-glass border-2 border-foreground/10'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.text}</p>
                </div>
              </div>
            ))}

            {/* Show questions for selected category */}
            {currentCategory && (
              <div className="space-y-2">
                {currentCategory.questions.map((qa, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(qa.question, qa.answer)}
                    className="w-full text-left px-4 py-3 bg-primary/60 backdrop-blur-sm border-2 border-foreground/10 rounded-xl hover:bg-button/20 hover:border-button/50 transition-all text-sm text-foreground hover:text-button font-semibold shadow-glass"
                  >
                    <p className="font-bold text-foreground">{qa.question}</p>
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-primary/60 backdrop-blur-sm text-foreground shadow-glass border-2 border-foreground/10 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-button rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-button rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-button rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length > 1 && !selectedCategory && (
            <div className="px-4 pt-2 pb-2 border-t border-foreground/10 bg-primary/60 backdrop-blur-sm flex-shrink-0">
              <p className="text-xs text-foreground/70 mb-2 font-semibold uppercase tracking-wide">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMessages((prev) => [
                      ...prev,
                      { type: 'user', text: 'Show categories' },
                      {
                        type: 'bot',
                        text: 'Select a category to see common questions:\n\n' +
                          faqCategories.map((c) => `${c.icon} ${c.name}`).join('\n') +
                          '\n\nClick on any category above!',
                      },
                    ]);
                  }}
                  className="text-xs px-3 py-1.5 bg-primary/40 backdrop-blur-sm hover:bg-button/20 text-foreground hover:text-button font-semibold border-2 border-foreground/10 hover:border-button/50 rounded-full transition-all shadow-glass"
                >
                  📋 Browse Categories
                </button>
                <Link
                  href="/help"
                  onClick={() => setIsOpen(false)}
                  className="text-xs px-3 py-1.5 bg-primary/40 backdrop-blur-sm hover:bg-button/20 text-foreground hover:text-button font-semibold border-2 border-foreground/10 hover:border-button/50 rounded-full transition-all shadow-glass"
                >
                  📚 Help Center
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="text-xs px-3 py-1.5 bg-primary/40 backdrop-blur-sm hover:bg-button/20 text-foreground hover:text-button font-semibold border-2 border-foreground/10 hover:border-button/50 rounded-full transition-all shadow-glass"
                >
                  ✉️ Contact Us
                </Link>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-foreground/10 bg-primary/60 backdrop-blur-sm flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 px-4 py-3 border-2 border-foreground/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-button/50 focus:border-button/50 text-sm bg-primary/80 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glass-lg border-2 border-foreground/10 transform hover:scale-105"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
