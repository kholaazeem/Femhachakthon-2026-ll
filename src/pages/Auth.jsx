import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2'; // Import SweetAlert


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN LOGIC
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Success Alert
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Login Successful',
          confirmButtonColor: '#66b032', // Saylani Green
          timer: 1500
        });

      } else {
        // SIGNUP LOGIC
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });
        if (error) throw error;

        // Success Alert
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Please check your email for confirmation link.',
          confirmButtonColor: '#0057a8' // Saylani Blue
        });
      }
    } catch (error) {
      // Error Alert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}> 
      
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '450px' }}>
        <div className="card-body p-5">
          
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{ color: '#0057a8' }}>
              {isLogin ? 'Welcome Back!' : 'Join the Community'}
            </h2>
            <p className="text-muted small">Saylani Mass IT Hub Portal</p>
          </div>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="form-floating mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="floatingName" 
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                  <label htmlFor="floatingName">Full Name</label>
                </div>

                <div className="form-floating mb-3">
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="floatingPhone" 
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                  />
                  <label htmlFor="floatingPhone">Phone Number</label>
                </div>
              </>
            )}

            <div className="form-floating mb-3">
              <input 
                type="email" 
                className="form-control" 
                id="floatingEmail" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label htmlFor="floatingEmail">Email Address</label>
            </div>

            <div className="form-floating mb-4">
              <input 
                type="password" 
                className="form-control" 
                id="floatingPassword" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
            
            <button 
              type="submit" 
              className="btn w-100 py-3 fw-bold text-white shadow-sm" 
              style={{ 
                backgroundColor: '#66b032', 
                borderColor: '#66b032',
                borderRadius: '10px',
                fontSize: '1.1rem'
              }}
              disabled={loading}
            >
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
              ) : (isLogin ? 'Login Now' : 'Create Account')}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <p className="mb-0 text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                className="btn btn-link text-decoration-none fw-bold ms-1" 
                style={{ color: '#0057a8' }}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFullName('');
                  setPhone('');
                }}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Auth;