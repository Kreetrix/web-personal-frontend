import { fetchUserData, uploadAvatar, updateUser, getRestaurant } from "../api.js";
import generateLoadingContent from "../components/loading.js";
import { Modal } from '../modal.js';

export class ProfileSystem {
  constructor(contentElement, centerBoxElement) {
    this.content = contentElement;
    this.centerBox = centerBoxElement;
    this.userData = null;
    this.modal = new Modal();
    this.restaurant = null;
  }

  async showProfile() {
    try {
      if (this.centerBox) this.centerBox.style.display = 'none';
      
      generateLoadingContent(this.content);
      applyProfileStyles(this.content);
      
      this.userData = await fetchUserData();

      if(this.userData.favouriteRestaurant) {
        this.restaurant = await getRestaurant(this.userData.favouriteRestaurant);
      }
      
      this.content.innerHTML = this.generateProfileContent();
      this.setupProfileEvents();
      
    } catch (error) {
      this.showErrorState(error.message);
    }
  }

  generateProfileContent() {
    if (!this.userData) return '';    
    const { username, email, favouriteRestaurant, role, avatar } = this.userData;
    
    return `
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">
            ${`<img src="https://media2.edu.metropolia.fi/restaurant/uploads/${avatar}" alt="${username}'s avatar">`}
          </div>
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
          
          ${favouriteRestaurant ? `
            <div class="detail-row">
              <span class="detail-label">Favorite Restaurant:</span>
              <span class="detail-value">${this.restaurant.name}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="profile-actions">
          <button id="edit-profile" class="btn btn-primary">Edit Profile</button>
          <button id="change-avatar" class="btn btn-secondary">Change Avatar</button>
          <button id="back-button" class="btn">Back to Main</button>
          <button id="logout" class="btn">Logout</button>
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

    document.getElementById('logout').addEventListener('click', async () => {
      localStorage.removeItem('authToken');
      await this.showProfile();
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
  
      changeAvatarBtn.addEventListener('click', () => fileInput.click());
    }
  
    const editProfileBtn = document.getElementById('edit-profile');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => this.openEditModal());
    }
  }

  async changeAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const avatarBtn = document.getElementById('change-avatar');
      avatarBtn.disabled = true;
      avatarBtn.textContent = 'Uploading...';

      const result = await uploadAvatar(file);
      if (result) {
        await this.showProfile();
        this.showAuthMessage('Avatar updated successfully!', 'success');
      }
        
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
  
  openEditModal() {
    const { username, email } = this.userData;
  
    const modalContent = `
      <div class="edit-profile-modal">
        <h2>Edit Profile</h2>
        <form id="edit-profile-form" class="edit-form">
          <label>
            Username:
            <input type="text" name="username" value="${username}" required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value="${email}" required />
          </label>
          <label>
            Password:
            <input type="password" name="password" placeholder="Password" />
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" id="cancel-edit" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    `;
  
    this.modal.create(modalContent, { width: '500px' });
  
    const form = document.getElementById('edit-profile-form');
    form.addEventListener('submit', async (e) => await this.submitEditForm(e));
  
    document.getElementById('cancel-edit').addEventListener('click', () => {
      this.modal.close();
    });
  }

  async submitEditForm(e) {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const updatedData = {
      username: formData.get('username'),
      email: formData.get('email')
    };

    const password = formData.get('password');
    if (password.trim() !== '') {
      updatedData.password = password;
    }

    try {
      await updateUser(updatedData);
      this.modal.close();
      this.showAuthMessage('Profile updated successfully!', 'success');
      
      await this.showProfile();
    } catch (error) {
      this.showAuthMessage(error.message, 'error');
    }
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
        margin-top: 1rem;
      }
      
      .profile-avatar {
        width: 120px;
        height: 120px;
        margin: 0 auto 1rem;
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
      
      .profile-error {
        text-align: center;
        color: var(--accent);
        padding: 2rem;
      }
      
      .edit-profile-modal h2 {
        margin-bottom: 1rem;
        text-align: center;
      }

      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .edit-form label {
        display: flex;
        flex-direction: column;
        font-weight: 500;
      }

      .edit-form input {
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid var(--gray-1);
        border-radius: 4px;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1rem;
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