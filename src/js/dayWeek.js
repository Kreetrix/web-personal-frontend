import { Modal } from './modal.js';
import { openMapModal } from './map.js'; // ⬅️ import the map modal

export class DayWeekSchedule {
  constructor() {
    this.modal = new Modal();
    this.currentView = 'day';
    this.scheduleData = null;
    this.restaurantMeta = null;
  }

  show(scheduleData, restaurantName, restaurantMeta) {
    this.restaurantMeta = restaurantMeta; 
    const content = this.generateContent(scheduleData, restaurantName);
    this.modal.create(content, { width: '800px' });
    this.setupEventListeners();
    this.scheduleData = scheduleData;
  }

  generateContent(scheduleData, restaurantName) {
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
            ? this.generateDayView(scheduleData.today) 
            : this.generateWeekView(scheduleData.week)}
        </div>
      </div>
    `;
  }

  generateDayView(courses) {
    return `
      <div class="day-view">
        ${courses.map(course => `
          <div class="dish-item">
            <span class="dish-name">${course.name}</span>
            <span class="dish-diets">${course.price ?? ""} ${course.diets ?? ""}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateWeekView(weekSchedule) {
    return `
      <div class="week-view">
        ${weekSchedule.days.map(day => `
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
        button.addEventListener('click', () => {
          this.currentView = button.dataset.view;
          this.updateView();
        });
      }
    });
  }

  updateView() {
    const content = document.querySelector('.schedule-content');
    const buttons = document.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === this.currentView);
    });
    
    content.innerHTML = this.currentView === 'day'
      ? this.generateDayView(this.scheduleData.today)
      : this.generateWeekView(this.scheduleData.week);
  }
}
