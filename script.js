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

  const heroWhatsapp = document.getElementById("heroWhatsapp");
  if (heroWhatsapp && config.whatsapp) {
    heroWhatsapp.href = `https://wa.me/${config.whatsapp}`;
  }

  setLink("facebookLink", config.facebook);
  setLink("instagramLink", config.instagram);
  setLink("mapsLink", config.maps);

  if (config.address) {
    document.getElementById("footerAddress").textContent = config.address;
  }
}
