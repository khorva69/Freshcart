// Variables for DOM elements
const burgerButton = document.getElementById('burgerButton');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');
const contentPanel = document.getElementById('contentPanel');
const contentTitle = document.getElementById('contentTitle');
const contentBody = document.getElementById('contentBody');
const closeBtn = contentPanel.querySelector('.close-btn');

const modal = document.getElementById('orderModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalSendOrderBtn = document.getElementById('modalSendOrderBtn');
const modalPaymentBtn = document.getElementById('modalPaymentBtn');
const footerSendOrderBtn = document.querySelector('footer button[type="button"]');
const cartButton = document.getElementById('cartButton');
const orderSummary = document.getElementById('order-summary');

const paymentLink = 'https://egreve.bog.ge/G10o';

let productsByCategory = {};
let selectedProducts = {};
let filteredProductsByCategory = {};

// Load products from JSON
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    productsByCategory = await response.json();
    filteredProductsByCategory = {...productsByCategory};
    renderProducts(filteredProductsByCategory);
  } catch (error) {
    console.error('პროდუქტების ჩატვირთვა ვერ მოხერხდა:', error);
  }
}

// Menu open/close
function openMenu() {
  sideMenu.classList.add('open');
  overlay.classList.add('visible');
  burgerButton.setAttribute('aria-expanded', 'true');
  burgerButton.classList.add('open');
  mainContent.style.filter = 'blur(3px)';
  sideMenu.focus();
}

function closeMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('visible');
  burgerButton.setAttribute('aria-expanded', 'false');
  burgerButton.classList.remove('open');
  mainContent.style.filter = 'none';
  burgerButton.focus();
}

burgerButton.addEventListener('click', () => {
  if (sideMenu.classList.contains('open')) closeMenu();
  else openMenu();
});

burgerButton.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    burgerButton.click();
  }
});

overlay.addEventListener('click', () => {
  closeMenu();
  closeContentPanel();
});

// Sections content for side menu
const sectionsContent = {
  rules: {
    title: 'წესდება',
    html: `<ul>
      <li>არარეალური ან ფიქტიური შეკვეთების შემთხვევაში მოხდება მომხმარებლის დაბლოკვა.</li>
      <li>დაიცავით პატივი კურიერისა და მისი სამუშაო დროის მიმართ.</li>
      <li>მიწოდების მისამართი მიუთითეთ სრულად და ზუსტად.</li>
      <li>ტელეფონის ნომერი უნდა იყოს სწორი და მოქმედი.</li>
      <li>დადასტურებული შეკვეთის გაუქმება შეუძლებელია.</li>
      <li>დახმარებისა და დეტალური ინფორმაციისთვის გაეცანით ინსტრუქციას.</li>
    </ul>`
  },
  instructions: {
    title: 'ინსტრუქცია',
    html: `<ol>
      <li>აირჩიეთ სასურველი პროდუქტები და დაარეგულირეთ მათი რაოდენობა.</li>
      <li>დააჭირეთ ღილაკს "შეკვეთის გაგზავნა".</li>
      <li>გახსნილ ფანჯარაში ყურადღებით გაეცანით შეტყობინებას.</li>
      <li>დაადასტურეთ შეკვეთა ფანჯარაში განთავსებული შესაბამისი ღილაკით.</li>
      <li>გაგზავნის შემდეგ დაბრუნდით ვებსაიტზე და დააჭირეთ ღილაკს "გადახდა".</li>
      <li>გადახდის ბმულზე გადასვლისას მიუთითეთ შეკვეთის სრული თანხა.</li>
      <li>დანიშნულების ველში მიუთითეთ თქვენი ტელეფონის ნომერი, რათა შესაძლებელი იყოს გადამხდელის იდენტიფიკაცია.</li>
    </ol>`
  },
  cities: {
    title: 'მოქმედი ქალაქები',
    html: `<p>ჩვენი სერვისი მოქმედებს შემდეგ ქალაქებში:</p><ul><li>თბილისი</li><li>ბათუმი</li><li>ქუთაისი</li><li>რუსთავი</li><li>გორი</li></ul>`
  }
};

function showContentPanel(sectionKey) {
  const section = sectionsContent[sectionKey];
  if (!section) return;
  contentTitle.textContent = section.title;
  contentBody.innerHTML = section.html;
  contentPanel.classList.add('active');
  overlay.classList.add('visible');
  mainContent.style.filter = 'blur(3px)';
  closeMenu();
  contentPanel.focus();
}

