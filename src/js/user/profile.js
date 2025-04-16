import { fetchUserData, uploadAvatar } from "../api.js";

export class ProfileSystem {
  constructor(contentElement, centerBoxElement) {
    this.content = contentElement;
    this.centerBox = centerBoxElement;
    this.userData = null;
  }

  async showProfile() {
    try {
      if (this.centerBox) this.centerBox.style.display = 'none';
      
      this.content.innerHTML = this.generateLoadingContent();
      applyProfileStyles(this.content);
      
      this.userData = await fetchUserData();
      
      this.content.innerHTML = this.generateProfileContent();
      this.setupProfileEvents();
      
    } catch (error) {
      this.showErrorState(error.message);
    }
  }

  generateLoadingContent() {
    return `
      <div class="profile-container">
        <div class="profile-loading">
          <div class="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    `;
  }

  generateProfileContent() {
    if (!this.userData) return '';

    console.log(this.userData)
    
    const { username, email, favouriteRestaurant, role, avatar } = this.userData;
    
    return `
      <div class="profile-container">
        <div class="profile-header">
          <h1 class="profile-title">Your Profile</h1>
        </div>
        
        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">Username:</span>
            <span class="detail-value">${username}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${email}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Role:</span>
            <span class="detail-value">${role}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Avatar file name:</span>
            <span class="detail-value">${avatar ?? "no avatar"}</span>
          </div>
          
          ${favouriteRestaurant ? `
            <div class="detail-row">
              <span class="detail-label">Favorite Restaurant:</span>
              <span class="detail-value">${favouriteRestaurant}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="profile-actions">
          <button id="edit-profile" class="btn btn-primary">Edit Profile</button>
          <button id="change-avatar" class="btn btn-secondary">Change Avatar</button>
          <button id="back-button" class="btn">Back to Main</button>
        </div>
      </div>
    `;
  }

  setupProfileEvents() {
    document.getElementById('back-button').addEventListener('click', () => {
        if (this.centerBox) this.centerBox.style.display = 'contents';
        this.content.innerHTML = '';
        this.content.removeAttribute('style');
    });

    const changeAvatarBtn = document.getElementById('change-avatar');
    if (changeAvatarBtn) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'avatar-upload';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => this.changeAvatar(e));
        
        changeAvatarBtn.parentNode.insertBefore(fileInput, changeAvatarBtn);
        
        changeAvatarBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
  }

  editProfile() {
    console.log('sus');
  }

  async changeAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const avatarBtn = document.getElementById('change-avatar');
      avatarBtn.disabled = true;
      avatarBtn.textContent = 'Uploading...';

      const result = await uploadAvatar(file);
      if (result) this.showAuthMessage('Avatar updated successfully!', 'success');
        
    } catch (error) {
      this.showAuthMessage(error.message, 'error');
    } finally {
      const avatarBtn = document.getElementById('change-avatar');
      if (avatarBtn) {
        avatarBtn.disabled = false;
        avatarBtn.textContent = 'Change Avatar';
      }
    }
  }
  
  //TODO make a components
  showAuthMessage(message, type) {
    const oldMessage = document.querySelector('.profile-message');
    if (oldMessage) oldMessage.remove();
    
    const messageElement = document.createElement('div');
    messageElement.className = `profile-message profile-${type}`;
    messageElement.textContent = message;
    
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.insertBefore(messageElement, profileContainer.firstChild);
        
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
  }

  showErrorState(message) {
    this.content.innerHTML = `
      <div class="profile-container">
        <div class="profile-error">
          <p>${message}</p>
          <button id="retry-button" class="btn btn-primary">Retry</button>
          <button id="back-button" class="btn">Back to Main</button>
        </div>
      </div>
    `;
    
    document.getElementById('retry-button').addEventListener('click', () => this.showProfile());
    document.getElementById('back-button').addEventListener('click', () => {
      if (this.centerBox) this.centerBox.style.display = 'contents';
      this.content.innerHTML = '';
      this.content.removeAttribute('style');
    });
  }
}

function applyProfileStyles(element) {
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
      .profile-container {
        width: 100%;
        max-width: 600px;
        padding: 2rem;
      }
      
      .profile-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      
      .profile-title {
        font-size: 2rem;
        font-weight: 400;
        color: var(--black-1);
        margin-bottom: 1rem;
      }
      
      .profile-avatar {
        width: 120px;
        height: 120px;
        margin: 0 auto 1.5rem;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--gray-1);
      }
      
      .profile-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .profile-details {
        background: var(--white-1);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 2rem;
      }
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.8rem 0;
        border-bottom: 1px solid var(--gray-1);
      }
      
      .detail-row:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        font-weight: 500;
        color: var(--black-1);
      }
      
      .detail-value {
        color: var(--gray-2);
      }
      
      .profile-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .profile-loading {
        text-align: center;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0,0,0,0.1);
        border-radius: 50%;
        border-top-color: var(--black-1);
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
      
      .profile-error {
        text-align: center;
        color: var(--accent);
        padding: 2rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      @media (max-width: 768px) {
        .profile-container {
          padding: 1.5rem;
        }
        
        .profile-title {
          font-size: 1.8rem;
        }
        
        .profile-avatar {
          width: 100px;
          height: 100px;
        }
        
        .profile-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }