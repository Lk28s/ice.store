let currentProduct = '';
let data = { reviews: [], sum: 0 };

async function loadProducts() {
  const res = await fetch('/api/list-products');
  const products = await res.json();

  const div = document.getElementById('products');
  div.innerHTML = '';

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => selectProduct(p.folder, p.name);
    card.innerHTML = `
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0f0&color=000" alt="${p.name}">
      <div><strong>${p.name}</strong></div>
    `;
    div.appendChild(card);
  });
}

function selectProduct(folder, name) {
  currentProduct = folder;
  document.getElementById('app').style.display = 'block';
  document.getElementById('name').textContent = name;
  loadReviews();
}

async function loadReviews() {
  const res = await fetch(`/api443/save-review?product=${encodeURIComponent(currentProduct)}`);
  data = await res.json();

  const avg = data.reviews.length ? (data.sum / data.reviews.length).toFixed(1) : '0.0';
  document.getElementById('avg').innerHTML = `<strong>Média:</strong> ${avg}/6 (${data.reviews.length} avaliações)`;

  const full = Math.round(avg);
  document.getElementById('stars').innerHTML = '★'.repeat(full) + '☆'.repeat(6 - full);

  showReviews();
}

function showReviews() {
  const list = document.getElementById('list');
  list.innerHTML = '<h3>Avaliações:</h3>';
  if (!data.reviews.length) {
    list.innerHTML += '<p style="color:#888;">Seja o primeiro!</p>';
    return;
  }
  data.reviews.forEach(r => {
    list.innerHTML += `
      <div class="review">
        <strong>${r.author}</strong> – ${'★'.repeat(r.stars)}${'☆'.repeat(6-r.stars)}<br>
        <small>${new Date(r.date).toLocaleString('pt-BR')}</small>
        <p>${r.comment}</p>
      </div>
    `;
  });
}

async function save() {
  const stars = parseInt(document.getElementById('rating').value);
  const author = document.getElementById('author').value || 'Anônimo';
  const comment = document.getElementById('comment').value;

  if (isNaN(stars)) return alert('Escolha as estrelas!');

  data.reviews.push({ stars, author, comment, date: new Date().toISOString() });
  data.sum += stars;

  await fetch('/api/save-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: currentProduct, data })
  });

  alert('Avaliação enviada!');
  document.getElementById('rating').value = '';
  document.getElementById('author').value = '';
  document.getElementById('comment').value = '';
  loadReviews();
}

loadProducts();
