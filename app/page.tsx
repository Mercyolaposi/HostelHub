import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Hero Section */}
      <section className="w-full min-h-[80vh] md:min-h-[90vh] flex flex-col justify-center pt-24 pb-12 px-4 md:px-8 lg:px-12 relative border-b border-slate-900">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center lg:items-end">
          <div className="lg:col-span-8 space-y-6 md:space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-900"></span>
              Catholic University of Ghana
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-heading font-bold leading-[0.9] tracking-tighter uppercase">
              Hostel <br />
              <span className="text-slate-400">Management</span> <br />
              System.
            </h1>
          </div>
          
          <div className="lg:col-span-4 space-y-6 md:space-y-8 pb-4 lg:pb-8">
            <p className="text-base md:text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-md">
              The definitive platform for CUG students to discover, compare, and secure verified accommodations with absolute transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/hostels" className="group flex items-center justify-between bg-slate-900 text-white px-6 py-4 md:px-8 md:py-5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all">
                Find a Hostel
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link href="/register" className="group flex items-center justify-center bg-transparent border border-slate-900 text-slate-900 px-6 py-4 md:px-8 md:py-5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-all">
                For Managers
              </Link>
            </div>
          </div>
        </div>

        {/* Abstract shapes / lines */}
        <div className="absolute top-0 right-0 w-1/3 h-full border-l border-slate-200 -z-10 hidden lg:block"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10 hidden lg:block"></div>
      </section>

      {/* Marquee / Stats Section */}
      <section className="w-full border-b border-slate-900 bg-slate-50 overflow-hidden py-4 md:py-6">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center gap-8 md:gap-12 px-4 animate-marquee">
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">100% Verified Properties</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">Secure Payments</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">Direct Communication</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">100% Verified Properties</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">Secure Payments</span>
          </div>
          <div className="flex items-center gap-8 md:gap-12 px-4 animate-marquee" aria-hidden="true">
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">100% Verified Properties</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">Secure Payments</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">Direct Communication</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">100% Verified Properties</span>
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-900"></span>
            <span className="text-xl md:text-4xl font-heading font-bold uppercase tracking-tighter text-slate-300">Secure Payments</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-16 md:py-24 px-4 md:px-8 lg:px-12 border-b border-slate-900">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter max-w-2xl leading-none">
              Elevating the student living experience.
            </h2>
            <p className="text-slate-500 max-w-sm text-base md:text-lg">
              A curated selection of premium accommodations designed specifically for the modern student.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-900">
            {/* Feature 1 */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-900 group hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-slate-900 flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-bold uppercase mb-4">Verified <br className="hidden md:block"/> Listings</h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Every property on our platform undergoes a rigorous verification process to ensure safety, quality, and peace of mind.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-900 group hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-full border border-slate-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-2xl font-heading font-bold uppercase mb-4">Prime <br/> Locations</h3>
              <p className="text-slate-600 leading-relaxed">
                Discover accommodations strategically located near the Catholic University campus, minimizing commute times.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 md:p-12 group hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-full border border-slate-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-2xl font-heading font-bold uppercase mb-4">Seamless <br/> Management</h3>
              <p className="text-slate-600 leading-relaxed">
                A powerful suite of tools for hostel managers to oversee bookings, handle maintenance requests, and communicate effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image / Editorial Section */}
      <section className="w-full py-24 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] w-full relative rounded-none overflow-hidden border border-slate-900">
            <Image 
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop" 
              alt="Modern student accommodation" 
              fill
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border-[16px] border-white/10 mix-blend-overlay pointer-events-none"></div>
          </div>
          
          <div className="space-y-8 lg:pl-12">
            <h2 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.9]">
              Designed for <br/>
              <span className="text-slate-400">Parents &</span> <br/>
              Guardians.
            </h2>
            <div className="space-y-6 text-lg text-slate-600">
              <p>
                We understand that finding the right accommodation is a priority for families. Our platform provides absolute transparency.
              </p>
              <ul className="space-y-4 border-t border-slate-200 pt-6">
                <li className="flex items-start gap-4">
                  <span className="font-bold text-slate-900">01.</span>
                  <span>Direct communication channels with verified hostel managers.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="font-bold text-slate-900">02.</span>
                  <span>Comprehensive visual galleries and detailed amenity lists.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="font-bold text-slate-900">03.</span>
                  <span>Transparent pricing structures with no hidden fees.</span>
                </li>
              </ul>
            </div>
            <Link href="/hostels" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors mt-8">
              Explore Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-slate-900 text-white py-32 px-4 md:px-8 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9]">
            Ready to secure <br/> your space?
          </h2>
          <p className="text-xl text-slate-400 max-w-xl mx-auto">
            Join thousands of students who have already found their perfect home away from home.
          </p>
          <div className="pt-8">
            <Link href="/hostels" className="inline-flex items-center justify-center bg-white text-slate-900 px-12 py-6 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors">
              Start Browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
