const fs = require('fs');

const constantsFile = 'src/constants/seoLandings.ts';
let constantsContent = fs.readFileSync(constantsFile, 'utf8');

const newLandings = `    { title: "Tractores segunda mano Asturias", category: "maquinaria", province: "Asturias", searchQuery: "tractor" },
    { title: "Tractores segunda mano Galicia", category: "maquinaria", province: "A Coruña", searchQuery: "tractor" },
    { title: "Tractores usados Madrid", category: "maquinaria", province: "Madrid", searchQuery: "tractor" },
    { title: "Tractor segunda mano Bilbao", category: "maquinaria", province: "Bizkaia", searchQuery: "tractor" },
    { title: "Tractor usado Valencia", category: "maquinaria", province: "Valencia", searchQuery: "tractor" },`;

if (!constantsContent.includes('Tractores segunda mano Asturias')) {
    constantsContent = constantsContent.replace(
        /];\n\nexport const SEO_LANDINGS/,
        `${newLandings}\n];\n\nexport const SEO_LANDINGS`
    );
    fs.writeFileSync(constantsFile, constantsContent, 'utf8');
}

const pageFile = 'src/app/s/[slug]/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

const slugsArrayReplacement = `["tractores-segunda-mano", "segunda-mano-tractores", "comprar-maquinaria-agricola", "tractores-segunda-mano-asturias", "tractores-segunda-mano-galicia", "tractores-usados-madrid", "tractor-segunda-mano-bilbao", "tractor-usado-valencia"]`;
pageContent = pageContent.replace(/\["tractores-segunda-mano", "segunda-mano-tractores", "comprar-maquinaria-agricola"\]/, slugsArrayReplacement);

const newLinks = `                        {params.slug !== "tractores-segunda-mano" && (
                            <a href="https://www.ruralpop.com/s/tractores-segunda-mano" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractores segunda mano
                            </a>
                        )}
                        {params.slug !== "segunda-mano-tractores" && (
                            <a href="https://www.ruralpop.com/s/segunda-mano-tractores" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Segunda mano tractores
                            </a>
                        )}
                        {params.slug !== "comprar-maquinaria-agricola" && (
                            <a href="https://www.ruralpop.com/s/comprar-maquinaria-agricola" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Comprar maquinaria agrícola
                            </a>
                        )}
                        {params.slug !== "tractores-segunda-mano-asturias" && (
                            <a href="https://www.ruralpop.com/s/tractores-segunda-mano-asturias" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Asturias
                            </a>
                        )}
                        {params.slug !== "tractores-segunda-mano-galicia" && (
                            <a href="https://www.ruralpop.com/s/tractores-segunda-mano-galicia" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Galicia
                            </a>
                        )}
                        {params.slug !== "tractores-usados-madrid" && (
                            <a href="https://www.ruralpop.com/s/tractores-usados-madrid" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Madrid
                            </a>
                        )}
                        {params.slug !== "tractor-segunda-mano-bilbao" && (
                            <a href="https://www.ruralpop.com/s/tractor-segunda-mano-bilbao" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Bilbao
                            </a>
                        )}
                        {params.slug !== "tractor-usado-valencia" && (
                            <a href="https://www.ruralpop.com/s/tractor-usado-valencia" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Valencia
                            </a>
                        )}`;

const oldLinksRegex = /\{params\.slug \!== "tractores-segunda-mano" && \([\s\S]*?Comprar maquinaria agrícola\n                            <\/a>\n                        \)\}/;
pageContent = pageContent.replace(oldLinksRegex, newLinks);

fs.writeFileSync(pageFile, pageContent, 'utf8');

console.log("Done");
