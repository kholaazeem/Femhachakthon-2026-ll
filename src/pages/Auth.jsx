import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Swal from 'sweetalert2'; 

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password Eye State
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Login Successful',
          confirmButtonColor: '#66b032',
          timer: 1500
        });

      } else {
        // --- SIGNUP LOGIC ---
        // Profile pic logic removed. Register User with Metadata (Name & Phone only)
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

        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Please check your email for confirmation link.',
          confirmButtonColor: '#66b032'
        });
      }
    } catch (error) {
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
          
          <div className="text-center mb-4">
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

            {/* --- Password Field Fixed --- */}
            <div className="form-floating mb-4 position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control pe-5" // pe-5 adds padding to the right so text doesn't overlap icon
                id="floatingPassword" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <label htmlFor="floatingPassword">Password</label>
              
              {/* Eye Icon positioned absolutely inside the input field */}
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" 
                style={{ cursor: 'pointer', zIndex: 10 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Eye Slash Icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                ) : (
                  // Eye Icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                )}
              </span>
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