export default function generateLoadingContent(content) {
    console.log(content)
    applyComponentStyles(content);
    content.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

function applyComponentStyles(element) {
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
    .loading {
        text-align: center;
      }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: var(--black-1);
        animation: spin 1s ease-in-out infinite;
        margin: 2rem auto;
    }`;
    document.head.appendChild(style);
}