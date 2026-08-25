const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'ruralpop-mobile/src/constants/categories.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace maquinaria subcategories
content = content.replace(
    /id: "maquinaria",[\s\S]*?subcategories: \[[\s\S]*?\],/m,
    `id: "maquinaria",
        label: "Maquinaria y herramientas",
        subcategories: [
            "Tractores",
            "Abonadoras",
            "Cosechadoras",
            "Depósitos",
            "Desbrozadoras",
            "Empacadoras",
            "Encintadoras",
            "Motocultores",
            "Remolques",
            "Segadoras",
            "Sembradoras",
            "Silos",
            "Sulfatadoras",
            "Trituradoras",
            "Volteadoras",
            "Otra maquinaria agrícola"
        ],`
);

// Replace equipamiento subcategories
content = content.replace(
    /id: "equipamiento-y-material",[\s\S]*?subcategories: \[.*?\],/m,
    `id: "equipamiento-y-material",
        label: "Equipamiento y material",
        subcategories: [
            "Alimentación y agua",
            "Cerramientos",
            "Equitación y material equino",
            "Identificación y trazabilidad",
            "Limpieza, purines y estiércol",
            "Material apicultura",
            "Material avicultura",
            "Material conejos",
            "Material ovino",
            "Material porcino",
            "Material vacuno",
            "Ordeño y leche"
        ],`
);

// Add camiones after alimentos
content = content.replace(
    /id: "alimentos",\s*label: "Alimentos",\s*subcategories: \[\],\s*\},/m,
    `id: "alimentos",
        label: "Alimentos",
        subcategories: [],
    },
    {
        id: "camiones-y-furgonetas",
        label: "Camiones y furgonetas",
        subcategories: [],
    },`
);

fs.writeFileSync(file, content);
console.log("Updated mobile categories");
