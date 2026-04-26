let products = [];

async function init() {
  const config = await loadConfig();
  setupConfig(config);

  products = await loadProducts();
  render(products);

  document.getElementById("search").addEventListener("input", e => {
    const val = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(val)
    );
    render(filtered);
  });
}

async function loadProducts() {
  const text = await fetch(PRODUCTS).then(r => r.text());
  const rows = text.split("\n").slice(1);

  return rows.map(r => {
    const c = r.split(",");
    return {
      code: c[0],
      category: c[1],
      name: c[2],
      description: c[3],
      width: c[4],
      depth: c[5],
      height: c[6],
      old: c[7],
      price: c[8],
      img: fix(c[10])
    };
  });
}

async function loadConfig() {
  const text = await fetch(CONFIG).then(r => r.text());
  const c = text.split("\n")[1].split(",");

  return {
    phone: c[0],
    wa: c[1],
    logo: fix(c[7])
  };
}

function setupConfig(c) {
  if (c.logo) document.getElementById("logo").src = c.logo;
  if (c.phone) document.getElementById("callBtn").href = "tel:" + c.phone;
  if (c.wa) document.getElementById("waBtn").href = "https://wa.me/" + c.wa;
}

function render(data) {
  const el = document.getElementById("products");
  el.innerHTML = "";

  data.forEach(p => {
    el.innerHTML += `
    <div class="card">
      ${p.img ? `<img src="${p.img}">` : ""}
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>

        ${p.old ? `<div class="price-old">${p.old}₾</div>` : ""}
        ${p.price ? `<div class="price-new">${p.price}₾</div>` : ""}
      </div>
    </div>`;
  });
}

function fix(url) {
  if (!url) return "";
  const m = url.match(/\/d\/(.*?)\//);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}

init();
