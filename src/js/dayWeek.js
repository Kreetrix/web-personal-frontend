import { Modal } from './modal.js';
import { openMapModal } from './map.js'; 
import { getByDay, getByWeek } from './api.js';
import generateLoadingContent from './components/loading.js';

export class DayWeekSchedule {
  constructor() {
    this.modal = new Modal();
    this.currentView = 'day';
    this.restaurantMeta = null;
    this.menuDay = null;
    this.menuWeek = null;
  }

  async show(restaurantName, restaurantMeta) {
    this.restaurantMeta = restaurantMeta; 
    const content = await this.generateContent(restaurantName);
    this.modal.create(content, { width: '800px' });
    this.setupEventListeners();
  }

  async generateContent(restaurantName) {
    return `
      <div class="schedule-container">
        <div class="schedule-header">
          <h2>${restaurantName} Schedule</h2>
          <div class="view-toggle">
            <button class="view-btn ${this.currentView === 'day' ? 'active' : ''}" data-view="day">Day</button>
            <button class="view-btn ${this.currentView === 'week' ? 'active' : ''}" data-view="week">Week</button>
            <button class="view-btn" id="open-map">Map</button> <!-- ⬅️ Map Button -->
          </div>
        </div>
        
        <div class="schedule-content">
          ${this.currentView === 'day' 
            ? await this.generateDayView() 
            : await this.generateWeekView()}
        </div>
      </div>
    `;
  }

  async generateDayView() {
    
    if(!this.menuDay) this.menuDay = await getByDay(this.restaurantMeta._id);

    return `
      <div class="day-view">
        ${this.menuDay.courses.map(course => `
          <div class="dish-item">
            <span class="dish-name">${course.name ?? "No menu for today"}</span>
            <span class="dish-diets">${course.price ?? ""} ${course.diets ?? ""}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  async generateWeekView() {

    if(!this.menuWeek) this.menuWeek = await getByWeek(this.restaurantMeta._id);

    return `
      <div class="week-view">
        ${this.menuWeek.days.map(day => `
          <div class="day-column">
            <div class="week-day">
              ${day.date}
            </div>
            ${day.courses.map(course => `
              <div class="week-item">
                <span class="dish-name">${course.name}</span>
                <span class="dish-diets">${course.price ?? ""} ${course.diets ?? ""}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  setupEventListeners() {
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(button => {
      if(button.id === "open-map"){
        button.addEventListener('click', () => {
          openMapModal(this.restaurantMeta.location.coordinates.reverse(), this.restaurantMeta.name);
        });
      }
      else {
        button.addEventListener('click', async () => {
          this.currentView = button.dataset.view;
          await this.updateView();
        });
      }
    });
  }

  async updateView() {
    const content = document.querySelector('.schedule-content');
    const buttons = document.querySelectorAll('.view-btn');

    content.innerHTML = `<div class="internal-loading"></div>`;
    const loader = content.querySelector('.internal-loading');
    loader.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === this.currentView);
    });
  
    const viewHTML = this.currentView === 'day'
      ? await this.generateDayView()
      : await this.generateWeekView();
  
    content.innerHTML = viewHTML;
  }
  
  
}
