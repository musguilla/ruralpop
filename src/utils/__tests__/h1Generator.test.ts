import { generateSeoH1 } from '../h1Generator';

describe('h1Generator', () => {
    describe('Spanish Backward Compatibility', () => {
        it('should handle search queries (pluralization)', () => {
            expect(generateSeoH1({ q: 'Tractor' }, "", "es")).toBe('Tractores en venta');
            expect(generateSeoH1({ q: 'Vaca' }, "", "es")).toBe('Vacas en venta');
            expect(generateSeoH1({ q: 'Motor' }, "", "es")).toBe('Motores en venta');
        });

        it('should handle specific subcategories', () => {
            expect(generateSeoH1({ subcategory: 'Bovino' }, "", "es")).toBe('Ganado vacuno en venta');
            expect(generateSeoH1({ subcategory: 'Equino' }, "", "es")).toBe('Ganado equino en venta');
            expect(generateSeoH1({ subcategory: 'Perros' }, "", "es")).toBe('Anuncios perros');
            expect(generateSeoH1({ subcategory: 'Veterinarios' }, "", "es")).toBe('Anuncios veterinarios');
        });

        it('should handle machinery subcategories', () => {
            expect(generateSeoH1({ category: 'Maquinaria', subcategory: 'Tractores' }, "", "es")).toBe('Tractores segunda mano');
            expect(generateSeoH1({ category: 'Maquinaria', subcategory: 'Remolques' }, "", "es")).toBe('Remolques segunda mano');
        });

        it('should handle fallback subcategories', () => {
            expect(generateSeoH1({ subcategory: 'Semillas' }, "", "es")).toBe('Anuncios de Semillas');
        });

        it('should handle specific categories', () => {
            expect(generateSeoH1({ category: 'Maquinaria' }, "", "es")).toBe('Maquinaria de segunda mano');
            expect(generateSeoH1({ category: 'Ganaderia' }, "", "es")).toBe('Ganado en venta');
            expect(generateSeoH1({ category: 'Fincas' }, "", "es")).toBe('Compra y venta de fincas');
        });

        it('should handle default global', () => {
            expect(generateSeoH1({}, "", "es")).toBe('Anuncios clasificados del mundo rural');
        });

        it('should append location properly', () => {
            expect(generateSeoH1({ subcategory: 'Bovino' }, "Lugo", "es")).toBe('Ganado vacuno en venta en Lugo');
            expect(generateSeoH1({ category: 'Maquinaria', subcategory: 'Tractores' }, "Galicia", "es")).toBe('Tractores segunda mano en Galicia');
            expect(generateSeoH1({}, "Madrid", "es")).toBe('Anuncios clasificados del mundo rural en Madrid');
        });
    });

    describe('Portuguese (PT) Generation', () => {
        it('should handle search queries (pluralization)', () => {
            expect(generateSeoH1({ q: 'Trator' }, "", "pt")).toBe('Tratores à venda');
            expect(generateSeoH1({ q: 'Vaca' }, "", "pt")).toBe('Vacas à venda');
            expect(generateSeoH1({ q: 'Motor' }, "", "pt")).toBe('Motores à venda');
        });

        it('should handle specific subcategories', () => {
            expect(generateSeoH1({ subcategory: 'Bovino' }, "", "pt")).toBe('Gado bovino à venda');
            expect(generateSeoH1({ subcategory: 'Equino' }, "", "pt")).toBe('Cavalos e equinos à venda');
            expect(generateSeoH1({ subcategory: 'Perros' }, "", "pt")).toBe('Anúncios de cães');
        });

        it('should handle machinery subcategories', () => {
            expect(generateSeoH1({ category: 'Maquinaria', subcategory: 'Tratores' }, "", "pt")).toBe('Tratores em segunda mão');
        });

        it('should handle fallback subcategories', () => {
            expect(generateSeoH1({ subcategory: 'Sementes' }, "", "pt")).toBe('Anúncios de Sementes');
        });

        it('should append location with correct prepositions', () => {
            expect(generateSeoH1({ subcategory: 'Bovino' }, "Lugo", "pt")).toBe('Gado bovino à venda em Lugo');
            expect(generateSeoH1({ category: 'Maquinaria', subcategory: 'Tratores' }, "Galiza", "pt")).toBe('Tratores em segunda mão na Galiza');
            expect(generateSeoH1({}, "Porto", "pt")).toBe('Anúncios classificados do mundo rural no Porto');
            expect(generateSeoH1({}, "Açores", "pt")).toBe('Anúncios classificados do mundo rural nos Açores');
        });
    });
});