function closeContentPanel() {
  contentPanel.classList.remove('active');
  overlay.classList.remove('visible');
  mainContent.style.filter = 'none';
  burgerButton.focus();
}

sideMenu.querySelectorAll('button.menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    showContentPanel(btn.getAttribute('data-section'));
  });
});

closeBtn.addEventListener('click', closeContentPanel);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (contentPanel.classList.contains('active')) closeContentPanel();
    else if (sideMenu.classList.contains('open')) closeMenu();
    else if (!modal.hidden) closeOrderModal();
  }
});

// Product rendering and interaction
function createProductCard(product) {
  const selected = selectedProducts[product.id];
  return `
    <article class="product-card${selected ? ' selected' : ''}" tabindex="0" aria-pressed="${!!selected}" role="button" onclick="toggleProduct(${product.id})" onkeydown="if(event.key==='Enter' || event.key===' ') toggleProduct(${product.id})">
      <div class="product-header">
        <h3 class="product-name">${product.name}</h3>
        <div class="price-tag" aria-label="ფასი">${product.price.toFixed(2)}₾</div>
      </div>
      <div class="quantity-controls" aria-label="რაოდენობის კონტროლი: ${product.name}">
        <button type="button" aria-label="რაოდენობის შემცირება" onclick="adjustQuantity(event, ${product.id}, -1)">−</button>
        <input type="number" class="quantity-input" id="qty-${product.id}" min="0" value="${selected ? selected.quantity : 0}" aria-live="polite" aria-atomic="true" aria-label="რაოდენობა: ${product.name}" onchange="updateQuantity(event, ${product.id}, this.value)" />
        <button type="button" aria-label="რაოდენობის გაზრდა" onclick="adjustQuantity(event, ${product.id}, 1)">+</button>
      </div>
    </article>
  `;
}

function renderProducts(filtered = filteredProductsByCategory) {
  const container = document.getElementById('productContainer');
  let html = '';
  for (const [category, items] of Object.entries(filtered)) {
    if (items.length === 0) continue;
    let categoryName = category;
    switch(category) {
      case 'რძის_პროდუქტები': categoryName = 'რძის პროდუქტები'; break;
      case 'საყხობი': categoryName = 'საყხობი'; break;
      case 'ხილი_ბოსტნეული': categoryName = 'ხილი და ბოსტნეული'; break;
      case 'ხორცი': categoryName = 'ხორცი'; break;
    }
    html += `<div class="category-header">${categoryName}</div><div class="product-list">`;
    for (const product of items) {
      html += createProductCard(product);
    }
    html += `</div>`;
  }
  container.innerHTML = html;
  updateTotals();
}

function toggleProduct(id) {
  if (selectedProducts[id]) {
    delete selectedProducts[id];
  } else {
    const product = findProductById(id);
    selectedProducts[id] = { ...product, quantity: 1 };
  }
  renderProducts(filteredProductsByCategory);
}

function adjustQuantity(event, id, delta) {
  event.stopPropagation();
  const current = selectedProducts[id]?.quantity || 0;
  const newQty = Math.max(0, current + delta);
  updateQuantity(event, id, newQty);
}

function updateQuantity(event, id, value) {
  event.stopPropagation();
  let qty = parseInt(value);
  if (isNaN(qty) || qty < 0) qty = 0;
  if (qty === 0) {
    delete selectedProducts[id];
  } else {
    const product = findProductById(id);
    selectedProducts[id] = { ...product, quantity: qty };
  }
  renderProducts(filteredProductsByCategory);
}

function findProductById(id) {
  for (const items of Object.values(productsByCategory)) {
    const found = items.find(p => p.id === id);
    if (found) return found;
  }
  return null;
}

function updateTotals() {
  const summaryItems = document.getElementById('summaryItems');
  const summaryTotal = document.getElementById('summaryTotal');
  let total = 0;
  if (Object.keys(selectedProducts).length === 0) {
    summaryItems.textContent = 'არცერთი პროდუქტი არ არის არჩეული';
    summaryTotal.textContent = '₾0.00';
    return;
  }
  let html = '';
  for (const item of Object.values(selectedProducts)) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `<div>${item.name} (${item.quantity}): ${itemTotal.toFixed(2)}₾</div>`;
  }
  summaryItems.innerHTML = html;
  summaryTotal.textContent = `${total.toFixed(2)}₾`;
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Filter products by search
function filterProducts() {
  const query = document.getElementById('productSearch').value.toLowerCase();
  filteredProductsByCategory = {};
  for (const [category, items] of Object.entries(productsByCategory)) {
    filteredProductsByCategory[category] = items.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  }
  renderProducts(filteredProductsByCategory);
}

