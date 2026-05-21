import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#24003E] px-4 text-center font-['Inter']">
      <div className="relative mb-8">
        <h1 className="text-[80px] md:text-[120px] font-black leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-white to-[#2BDFC8] bg-clip-text text-transparent uppercase">
            404
          </span>
        </h1>
        <div className="bg-[#2BDFC8] px-3 py-1 text-sm rounded-full rotate-12 absolute bottom-0 right-0 text-black font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(43,223,200,0.4)]">
          Page Not Found
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center">
        <h3 className="text-white text-[24px] md:text-[32px] font-black uppercase tracking-tight">
          Oops! Looks like you're lost.
        </h3>
        <p className="text-white/50 text-base md:text-lg max-w-md font-medium leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
        
        <div className="pt-8">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 hover:border-[#2BDFC8]/30 overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-widest text-sm">Return to Home</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2BDFC8]/0 via-[#2BDFC8]/10 to-[#2BDFC8]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
