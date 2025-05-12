import { getRestaurants, favRestaurant, fetchUserData } from "./api.js";
import { DayWeekSchedule } from "./dayWeek.js";
import { AuthSystem } from "./user/auth.js";
import generateLoadingContent from "./components/loading.js";

const FADE_HEIGHT = 200; 
const scheduleModal = new DayWeekSchedule();
new AuthSystem();

const content = document.getElementById("content");
const centerBox = document.querySelector(".centerBox");

export function initNavigation() {
  const menuBtn = document.getElementById("restaurants");
  if (menuBtn) menuBtn.addEventListener("click", showMenuGrid);
  navButtons();
}

async function showMenuGrid() {
  centerBox.style.display = "none";

  generateLoadingContent(content);

  const restaurants = await getRestaurants();

  content.innerHTML = `
    <div class="menu-container">
      <div class="menu-controls">
        <div class="filter-controls">
          <div class="filter-group">
            <label for="city-filter">City:</label>
            <select id="city-filter" class="filter-select">
              <option value="">All Cities</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="company-filter">Company:</label>
            <select id="company-filter" class="filter-select">
              <option value="">All Companies</option>
            </select>
          </div>
        </div>
        <div class="results-count"></div>
      </div>
      
      <div class="menu-grid" id="restaurantGrid"></div>
      <div class="fade-overlay"></div>
      
      <button id="backButton" class="btn btn-primary">Back to Home</button>
    </div>
  `;

  applyFullPageStyles(content);

  await setupFilters(restaurants);
  await renderRestaurants(restaurants);

  document.getElementById("backButton").addEventListener("click", () => {
    centerBox.style.display = "contents";
    content.innerHTML = '';
    content.removeAttribute("style");
  });
}

async function setupFilters(restaurants) {
  const cityFilter = document.getElementById("city-filter");
  const companyFilter = document.getElementById("company-filter");

  const cities = [...new Set(restaurants.map(r => r.city))];
  const company = [...new Set(restaurants.map(r => r.company))];

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });

  company.forEach(company => {
    const option = document.createElement("option");
    option.value = company;
    option.textContent = company;
    companyFilter.appendChild(option);
  });

  cityFilter.addEventListener("change", () => filterRestaurants());
  companyFilter.addEventListener("change", () => filterRestaurants());
}

async function filterRestaurants() {
  const cityFilter = document.getElementById("city-filter").value;
  const companyFilter = document.getElementById("company-filter").value;

  const restaurants = await getRestaurants();

  const filtered = restaurants.filter(restaurant => {
    const cityMatch = !cityFilter || restaurant.city === cityFilter;
    const companyMatch = !companyFilter || restaurant.company === companyFilter;
    return cityMatch && companyMatch;
  });

  renderRestaurants(filtered);
}

async function renderRestaurants(restaurants) {
  const restaurantGrid = document.getElementById("restaurantGrid");
  const resultsCount = document.querySelector(".results-count");

  let favouriteRestaurant;
  try {
    const userData = await fetchUserData();
    favouriteRestaurant = userData.favouriteRestaurant || "";
  } catch (error) {  }

  const sortedRestaurants = restaurants.sort((a, b) => {
    if (a._id === favouriteRestaurant) return -1;
    if (b._id === favouriteRestaurant) return 1;
    return 0;
  });


  restaurantGrid.innerHTML = sortedRestaurants.map(item => {
    console.log("item, ", item)
    const isFavorite = favouriteRestaurant.includes(item._id);
    return `
    <div class="menu-card" data-restaurant-id="${item._id}">
      <div class="menu-card-header">
        <h3>${item.name}</h3>
        ${localStorage.getItem('authToken') ? `
          <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-restaurant-id="${item._id}">
            ${isFavorite ? '❤️‍🔥' : '🤍'}
          </button>
        ` : ''}
      </div>
      <p class="address">${item.address}</p>
      <p class="city">${item.city}</p>
      <p class="company">Company: ${item.company}</p>
    </div>
  `}).join("");

  resultsCount.textContent = `Showing ${restaurants.length} restaurants`;

  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.closest('.favorite-btn')) return;
      
      const restaurantId = card.dataset.restaurantId;
      const restaurantName = card.querySelector('h3').textContent;
      const restaurant = restaurants.find(item => item._id === restaurantId);

      scheduleModal.show(restaurantName, restaurant);
    });
  });

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      let restaurantId = btn.dataset.restaurantId;
      
      try {
        await favRestaurant(restaurantId);
        
        btn.classList.toggle('favorited');
        btn.textContent = btn.classList.contains('favorited') ? '❤️‍🔥' : '🤍';
        const updatedRestaurants = await getRestaurants();
        renderRestaurants(updatedRestaurants);
      } catch (error) {
        console.error('Failed to toggle favorite', error);
        alert('Failed to update favorite. Please try again.');
      }
    });
  });
}

function navButtons() {
  document.getElementById("home").addEventListener("click", () => {
    centerBox.style.display = "contents";
    content.innerHTML = '';
    content.removeAttribute("style");
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
    
    .filter-controls {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--gray-2);
      min-width: 200px;
    }
    
    .results-count {
      font-size: 0.9rem;
      color: var(--gray-2);
    }
    
    .menu-grid {
      padding: 0px 100px 0px 100px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding-bottom: ${FADE_HEIGHT}px;
      overflow: auto
    }
    
    .fade-overlay {
      position: fixed;
      bottom: calc(2rem + 60px);
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
    .menu-card .city,
    .menu-card .company {
      font-size: 0.9rem;
      color: var(--gray-2);
      margin-bottom: 0.3rem;
    }
    
    #backButton {
      margin-top: auto;
      align-self: center;
    }
    
    @media (max-width: 768px) {
      .menu-grid {
        grid-template-columns: 1fr;
        padding: 0 1rem;
      }
      
      .filter-controls {
        flex-direction: column;
        align-items: center;
      }
    }
  `;
  document.head.appendChild(style);
}