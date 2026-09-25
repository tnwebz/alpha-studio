import { Mail, MapPin, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#3D111B] py-10 sm:py-16 px-4 sm:px-8 text-[#FAF6F0] border-t border-[#681C2B]/50">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-sm">
        
        {/* Brand & Contact Person */}
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-wider text-[#FAF6F0]">Alpha stories studio</h2>
            <p className="text-[#DCC9B6] text-xs italic mt-1 font-medium">"Turning Moments Into Timeless Art"</p>
          </div>
          <div className="mt-2 text-xs text-[#DCC9B6]/80">
            <p className="font-semibold text-[#FAF6F0]">Contact Person:</p>
            <p className="mt-0.5 text-[#DCC9B6]">Alwin.E</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold tracking-widest text-[#DCC9B6]">Our Studio Location</h3>
          <div className="flex items-start gap-2.5 text-[#FAF6F0]/90 text-xs leading-relaxed">
            <MapPin className="h-4 w-4 shrink-0 text-[#FAF6F0] mt-0.5" />
            <div>
              <p className="font-semibold text-white">Name: Alwin.E</p>
              <p>NO: 45/1108/D Thimmavaram,</p>
              <p>Kanchipuram high road,</p>
              <p className="text-white font-medium">Chengalpattu - 603 001</p>
              <p className="text-[#DCC9B6] mt-1 font-medium">Landmark: Near VAO office thimmavaram</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold tracking-widest text-[#DCC9B6]">Contact Us</h3>
          
          <div className="flex items-center gap-2 text-[#FAF6F0]/90 text-xs">
            <Mail className="h-4 w-4 shrink-0 text-[#FAF6F0]" />
            <a href="mailto:alphastoriesstudio@gmail.com" className="hover:text-white transition-colors">
              alphastoriesstudio@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-2 text-[#FAF6F0]/90 text-xs">
            <MessageSquare className="h-4 w-4 shrink-0 text-emerald-400" />
            <a 
              href="https://wa.me/919629238744" 
              target="_blank" 
              rel="noreferrer"
              className="text-emerald-400 hover:underline transition-colors"
            >
              WhatsApp: +91 96292 38744
            </a>
          </div>
        </div>

        {/* Social Media & Directories */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold tracking-widest text-[#DCC9B6]">Connect With Us</h3>
          
          {/* Instagram */}
          <a 
            href="https://www.instagram.com/stories_by_alpha?stkn=MW0zMGY5eXUweDYwYg%3D%3D&utm_source=qr" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-[#FAF6F0]/90 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-pink-400"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Instagram (@stories_by_alpha)</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/919629238744"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-[#FAF6F0]/90 hover:text-emerald-400 transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Google Review */}
          <a
            href="https://g.page/r/CaKfehPxRGXTEBM/review"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-[#FAF6F0]/90 hover:text-[#DCC9B6] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-[#DCC9B6] shrink-0"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Write a Google Review</span>
          </a>
        </div>

      </div>

      <div className="mt-12 border-t border-[#681C2B]/40 pt-6 flex flex-col items-center gap-2 text-center">
        <div className="text-xs text-[#DCC9B6]/70">
          &copy; {new Date().getFullYear()} Alpha stories studio. All rights reserved.
        </div>
        <a 
          href="https://tnwebz.com" 
          title="Top Web Developers and Web Designers in Arcot, Ranipet District" 
          aria-label="Web Design in Arcot by TNWebz"
          target="_blank" 
          rel="noopener" 
          className="text-[10px] text-[#DCC9B6]/60 hover:text-white transition-colors"
        >
          Designed by TNWebz
        </a>
      </div>
    </footer>
  );
}
