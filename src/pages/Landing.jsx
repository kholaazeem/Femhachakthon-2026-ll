import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2';
import { Zap, Rocket, Search, FileText, HeartHandshake, CheckCircle, Lock, ScrollText, GraduationCap, PhoneCall, MapPin, Mail } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  // 1. Active Section State
  const [activeSection, setActiveSection] = useState('home');

  // Contact Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Scroll Spy Effect
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'about', 'contact'];
      const scrollPosition = window.scrollY + 150; 

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLinkClass = (sectionName) => {
    return activeSection === sectionName
      ? 'nav-link fw-bold text-white border-bottom border-2 border-success' 
      : 'nav-link text-white-50 hover-text-white'; 
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message }]);

    setLoading(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Message not sent. Try again.',
        confirmButtonColor: '#66b032'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Message sent to Admin.',
        confirmButtonColor: '#66b032'
      });
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="bg-white">
      
      {/* --- Navbar --- */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg sticky-top" 
           style={{ background: 'linear-gradient(90deg, #0057a8 0%, #004080 100%)' }}>
        <div className="container">
          <a className="navbar-brand d-flex align-items-center fw-bold fs-4" href="#home" onClick={() => setActiveSection('home')}>
            <Zap size={24} color="#66b032" fill="#66b032" className="me-2" />
            Saylani IT Hub
          </a>
          
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-lg-3">
              <li className="nav-item"><a className={getLinkClass('home')} href="#home" onClick={() => setActiveSection('home')}>Home</a></li>
              <li className="nav-item"><a className={getLinkClass('features')} href="#features" onClick={() => setActiveSection('features')}>Features</a></li>
              <li className="nav-item"><a className={getLinkClass('about')} href="#about" onClick={() => setActiveSection('about')}>About</a></li>
              <li className="nav-item"><a className={getLinkClass('contact')} href="#contact" onClick={() => setActiveSection('contact')}>Contact</a></li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button 
                  className="btn text-white fw-bold px-4 rounded-pill shadow-sm" 
                  style={{ backgroundColor: '#66b032', transition: '0.3s' }}
                  onClick={() => navigate('/auth')}
                >
                  Login Portal
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header 
        id="home"
        className="d-flex align-items-center justify-content-center text-center text-white"
        style={{ 
          minHeight: '85vh',
          backgroundImage: `linear-gradient(rgba(0, 50, 100, 0.75), rgba(0, 0, 0, 0.85)), url('https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container px-4">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3 fw-bold shadow d-inline-flex align-items-center gap-1 animate-fade-in-up">
            <Rocket size={16} /> Admissions Open 2026
          </span>
          <h1 className="display-4 fw-bold mb-3 d-none d-md-block animate-fade-in-up delay-1">
            Welcome to <span style={{ color: '#66b032' }}>Saylani Mass IT Hub</span>
          </h1>
          <h1 className="fw-bold mb-3 d-block d-md-none animate-fade-in-up delay-1">
            Welcome to <br/><span style={{ color: '#66b032' }}>Saylani IT Hub</span>
          </h1>

          <p className="lead mb-4 mx-auto text-light opacity-75 small-on-mobile animate-fade-in-up delay-2" style={{ maxWidth: '700px' }}>
            A centralized digital platform for students to manage Complaints, Lost & Found items, and Campus Events efficiently.
          </p>
          
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 animate-fade-in-up delay-3">
            <button 
              className="btn fw-bold rounded-pill shadow px-4 py-2 px-md-5 py-md-3" 
              style={{ backgroundColor: '#66b032', color: 'white', border: 'none', fontSize: '1rem' }}
              onClick={() => navigate('/auth')}
            >
              Get Started
            </button>
            <button 
              className="btn btn-outline-light rounded-pill fw-bold px-4 py-2 px-md-5 py-md-3"
              style={{ fontSize: '1rem' }}
              onClick={() => navigate('/auth')}
            >
              Admin Access
            </button>
          </div>

        </div>
      </header>

      {/* --- Floating Stats Section --- */}
      <section className="container animate-fade-in-up delay-4" style={{ marginTop: '-50px', position: 'relative', zIndex: '2' }}>
        <div className="row text-center g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-lg p-4 text-white hover-up" style={{ backgroundColor: '#0057a8' }}>
              <h2 className="fw-bold display-5">5,000+</h2>
              <p className="mb-0 opacity-75">Students Enrolled</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg p-4 text-white hover-up" style={{ backgroundColor: '#66b032' }}>
              <h2 className="fw-bold display-5">100+</h2>
              <p className="mb-0 opacity-75">Lab Computers</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg p-4 text-white hover-up" style={{ backgroundColor: '#004080' }}>
              <h2 className="fw-bold display-5">24/7</h2>
              <p className="mb-0 opacity-75">Portal Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-5 bg-white mt-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h6 className="fw-bold text-success text-uppercase ls-2">Portal Features</h6>
            <h2 className="fw-bold display-6" style={{ color: '#004080' }}>Everything You Need</h2>
            <div className="mx-auto mt-2" style={{ height: '4px', width: '60px', backgroundColor: '#66b032' }}></div>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 text-center feature-card">
                <div className="mb-3 d-flex justify-content-center">
                  <Search size={48} className="text-primary" />
                </div>
                <h4 className="fw-bold">Lost & Found</h4>
                <p className="text-muted">Report lost items instantly with images and track recovered items.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 text-center feature-card">
                <div className="mb-3 d-flex justify-content-center">
                  <FileText size={48} className="text-primary" />
                </div>
                <h4 className="fw-bold">Online Complaints</h4>
                <p className="text-muted">Submit complaints directly to management and track resolution status.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 text-center feature-card">
                <div className="mb-3 d-flex justify-content-center">
                  <HeartHandshake size={48} className="text-primary" />
                </div>
                <h4 className="fw-bold">Volunteer Hub</h4>
                <p className="text-muted">Register for upcoming seminars, hackathons, and sports events.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-5" style={{ backgroundColor: '#f4f7f6' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h6 className="fw-bold text-success text-uppercase">Who We Are</h6>
              <h2 className="fw-bold display-6 mb-4" style={{ color: '#004080' }}>Empowering Youth Through Technology</h2>
              <p className="text-muted lead">
                Saylani Welfare Trust has been at the forefront of providing free IT education to the youth of Pakistan. 
                This portal is a step towards digitizing our campus and providing a seamless experience for our students.
              </p>
              <ul className="list-unstyled text-muted mt-3">
                <li className="mb-2 d-flex align-items-center"><CheckCircle size={18} className="text-success me-2" /> Free Quality Education</li>
                <li className="mb-2 d-flex align-items-center"><CheckCircle size={18} className="text-success me-2" /> State-of-the-art Computer Labs</li>
                <li className="mb-2 d-flex align-items-center"><CheckCircle size={18} className="text-success me-2" /> Industry Standard Curriculum</li>
              </ul>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
               <img 
                 src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                 alt="About Saylani" 
                 className="img-fluid rounded-4 shadow-lg"
               />
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact & Policies Section --- */}
      <section id="contact" className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <div className="row g-5">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4" style={{ color: '#004080' }}>Get in Touch</h2>
              <p className="text-muted mb-4">Have questions about admissions or facing technical issues? Send us a message directly.</p>
              <form onSubmit={handleContactSubmit} className="p-4 bg-white rounded-3 shadow-sm border">
                <div className="mb-3">
                  <label className="form-label fw-bold small">Your Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ali Khan" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Email Address</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ali@example.com" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Message</label>
                  <textarea className="form-control" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="btn w-100 fw-bold text-white" disabled={loading} style={{ backgroundColor: '#0057a8' }}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4" style={{ color: '#004080' }}>Terms & Policies</h2>
              <div className="accordion shadow-sm" id="accordionExample">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button fw-bold d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                      <Lock size={18} className="me-2 text-dark" /> Privacy Policy
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                    <div className="accordion-body text-muted small">We value your privacy. Your data is securely stored.</div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                      <ScrollText size={18} className="me-2 text-dark" /> Terms of Use
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="accordion-body text-muted small">By using this portal, you agree to respectful communication.</div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                      <GraduationCap size={18} className="me-2 text-dark" /> Student Code of Conduct
                    </button>
                  </h2>
                  <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="accordion-body text-muted small">Students are expected to provide accurate information.</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded bg-white border d-flex align-items-center shadow-sm">
                <div className="me-3">
                  <PhoneCall size={32} className="text-success" />
                </div>
                <div><h6 className="fw-bold mb-0">Helpline</h6><p className="mb-0 text-muted">+92 21 111-729-526</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="text-white pt-5 pb-4" style={{ backgroundColor: '#002a5c' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h4 className="fw-bold d-flex align-items-center">
                <Zap size={24} color="#66b032" fill="#66b032" className="me-2" /> 
                Saylani IT Hub
              </h4>
              <p className="text-white-50 mt-3 small">Building the future of Pakistan through advanced IT training.</p>
            </div>
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3 text-white">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#home" className="text-white-50 text-decoration-none">Home</a></li>
                <li className="mb-2"><a href="#features" className="text-white-50 text-decoration-none">Features</a></li>
                <li className="mb-2"><a href="#about" className="text-white-50 text-decoration-none">About Us</a></li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3 text-white">Contact Us</h5>
              <p className="text-white-50 mb-2 d-flex align-items-center"><MapPin size={16} className="me-2" /> A-25, Bahadurabad Chowrangi, Karachi</p>
              <p className="text-white-50 d-flex align-items-center"><Mail size={16} className="me-2" /> info@saylaniwelfare.com</p>
            </div>
          </div>
          <hr className="border-secondary my-4" />
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start"><p className="mb-0 small text-white-50">© 2026 Saylani Mass IT Hub. All rights reserved.</p></div>
            <div className="col-md-6 text-center text-md-end"><p className="mb-0 small text-white-50">Developed for Hackathon 2026</p></div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;