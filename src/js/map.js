import { Modal } from './modal.js';

let mapInstance = null;

export function openMapModal(location, name) {
  const modal = new Modal();

  const content = `
    <h2 class="map-title">${name}</h2>
    <div id="restaurant-map" style="height: 400px; border-radius: 12px;"></div>
  `;

  modal.create(content, {
    width: '700px',
    animate: true,
    showCloseButton: true,
    closeOnBackdropClick: true
  });

  setTimeout(() => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    mapInstance = L.map('restaurant-map').setView(location, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    L.marker(location).addTo(mapInstance).bindPopup(name).openPopup();
  }, 100);
}
