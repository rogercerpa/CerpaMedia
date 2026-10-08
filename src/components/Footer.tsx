export default function Footer() {
  return (
    <footer className="bg-charcoal text-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-3">
            <h3 className="text-[15px] font-medium mb-2 text-white">CerpaMedia</h3>
            <p className="text-[14px] text-gray-400 leading-relaxed">
              Technology services for small business operations
            </p>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-[13px] font-medium mb-3 text-white uppercase tracking-wide">Contact</h4>
            <div className="space-y-2">
              <a 
                href="mailto:cerpamedia@gmail.com" 
                className="text-[14px] text-gray-400 hover:text-white transition-colors block"
              >
                cerpamedia@gmail.com
              </a>
              <a 
                href="tel:+19432487410" 
                className="text-[14px] text-gray-400 hover:text-white transition-colors block"
              >
                (943) 248-7410
              </a>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-[13px] font-medium mb-3 text-white uppercase tracking-wide">Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="/services" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  All Services
                </a>
              </li>
              <li>
                <a href="/services/ai-teammate-launch" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  AI Teammate Launch
                </a>
              </li>
              <li>
                <a href="/consult" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  Strategy Call
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[13px] font-medium mb-3 text-white uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="/insights" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  Insights
                </a>
              </li>
              <li>
                <a href="/contact" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[13px] font-medium mb-3 text-white uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/strategy-call-policy" className="text-[14px] text-gray-400 hover:text-white transition-colors">
                  Strategy Call Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6">
          <p className="text-[13px] text-gray-400 text-center">
            &copy; {new Date().getFullYear()} CerpaMedia LLC d/b/a CerpaMedia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
