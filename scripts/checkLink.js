const slugify = (name) => name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
console.log("https://ruralpop.com/empresa/" + slugify("Oficina Cunimar"));
