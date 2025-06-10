let selectMode = false;
let selectedPerRoom = JSON.parse(localStorage.getItem("selectedCards")) || {};

function toggleSelectMode() {
  selectMode = !selectMode;
  const button = document.getElementById("toggle-select-mode");
  if (button) {
    button.textContent = selectMode ? "Exit Select Mode" : "Enter Select Mode";
  }

  document.querySelectorAll('.property-card').forEach(card => {
    card.style.cursor = selectMode ? 'pointer' : 'default';
  });
}

function handleCardClick(card, roomName) {
  if (!selectMode) return;

  const image = card.querySelector("img")?.src || "";
  const type = card.querySelector("h3")?.textContent || "";
  const price = card.querySelector("p")?.textContent || "";

  selectedPerRoom[roomName] = { image, type, price };

  localStorage.setItem("selectedCards", JSON.stringify(selectedPerRoom));
  updateSelectedCardsDisplay();
}

function updateSelectedCardsDisplay() {
  const section = document.getElementById('selected-cards-section');
  const container = document.getElementById('selected-cards');
  const totalElement = document.getElementById('total-price');

  if (!section || !container || !totalElement) return;

  container.innerHTML = '';
  let total = 0;

  Object.entries(selectedPerRoom).forEach(([roomName, { image, type, price }]) => {
    const miniCard = document.createElement("div");
    miniCard.className = "mini-card";
    miniCard.style.cssText = `
      display: inline-block;
      width: 180px;
      margin: 10px;
      padding: 10px;
      border: 2px solid #ccc;
      border-radius: 10px;
      background: #fff;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    `;

    miniCard.innerHTML = `
      <img src="${image}" alt="${type}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px;">
      <h3 style="font-size: 1rem; margin: 8px 0;">${type}</h3>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.style.cssText = `
      background: #ff4d4d;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 5px;
      cursor: pointer;
    `;
    removeBtn.onclick = () => {
      delete selectedPerRoom[roomName];
      localStorage.setItem("selectedCards", JSON.stringify(selectedPerRoom));
      updateSelectedCardsDisplay();
    };

    miniCard.appendChild(removeBtn);
    container.appendChild(miniCard);

    total += parseFloat(price.replace(/[^\d.]/g, '')) || 0;
  });

  totalElement.textContent = `Total: ₹${total.toLocaleString()}`;
  section.style.display = Object.keys(selectedPerRoom).length ? 'block' : 'none';
}

function homePageImages() {
  const container = document.getElementById("properties-container");

  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      for (const [imagePath, [roomName, roomType, roomCost]] of Object.entries(data)) {
        if (roomName.toLowerCase() !== "living room") continue;

        const card = document.createElement("div");
        card.className = "property-card";
        card.dataset.id = imagePath;
        card.innerHTML = `
          <img src="${imagePath}" alt="${roomType}">
          <h3>${roomType}</h3>
          <p>${roomCost}</p>
        `;
        card.onclick = () => handleCardClick(card, roomName.toLowerCase());
        container.appendChild(card);
      }

      // Keep select mode toggle in sync
      if (selectMode) {
        toggleSelectMode();
        toggleSelectMode();
      }
    })
    .catch(error => {
      console.error("Failed to load properties:", error);
    });

  // Render selected cards from localStorage on load
  updateSelectedCardsDisplay();
}

function navigateToRoom(value) {
  if (value) {
    location.href = `page.html?room=${value}`;
  }
}

function clearAllSelections() {
  localStorage.removeItem("selectedCards");
  selectedPerRoom = {};
  updateSelectedCardsDisplay();
}