import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-900 bg-white text-slate-900">
      <div className="w-full px-4 md:px-8 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 md:gap-8">
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-4 space-y-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg leading-none">H</span>
              </div>
              <span className="text-xl font-heading font-bold text-slate-900 tracking-tighter uppercase">HostelHub.</span>
            </div>
            <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
              The definitive platform for CUG students to discover, compare, and secure verified accommodations.
            </p>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Platform</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-wider">
              <li><Link href="/hostels" className="hover:text-slate-500 transition-colors">Find a Hostel</Link></li>
              <li><Link href="/register" className="hover:text-slate-500 transition-colors">For Managers</Link></li>
              <li><Link href="/about" className="hover:text-slate-500 transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Support</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-wider">
              <li><Link href="/faq" className="hover:text-slate-500 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-slate-500 transition-colors">Contact</Link></li>
              <li><Link href="/complaints" className="hover:text-slate-500 transition-colors">Complaints</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Legal</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-wider">
              <li><Link href="/privacy" className="hover:text-slate-500 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-500 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            © {new Date().getFullYear()} HostelHub.
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Designed for CUG
          </div>
        </div>
      </div>
    </footer>
  );
}
