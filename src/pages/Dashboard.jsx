import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ session }) => {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h1 className="fw-bold text-center mb-2" style={{ color: '#0057a8' }}>Saylani Mass IT Hub</h1>
      <p className="text-center text-muted mb-5">Welcome, {session?.user?.email}</p>
      
      <div className="row g-4 justify-content-center">
        
        {/* Card 1: Lost & Found */}
        <div className="col-md-4">
          <div 
            className="card p-4 shadow-sm border-0 h-100 text-center" 
            style={{ cursor: 'pointer', transition: '0.3s', backgroundColor: '#f8f9fa' }}
            onClick={() => navigate('/lost-found')}
          >
            <div className="display-4 mb-2">🔍</div>
            <h5 className="fw-bold" style={{ color: '#66b032' }}>Lost & Found</h5>
            <p className="text-muted small">Report lost items or find recovered ones.</p>
          </div>
        </div>

        {/* Card 2: Complaints */}
        <div className="col-md-4">
          <div 
            className="card p-4 shadow-sm border-0 h-100 text-center"
            style={{ cursor: 'pointer', transition: '0.3s', backgroundColor: '#f8f9fa' }} 
            onClick={() => navigate('/complaints')}
          >
            <div className="display-4 mb-2">📝</div>
            <h5 className="fw-bold" style={{ color: '#0057a8' }}>Complaints</h5>
            <p className="text-muted small">Submit maintenance or facility issues.</p>
          </div>
        </div>

        {/* Card 3: Volunteer Registration */}
        <div className="col-md-4">
          <div 
            className="card p-4 shadow-sm border-0 h-100 text-center"
            style={{ cursor: 'pointer', transition: '0.3s', backgroundColor: '#f8f9fa' }} 
            onClick={() => navigate('/volunteers')}
          >
            <div className="display-4 mb-2">🤝</div>
            <h5 className="fw-bold" style={{ color: '#66b032' }}>Volunteer</h5>
            <p className="text-muted small">Register for upcoming campus events.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;