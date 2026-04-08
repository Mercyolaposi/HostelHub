import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, Globe, Building2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Hero Section */}
      <section className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-slate-900 rounded-full text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
              Our Mission
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-heading font-bold leading-[0.9] tracking-tighter uppercase">
              Redefining <br />
              <span className="text-slate-400">Student</span> <br />
              Living.
            </h1>
          </div>
          <div className="lg:col-span-4 pb-4">
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-md">
              HostelHub is the definitive platform for the Catholic University of Ghana, bridging the gap between students and premium accommodations.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full py-24 px-4 md:px-8 lg:px-12 border-b border-slate-900">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter leading-none">
              Built for the <br/> Modern Student.
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                Founded with a vision to eliminate the stress of finding accommodation, HostelHub provides a transparent, secure, and efficient marketplace for student housing.
              </p>
              <p>
                We believe that a student&apos;s environment directly impacts their academic success. By verifying every hostel and streamlining the booking process, we ensure that students can focus on what matters most: their education.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter mb-2">50+</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verified Hostels</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter mb-2">2k+</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Happy Students</p>
              </div>
            </div>
          </div>
          <div className="aspect-square relative border border-slate-900 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
              alt="Students collaborating" 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-24 px-4 md:px-8 lg:px-12 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-tighter mb-16 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-900 bg-white">
            <div className="p-12 border-b md:border-b-0 md:border-r border-slate-900 space-y-6">
              <ShieldCheck className="w-10 h-10 text-slate-900" />
              <h3 className="text-2xl font-heading font-bold uppercase">Integrity</h3>
              <p className="text-slate-600 leading-relaxed">
                We maintain the highest standards of verification. If it&apos;s on HostelHub, it&apos;s been vetted by our team.
              </p>
            </div>
            <div className="p-12 border-b md:border-b-0 md:border-r border-slate-900 space-y-6">
              <Globe className="w-10 h-10 text-slate-900" />
              <h3 className="text-2xl font-heading font-bold uppercase">Accessibility</h3>
              <p className="text-slate-600 leading-relaxed">
                Our platform is designed to be inclusive and easy to use for every student, regardless of their technical expertise.
              </p>
            </div>
            <div className="p-12 space-y-6">
              <Users className="w-10 h-10 text-slate-900" />
              <h3 className="text-2xl font-heading font-bold uppercase">Community</h3>
              <p className="text-slate-600 leading-relaxed">
                We foster a community of trust between students, parents, and hostel managers for a better living ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-32 px-4 md:px-8 lg:px-12 text-center border-t border-slate-900">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-none">
            Join the <br/> Revolution.
          </h2>
          <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium">
            Whether you&apos;re a student looking for a home or a manager looking to reach more students, we&apos;re here for you.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hostels" className="bg-slate-900 text-white px-12 py-6 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
              Find a Hostel
            </Link>
            <Link href="/register" className="border border-slate-900 text-slate-900 px-12 py-6 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
