import { registerUser, loginUser, fetchUsername} from "../api.js";
import { ProfileSystem } from './profile.js';

export class AuthSystem {
  constructor() {
    this.baseUrl = `https://media2.edu.metropolia.fi/restaurant/api/v1`; 
    this.initLogin();
    this.initSignup();
    this.centerBox = document.querySelector('.centerBox');
    this.content = document.getElementById('content');
    this.profileSystem = new ProfileSystem(this.content, this.centerBox);
  }

  initLogin() {
    const loginBtn = document.getElementById('profile');
    if (loginBtn) {
      loginBtn.addEventListener('click', async (e) => {
        const token = localStorage.getItem('authToken');
        if(token) {
          this.profileSystem.showProfile();
        }
        else{
          e.preventDefault();
          this.showAuthForm('login');
        }
        
      });
    }
  }

  initSignup() {
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
      signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAuthForm('signup');
      });
    }
  }

  showAuthForm(type) {
    
    if (this.centerBox) this.centerBox.style.display = 'none';
    
    this.content.innerHTML = this.generateAuthForm(type);
    applyAuthStyles(this.content);
    this.setupAuthForm(type);
  }

  generateAuthForm(type) {
    const isLogin = type === 'login';
    
    return `
      <div class="auth-container">
        <div class="auth-box">
          <h1 class="auth-logo">${isLogin ? 'Welcome Back, student!' : 'Create Account'}</h1>
          <p class="auth-tagline">${isLogin ? 'Sign in to your account' : 'Join us'}</p>
          
          <form id="auth-form" class="auth-form">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="yourusername" required>
                ${!isLogin ? `<small class="username-availability"></small>` : ""}
              </div>
            
            ${!isLogin ?
            `<div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="your@email.com" required>
            </div>` : ""}
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="${isLogin ? 'Password' : 'At least 8 characters'}" required minlength="8">
            </div>
            
            ${!isLogin ? `
              <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="Confirm your password" required>
              </div>
            ` : ''}
            
            <button type="submit" class="btn btn-primary">
              ${isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div class="auth-footer">
            <p>${isLogin ? 'Don\'t have an account?' : 'Already have an account?'} 
              <a href="#" id="switch-auth">${isLogin ? 'Sign up' : 'Sign in'}</a>
            </p>
          </div>
          
          <!-- Added back button here -->
          <button id="auth-back-button" class="btn btn-secondary" style="margin-top: 1.5rem;">
            Back to Main Menu
          </button>
        </div>
      </div>
    `;
}

  setupAuthForm(type) {
    const authForm = document.getElementById('auth-form');
    const switchAuth = document.getElementById('switch-auth');
    const backButton = document.getElementById('auth-back-button');
    
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleAuthSubmit(type);
    });
    
    switchAuth.addEventListener('click', (e) => {
      e.preventDefault();
      this.showAuthForm(type === 'login' ? 'signup' : 'login');
    });

    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.returnToMainMenu();
    });

    if (type === 'signup') {
      const usernameInput = document.getElementById('username');
      usernameInput.addEventListener('input', this.debounce(() => {
        this.checkUsernameAvailability(usernameInput.value);
      }, 500));
    }
  }

  returnToMainMenu() {
    if (this.centerBox) this.centerBox.style.display = "contents";
    if (this.content) {
      this.content.innerHTML = '';
      this.content.removeAttribute("style");
    }
  }

  async handleAuthSubmit(type) {
    const password = document.getElementById('password').value;
    const username =  document.getElementById('username').value;
    const email = type === 'signup' ? document.getElementById('email').value : null;
    const confirmPassword = type === 'signup' ? document.getElementById('confirm-password').value : null;

    try {
      if (type === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!username) {
          throw new Error('Username is required');
        }
      }

      let response;
      if (type === 'login') {
        response = await loginUser({ username, password });
      } else {
        const res = await registerUser({ username, email, password });
        if(!res) return;
        response = await loginUser({ username, password });
      }
      
      this.showAuthMessage(
        type === 'login' ? 'Login successful!' : 'Account created successfully!',
        'success'
      );
      
      localStorage.setItem('authToken', response.token);

      this.currentUser = response.user;
      
      setTimeout(() => {
        this.profileSystem.showProfile();
      }, 500);
      
    } catch (error) {
      this.showAuthMessage(error.message, 'error');
    }
  }

  async checkUsernameAvailability(username) {
    if (!username) return;
    
    try {
      const data = await fetchUsername(username);
      
      const availabilityElement = document.querySelector('.username-availability');
      if (data.available) {
        availabilityElement.textContent = 'Username available';
        availabilityElement.style.color = 'var(--success)';
      } else {
        availabilityElement.textContent = 'Username taken';
        availabilityElement.style.color = 'var(--accent)';
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  }

  async updateUser(userData) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Update failed');
    }
    
    return await response.json();
  }

  async deleteUser() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Deletion failed');
    }
    
    localStorage.removeItem('authToken');
    return true;
  }

  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  showAuthMessage(message, type) {
    const oldMessage = document.querySelector('.auth-message');
    if (oldMessage) oldMessage.remove();
    
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message auth-${type}`;
    messageElement.textContent = message;
    
    const form = document.getElementById('auth-form');
    form.prepend(messageElement);
    
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}

export function applyAuthStyles(element) {
    Object.assign(element.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'var(--white-1)',
      zIndex: '10'
    });
  
    const style = document.createElement('style');
    style.textContent = `
      .auth-container {
        width: 100%;
        max-width: 500px;
        padding: 2rem;
      }
      
      .auth-box {
        background: var(--white-1);
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        text-align: center;
      }
      
      .auth-logo {
        font-size: 2.2rem;
        font-weight: 400;
        letter-spacing: -0.5px;
        margin-bottom: 0.5rem;
        color: var(--black-1);
      }
      
      .auth-tagline {
        font-size: 1rem;
        color: var(--gray-2);
        margin-bottom: 2rem;
      }
      
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
      }
      
      .form-group label {
        font-size: 0.9rem;
        color: var(--gray-2);
      }
      
      .form-group input {
        padding: 1rem;
        border: 1px solid var(--gray-1);
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      
      .form-group input:focus {
        border-color: var(--black-1);
        outline: none;
      }
      
      .auth-footer {
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: var(--gray-2);
      }
      
      .auth-footer a {
        color: var(--black-1);
        text-decoration: none;
        font-weight: 500;
      }
      
      .auth-footer a:hover {
        text-decoration: underline;
      }
      
      .auth-error {
        color: var(--accent);
        padding: 0.75rem;
        background: rgba(255,0,0,0.05);
        border-radius: 6px;
        margin-bottom: 1rem;
        animation: fadeIn 0.3s ease;
      }
      
      .auth-success {
        color: var(--success);
        padding: 0.75rem;
        background: rgba(0,255,0,0.05);
        border-radius: 6px;
        margin-bottom: 1rem;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @media (max-width: 768px) {
        .auth-box {
          padding: 1.5rem;
        }
        
        .auth-logo {
          font-size: 1.8rem;
        }
      }
    `;
    document.head.appendChild(style);
  }