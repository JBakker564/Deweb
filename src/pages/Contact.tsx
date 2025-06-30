import React, { useState } from 'react';
import { Mail, Phone, Instagram } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message. I\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h1 className="text-3xl lg:text-5xl font-light tracking-wider mb-12">Contact</h1>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-light tracking-wide mb-4">Get in Touch</h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Benieuwd wat ik voor jouw project kan betekenen? Ik sta open voor nieuwe ideeën en samenwerkingen. 
                  Of je nu een concreet plan hebt of gewoon wilt sparren over mogelijkheden, ik hoor graag van je. 
                  Laat een bericht achter, dan praten we verder over hoe we jouw verhaal in beeld kunnen brengen.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a 
                    href="mailto:Rick@lowkeymedia.nl" 
                    className="text-gray-300 hover:text-white transition-colors font-light"
                  >
                    Rick@lowkeymedia.nl
                  </a>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a 
                    href="tel:+31652251356" 
                    className="text-gray-300 hover:text-white transition-colors font-light"
                  >
                    +31 652251356
                  </a>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Instagram className="h-5 w-5 text-gray-400" />
                  <a 
                    href="https://instagram.com/Rickthedp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors font-light"
                  >
                    @Rickthedp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Name"
                  className="w-full bg-transparent border-b border-gray-800 focus:border-white py-4 text-white placeholder-gray-500 font-light tracking-wide focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                  className="w-full bg-transparent border-b border-gray-800 focus:border-white py-4 text-white placeholder-gray-500 font-light tracking-wide focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell me about your project"
                  className="w-full bg-transparent border-b border-gray-800 focus:border-white py-4 text-white placeholder-gray-500 font-light tracking-wide focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="mt-8 px-8 py-3 bg-white text-black font-light tracking-wider hover:bg-gray-200 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}