// Send order via mailto
function sendOrder() {
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!phone.match(/^\d{9}$/)) {
    alert('გთხოვთ შეიყვანოთ სწორი 9-ციფრიანი ტელეფონის ნომერი.');
    return;
  }
  if (Object.keys(selectedProducts).length === 0) {
    alert('გთხოვთ აირჩიოთ მინიმუმ ერთი პროდუქტი.');
    return;
  }
  if (!address) {
    alert('გთხოვთ მიუთითოთ მიწოდების მისამართი.');
    return;
  }

  const orderLines = Object.values(selectedProducts).map(item =>
    `${item.name} (${item.quantity}): ${(item.price * item.quantity).toFixed(2)}₾`
  ).join('\n- ');

  const total = Object.values(selectedProducts).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const body = `
📞 ტელეფონი: ${phone}

🧾 შეკვეთის დეტალები:
- ${orderLines}

💵 ჯამი: ${total.toFixed(2)}₾

📍 მიწოდების მისამართი:
${address}
`.trim();

  window.location.href = `mailto:admin@example.com?subject=ახალი კურიერის შეკვეთა&body=${encodeURIComponent(body)}`;

  showToast('შეკვეთა წარმატებით გაიგზავნა!');
}

// Modal management
function openOrderModal() {
  modal.hidden = false;
  modal.classList.add('show');
  modalOverlay.classList.add('show');
  mainContent.style.filter = 'blur(3px)';
  modal.focus();
}

function closeOrderModal() {
  modal.classList.remove('show');
  modalOverlay.classList.remove('show');
  mainContent.style.filter = 'none';
  modal.hidden = true;
  footerSendOrderBtn.focus();
}

// Event listeners for modal buttons
footerSendOrderBtn.removeEventListener('click', sendOrder);
footerSendOrderBtn.addEventListener('click', e => {
  e.preventDefault();
  openOrderModal();
});

modalSendOrderBtn.addEventListener('click', () => {
  closeOrderModal();
  sendOrder();
});

modalPaymentBtn.addEventListener('click', () => {
  window.open(paymentLink, '_blank', 'noopener');
  closeOrderModal();
});

modalCloseBtn.addEventListener('click', closeOrderModal);
modalOverlay.addEventListener('click', closeOrderModal);

// Product search input
document.getElementById('productSearch').addEventListener('input', filterProducts);

// Save phone input to localStorage
document.getElementById('phone').addEventListener('input', e => {
  localStorage.setItem('lastPhone', e.target.value);
});

// Load last phone and products on window load
window.onload = () => {
  loadProducts();
  const lastPhone = localStorage.getItem('lastPhone');
  if (lastPhone) {
    document.getElementById('phone').value = lastPhone;
  }
};

// Slideshow
const images = [
  'https://i.postimg.cc/Y9WRYCk8/Picsart-25-06-17-17-52-33-620.jpg',
  'https://i.postimg.cc/43wBsSPb/Picsart-25-06-17-17-57-33-801.jpg',
  'https://i.postimg.cc/sxWLjJvj/Picsart-25-06-17-17-53-42-737.jpg',
  'https://i.postimg.cc/Kc3wDmQ6/Picsart-25-06-17-17-56-37-707.jpg'
];

const slideshow = document.querySelector('.slideshow');
let currentIndex = 0;

images.forEach((src, index) => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = `სურათი ${index + 1}`;
  if (index === 0) img.classList.add('active');
  slideshow.appendChild(img);
});

const slides = slideshow.querySelectorAll('img');

function showNextSlide() {
  slides[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % slides.length;
  slides[currentIndex].classList.add('active');
}

setInterval(showNextSlide, 3000);

// Cart button scroll to order summary
cartButton.addEventListener('click', () => {
  orderSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  orderSummary.style.outline = '0px solid var(--primary)';
  setTimeout(() => {
    orderSummary.style.outline = 'none';
  }, 2000);
});

// Expose functions globally for inline handlers
window.toggleProduct = toggleProduct;
window.adjustQuantity = adjustQuantity;
window.updateQuantity = updateQuantity;
window.sendOrder = sendOrder;
