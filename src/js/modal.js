export class Modal {
    constructor() {
      this.modal = null;
      this.backdrop = null;
      this.isOpen = false;
      this.stylesAdded = false;
    }
  
    create(content, options = {}) {
      const {
        width = '600px',
        closeOnBackdropClick = true,
        showCloseButton = true,
        animate = true
      } = options;
  
      this.backdrop = document.createElement('div');
      this.backdrop.className = `modal-backdrop ${animate ? 'animate' : ''}`;
      
      this.modal = document.createElement('div');
      this.modal.className = `modal ${animate ? 'animate' : ''}`;
      this.modal.style.width = width;
  
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.innerHTML = content;
  
      if (showCloseButton) {
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close btn';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => this.close());
        this.modal.appendChild(closeButton);
      }
  
      this.modal.appendChild(modalContent);
  
      if (closeOnBackdropClick) {
        this.backdrop.addEventListener('click', (e) => {
          if (e.target === this.backdrop) {
            this.close();
          }
        });
      }
  
      document.body.appendChild(this.backdrop);
      document.body.appendChild(this.modal);
  
      this.addStyles();
  
      setTimeout(() => {
        this.backdrop.classList.add('show');
        this.modal.classList.add('show');
      }, 10);
  
      this.isOpen = true;
    }
  
    close() {
      if (!this.isOpen) return;
  
      this.backdrop.classList.remove('show');
      this.modal.classList.remove('show');
  
      setTimeout(() => {
        this.backdrop.remove();
        this.modal.remove();
        this.isOpen = false;
      }, 300);
    }
  
    addStyles() {
      if (this.stylesAdded) return;
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './css/modal.css';
      link.id = 'modal-styles';
      
      document.head.appendChild(link);
      this.stylesAdded = true;
    }
  }