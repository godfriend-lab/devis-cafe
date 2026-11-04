import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhyChoose } from './components/WhyChoose';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <WhyChoose />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}