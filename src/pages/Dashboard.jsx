import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ session }) => {
  const navigate = useNavigate();

  // Helper function for user name
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#ebf2f7', paddingBottom: '50px' }}>
      
      {/* --- Header Section (Gradient) --- */}
      <div className="py-5 text-center text-white shadow-sm" 
           style={{ background: 'linear-gradient(135deg, #0057a8 0%, #003060 100%)', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px' }}>
        <div className="container">
          <h1 className="fw-bold display-5">👋 Welcome Back!</h1>
          <p className="lead opacity-75 text-capitalize">{userName}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px' }}>
        
        {/* --- Quick Stats / Intro Card --- */}
        <div className="card border-0 shadow-lg rounded-4 mb-5 p-4 animate__animated animate__fadeInUp">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="fw-bold" style={{ color: '#0057a8' }}>Saylani Mass IT Hub Portal</h4>
              <p className="text-muted mb-0">
                Manage your campus life efficiently. Report lost items, submit complaints, or join volunteer teams directly from here.
              </p>
            </div>
            <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
              <span className="badge bg-success px-3 py-2 rounded-pill">🟢 System Operational</span>
            </div>
          </div>
        </div>

        {/* --- Main Action Cards --- */}
        <div className="row g-4 justify-content-center">
          
          {/* Card 1: Lost & Found */}
          <div className="col-md-4">
            <div 
              className="card h-100 border-0 shadow-sm p-4 text-center card-hover-effect"
              style={{ borderRadius: '20px', cursor: 'pointer', backgroundColor: '#ffffff' }}
              onClick={() => navigate('/lost-found')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Icon Bubble */}
              <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                   style={{ width: '80px', height: '80px', backgroundColor: '#ffe5e5', color: '#dc3545' }}>
                <span className="display-5">🔍</span>
              </div>
              
              <h4 className="fw-bold text-dark">Lost & Found</h4>
              <p className="text-muted small mb-4">
                Lost something valuable? Or found an item? Report it here instantly.
              </p>
              
              <button className="btn btn-outline-danger rounded-pill fw-bold px-4 w-100 mt-auto">
                View Items
              </button>
            </div>
          </div>

          {/* Card 2: Complaints */}
          <div className="col-md-4">
            <div 
              className="card h-100 border-0 shadow-sm p-4 text-center card-hover-effect"
              style={{ borderRadius: '20px', cursor: 'pointer', backgroundColor: '#ffffff' }}
              onClick={() => navigate('/complaints')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Icon Bubble */}
              <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                   style={{ width: '80px', height: '80px', backgroundColor: '#e3f2fd', color: '#0057a8' }}>
                <span className="display-5">📝</span>
              </div>
              
              <h4 className="fw-bold text-dark">Complaints</h4>
              <p className="text-muted small mb-4">
                Facing issues with Wi-Fi, Lab equipment, or facilities? Submit a ticket.
              </p>
              
              <button className="btn btn-outline-primary rounded-pill fw-bold px-4 w-100 mt-auto">
                Submit Ticket
              </button>
            </div>
          </div>

          {/* Card 3: Volunteer Registration */}
          <div className="col-md-4">
            <div 
              className="card h-100 border-0 shadow-sm p-4 text-center card-hover-effect"
              style={{ borderRadius: '20px', cursor: 'pointer', backgroundColor: '#ffffff' }}
              onClick={() => navigate('/volunteers')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Icon Bubble */}
              <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                   style={{ width: '80px', height: '80px', backgroundColor: '#e8f5e9', color: '#198754' }}>
                <span className="display-5">🤝</span>
              </div>
              
              <h4 className="fw-bold text-dark">Volunteer</h4>
              <p className="text-muted small mb-4">
                Join our student teams for Hackathons, Sports, and Campus Events.
              </p>
              
              <button className="btn btn-outline-success rounded-pill fw-bold px-4 w-100 mt-auto">
                Join Team
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CSS for Smooth Hover Animation */}
      <style>
        {`
          .card-hover-effect {
            transition: all 0.3s ease-in-out;
          }
          .card-hover-effect:hover {
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;