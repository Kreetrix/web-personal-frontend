import { getRestaurants } from "./api.js";

const VISIBLE_THRESHOLD = 6; 
const FADE_HEIGHT = 200; 

export function initNavigation() {
  const menuBtn = document.getElementById("restaurants");
  if (menuBtn) menuBtn.addEventListener("click", showMenuGrid);
}

async function showMenuGrid() {
  const content = document.getElementById("content");
  const centerBox = document.querySelector(".centerBox");

  centerBox.style.display = "none";

  content.innerHTML = `
    <div class="menu-container">
      <div class="menu-controls">
        <div class="sort-controls">
          <button class="sort-btn active" data-sort="name">Name</button>
          <button class="sort-btn" data-sort="city">City</button>
          <button class="sort-btn" data-sort="address">Area</button>
        </div>
        <div class="results-count">Showing <span id="visibleCount">0</span> of <span id="totalCount">0</span> restaurants</div>
      </div>
      
        <div class="menu-grid" id="restaurantGrid"></div>
        <div class="fade-overlay"></div>
      
      <button id="backButton" class="btn btn-primary">Back to Home</button>
    </div>
  `;

  applyFullPageStyles(content);
  await renderRestaurants();
  setupSorting();

  document.getElementById("backButton").addEventListener("click", () => {
    centerBox.style.display = "contents";
    content.innerHTML = '';
    content.removeAttribute("style");
  });
}

async function renderRestaurants() {
  const restaurantGrid = document.getElementById("restaurantGrid");
  const menuItems = await getRestaurants();
  const totalCount = document.getElementById("totalCount");
  const visibleCount = document.getElementById("visibleCount");

  totalCount.textContent = menuItems.length;
  visibleCount.textContent = VISIBLE_THRESHOLD;

  restaurantGrid.innerHTML = menuItems.map(item => `
    <div class="menu-card">
      <h3>${item.name}</h3>
      <p class="address">${item.address}</p>
      <p class="city">${item.city}</p>
    </div>
  `).join("");
}

async function setupSorting() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const sortBy = this.dataset.sort;
      const menuItems = await getRestaurants();
      const sortedItems = sortRestaurants(menuItems, sortBy);
      
      const restaurantGrid = document.getElementById("restaurantGrid");
      restaurantGrid.innerHTML = sortedItems.map(item => `
        <div class="menu-card">
          <h3>${item.name}</h3>
          <p class="address">${item.address}</p>
          <p class="city">${item.city}</p>
        </div>
      `).join('');
      
      document.querySelector(".menu-scroll-container").scrollTop = 0;
    });
  });
}

function sortRestaurants(restaurants, key) {
  return [...restaurants].sort((a, b) => {
    const valA = a[key]?.toLowerCase() || '';
    const valB = b[key]?.toLowerCase() || '';
    return valA.localeCompare(valB);
  });
}

function applyFullPageStyles(element) {
  Object.assign(element.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    padding: "2rem",
    background: "var(--white-1)",
    zIndex: "10"
  });

  const style = document.createElement('style');
  style.textContent = `
    .menu-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 1.5rem;
    }
    
    .menu-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .sort-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    
    .results-count {
      font-size: 0.9rem;
      color: var(--gray-2);
    }
    
    .sort-btn {
      padding: 0.5rem 1rem;
      background: transparent;
      color: var(--black-1);
      border: 1px solid var(--black-1);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .sort-btn.active {
      background: var(--black-1);
      color: var(--white-1);
    }
    
    .menu-scroll-container {
      flex: 1;
      overflow-y: auto;
      position: relative;
      margin: 0 -2rem;
      padding: 0 2rem;
    }
    
    .menu-grid {
      padding: 0px 100px 0px 100px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(4, 1fr);
      grid-column-gap: 0px;
      grid-row-gap: 0px; 
      overflow: auto;
      flex-direction: row;
      gap: 1.5rem;
      flex-wrap: wrap;
      padding-bottom: ${FADE_HEIGHT}px;
    }
    
    .fade-overlay {
      position: fixed;
      bottom: calc(2rem + 60px); /* Above back button */
      left: 0;
      right: 0;
      height: ${FADE_HEIGHT}px;
      background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--white-1) 100%);
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .menu-card {
      background: var(--white-1);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .menu-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .menu-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      color: var(--black-1);
    }
    
    .menu-card .address,
    .menu-card .city {
      font-size: 0.9rem;
      color: var(--gray-2);
      margin-bottom: 0.3rem;
    }
    
    #backButton {
      margin-top: auto;
      align-self: center;
    }
    
    @media (max-width: 768px) {
      .sort-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);
}