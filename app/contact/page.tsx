'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We will get back to you soon.');
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <section className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-24 md:py-32 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-slate-900 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            Get In Touch
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-heading font-bold leading-[0.9] tracking-tighter uppercase">
            Let&apos;s Start <br />
            <span className="text-slate-400">A Conversation.</span>
          </h1>
        </div>
      </section>

      <section className="w-full py-24 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-tighter">Contact Information</h2>
              <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
                Have questions about a hostel or need help with your booking? Our team is here to assist you.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email Us</p>
                  <a href="mailto:support@hostelhub.com" className="text-xl font-bold hover:text-slate-500 transition-colors">support@hostelhub.com</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Call Us</p>
                  <a href="tel:+233240000000" className="text-xl font-bold hover:text-slate-500 transition-colors">+233 24 000 0000</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Visit Us</p>
                  <p className="text-xl font-bold">Catholic University of Ghana, Fiapre - Sunyani</p>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Follow Our Journey</h3>
              <div className="flex gap-6">
                {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <a key={social} href="#" className="text-sm font-bold uppercase tracking-widest hover:text-slate-500 transition-colors border-b border-slate-900 pb-1">
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="border border-slate-900 p-8 md:p-12 bg-white">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-transparent border-b border-slate-200 py-4 focus:outline-none focus:border-slate-900 transition-colors text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-transparent border-b border-slate-200 py-4 focus:outline-none focus:border-slate-900 transition-colors text-lg font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</label>
                  <input 
                    required
                    type="text" 
                    placeholder="How can we help?"
                    className="w-full bg-transparent border-b border-slate-200 py-4 focus:outline-none focus:border-slate-900 transition-colors text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full bg-transparent border-b border-slate-200 py-4 focus:outline-none focus:border-slate-900 transition-colors text-lg font-medium resize-none"
                  ></textarea>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-6 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="w-full h-[400px] bg-slate-100 border-y border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Interactive Map Loading...</p>
          </div>
        </div>
        {/* Grayscale overlay for aesthetic consistency */}
        <div className="absolute inset-0 bg-slate-900/5 mix-blend-multiply pointer-events-none"></div>
      </section>
    </div>
  );
}
