let allProducts = [];
let companyConfig = {};

document.addEventListener("DOMContentLoaded", async () => {
  companyConfig = await loadConfig();
  setupCompanyInfo(companyConfig);

  allProducts = await loadProducts();
  renderCategoryFilter(allProducts);
  renderProducts(allProducts);

  document.getElementById("searchInput").addEventListener("input", filterProducts);
  document.getElementById("categoryFilter").addEventListener("change", filterProducts);
});

async function loadProducts() {
  const csv = await fetch(PRODUCTS_CSV_URL).then(res => res.text());
  const rows = parseCSV(csv);

  return rows.slice(1).map(row => ({
    code: clean(row[0]),
    category: clean(row[1]),
    name: clean(row[2]),
    description: clean(row[3]),
    width: clean(row[4]),
    depth: clean(row[5]),
    height: clean(row[6]),
    priceOld: clean(row[7]),
    priceNew: clean(row[8]),
    priceWholesale: clean(row[9]),
    imageMain: fixDriveImage(clean(row[10])),
    color1: clean(row[11]),
    image1: fixDriveImage(clean(row[12])),
    color2: clean(row[13]),
    image2: fixDriveImage(clean(row[14])),
    color3: clean(row[15]),
    image3: fixDriveImage(clean(row[16])),
    status: clean(row[17])
  })).filter(product => product.status.toLowerCase() !== "hidden");
}

async function loadConfig() {
  const csv = await fetch(CONFIG_CSV_URL).then(res => res.text());
  const rows = parseCSV(csv);
  const row = rows[1] || [];

  return {
    phone: clean(row[0]),
    whatsapp: clean(row[1]),
    email: clean(row[2]),
    facebook: clean(row[3]),
    instagram: clean(row[4]),
    address: clean(row[5]),
    maps: clean(row[6]),
    logo: fixDriveImage(clean(row[7]))
  };
}

function setupCompanyInfo(config) {
  if (config.logo) {
    document.getElementById("companyLogo").src = config.logo;
  }

  if (config.phone) {
    document.getElementById("callBtn").href = `tel:${config.phone}`;
  }

  if (config.whatsapp) {
    document.getElementById("whatsappBtn").href = `https://wa.me/${config.whatsapp}`;
  }

  setLink("facebookLink", config.facebook);
  setLink("instagramLink", config.instagram);
  setLink("mapsLink", config.maps);

  if (config.address) {
    document.getElementById("footerAddress").textContent = config.address;
  }
}

function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (!products.length) {
    grid.innerHTML = `<div class="empty">პროდუქტი ვერ მოიძებნა</div>`;
    return;
  }

  products.forEach(product => {
    const colors = getColors(product);
    const mainImage = product.imageMain || colors[0]?.image || "";

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="image-box">
        ${mainImage ? `<img src="${mainImage}" alt="${product.name}" class="product-image">` : `<div class="no-image">No Image</div>`}
        ${product.priceOld && product.priceNew ? `<span class="sale-badge">SALE</span>` : ""}
      </div>

      <div class="product-body">
        ${product.category ? `<span class="category">${product.category}</span>` : ""}
        ${product.name ? `<h2>${product.name}</h2>` : ""}
        ${product.code ? `<p class="code">კოდი: ${product.code}</p>` : ""}

        ${product.description ? `<p class="description">${product.description}</p>` : ""}

        <div class="specs">
          ${product.width ? `<span>სიგრძე: ${product.width}</span>` : ""}
          ${product.depth ? `<span>სიგანე: ${product.depth}</span>` : ""}
          ${product.height ? `<span>სიმაღლე: ${product.height}</span>` : ""}
        </div>

        ${colors.length ? `
          <div class="colors">
            <p>ფერები</p>
            <div class="color-list">
              ${colors.map((c, i) => `
                <button class="color-btn ${i === 0 ? "active" : ""}" data-image="${c.image}">
                  ${c.name}
                </button>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="prices">
          ${product.priceOld ? `<span class="old-price">${formatPrice(product.priceOld)}</span>` : ""}
          ${product.priceNew ? `<span class="new-price">${formatPrice(product.priceNew)}</span>` : ""}
          ${product.priceWholesale ? `<span class="wholesale-price">საბითუმო: ${formatPrice(product.priceWholesale)}</span>` : ""}
        </div>

        <div class="card-actions">
          ${companyConfig.phone ? `<a href="tel:${companyConfig.phone}">დარეკვა</a>` : ""}
          ${companyConfig.whatsapp ? `<a class="wa" href="https://wa.me/${companyConfig.whatsapp}" target="_blank">WhatsApp</a>` : ""}
        </div>
      </div>
    `;

    card.querySelectorAll(".color-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const img = card.querySelector(".product-image");
        if (img && btn.dataset.image) img.src = btn.dataset.image;

        card.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    grid.appendChild(card);
  });
}

function getColors(product) {
  const colors = [];

  if (product.color1 && product.image1) colors.push({ name: product.color1, image: product.image1 });
  if (product.color2 && product.image2) colors.push({ name: product.color2, image: product.image2 });
  if (product.color3 && product.image3) colors.push({ name: product.color3, image: product.image3 });

  return colors;
}

function renderCategoryFilter(products) {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function filterProducts() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const filtered = allProducts.filter(product => {
    const text = `${product.code} ${product.category} ${product.name} ${product.description}`.toLowerCase();

    return text.includes(search) && (!category || product.category === category);
  });

  renderProducts(filtered);
}

function parseCSV(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (value || row.length) {
        row.push(value);
        rows.push(row);
        row = [];
        value = "";
      }
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function fixDriveImage(url) {
  if (!url) return "";

  const fileMatch = url.match(/\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  }

  return url;
}

function formatPrice(price) {
  if (!price) return "";
  return `${price} ₾`;
}

function clean(value) {
  return value ? String(value).trim() : "";
}

function setLink(id, url) {
  const el = document.getElementById(id);

  if (url) {
    el.href = url;
  } else {
    el.style.display = "none";
  }
}
