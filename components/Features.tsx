import React from 'react';

const features = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Fast Delivery',
    description: 'Get your orders delivered quickly and safely to your doorstep.',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    borderColor: 'border-blue-500',
    hoverBorderColor: 'group-hover:border-blue-400',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    contextColor: 'blue',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payment',
    description: 'Your transactions are protected with industry-leading security.',
    gradient: 'from-emerald-500 to-green-500',
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white',
    borderColor: 'border-emerald-500',
    hoverBorderColor: 'group-hover:border-emerald-400',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    contextColor: 'green',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Quality Guaranteed',
    description: 'We only offer products that meet our high quality standards.',
    gradient: 'from-yellow-500 to-amber-500',
    iconBg: 'bg-yellow-500',
    iconColor: 'text-white',
    borderColor: 'border-yellow-500',
    hoverBorderColor: 'group-hover:border-yellow-400',
    hoverGlow: 'group-hover:shadow-glow-gold-lg',
    contextColor: 'gold',
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Our customer service team is always here to help you.',
    gradient: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-500',
    iconColor: 'text-white',
    borderColor: 'border-purple-500',
    hoverBorderColor: 'group-hover:border-purple-400',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    contextColor: 'purple',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Dynamic Sports Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85" />
        
        {/* Red Accent Overlay for Sports Energy */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/15 via-transparent to-red-600/10" />
        
        {/* Gold Accent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-gold-600/5" />
        
        {/* Animated Sports Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 50 L50 40 L40 50 Z' fill='%23dc2626' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='3' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='3' fill='%23ffffff' opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            animation: 'shimmer 20s linear infinite',
          }} />
        </div>
      </div>

      {/* Floating Sports Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-red-600/20 rounded-full blur-xl animate-float animation-delay-200" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gold-600/20 rounded-full blur-2xl animate-float animation-delay-400" />
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg animate-float animation-delay-600" />
      <div className="absolute bottom-1/4 left-20 w-24 h-24 bg-red-600/15 rounded-full blur-xl animate-float animation-delay-300" />
      <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-gold-600/15 rounded-full blur-2xl animate-float animation-delay-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header with Visual Effects */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-500 text-sm font-semibold backdrop-blur-sm shadow-glass">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Trusted by Thousands
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="block text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Why Choose Us?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            We&apos;re committed to providing you with the best shopping experience
          </p>
        </div>

        {/* Enhanced Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-black/70 backdrop-blur-xl rounded-3xl shadow-glass-lg ${feature.hoverGlow} transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] overflow-hidden border-2 ${feature.borderColor} ${feature.hoverBorderColor} transition-colors duration-300`}
            >
              {/* Enhanced Animated Gradient Accent Bar */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 animate-shimmer`} />
              </div>

              {/* Context-based shine effect on hover */}
              {feature.contextColor === 'blue' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              )}
              {feature.contextColor === 'green' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              )}
              {feature.contextColor === 'gold' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              )}
              {feature.contextColor === 'purple' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              )}
              
              <div className="p-8 md:p-10 relative z-10">
                {/* Enhanced Icon with Context-based Background */}
                <div className={`${feature.iconBg} backdrop-blur-md ${feature.iconColor} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 ${feature.borderColor} ${feature.hoverBorderColor} shadow-glass-lg ${feature.hoverGlow}`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {feature.icon}
                </div>
                
                {/* Content with context-based title color */}
                <h3 className={`text-xl md:text-2xl font-bold mb-4 text-white transition-colors duration-300 ${
                  feature.contextColor === 'blue' ? 'group-hover:text-blue-400' :
                  feature.contextColor === 'green' ? 'group-hover:text-emerald-400' :
                  feature.contextColor === 'gold' ? 'group-hover:text-yellow-400' :
                  'group-hover:text-purple-400'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base group-hover:text-white/95 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Enhanced Multiple Decorative Glow Elements - Context-based */}
              <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full -mr-20 -mb-20 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl`}></div>
              <div className={`absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-2xl`}></div>
              <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-full -ml-12 -mt-12 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

