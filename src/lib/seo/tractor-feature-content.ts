import { TractorModel, TractorBrand } from '@/types/tractores';

export type FeatureType = 
    | 'power_range'
    | 'engine'
    | 'transmission'
    | 'fuel_tank'
    | 'weight'
    | 'speed'
    | 'use'
    | 'crop'
    | 'segment'
    | 'traction';

interface FeatureStats {
    modelsCount: number;
    brandsCount: number;
    minPower?: number;
    maxPower?: number;
    minYear?: number;
    maxYear?: number;
    topBrands: string[];
}

export function generateFeatureH1(featureType: FeatureType, name: string): string {
    switch (featureType) {
        case 'power_range': return `Tractores de ${name}`;
        case 'engine': return `Tractores con motor ${name}`;
        case 'transmission': return `Tractores con transmisión ${name}`;
        case 'fuel_tank': return `Tractores con depósito de ${name}`;
        case 'weight': return `Tractores de ${name}`;
        case 'speed': return `Tractores con velocidad ${name}`;
        case 'use': return `Tractores para ${name}`;
        case 'crop': return `Tractores para ${name}`;
        case 'segment': return `Tractores ${name}`;
        case 'traction': return `Tractores con ${name}`;
        default: return `Tractores ${name}`;
    }
}

export function generateFeatureIntro(featureType: FeatureType, name: string, stats: FeatureStats): string {
    const brandsStr = stats.topBrands.slice(0, 3).join(', ');
    const brandsContext = brandsStr ? ` de marcas líderes como ${brandsStr}` : '';
    
    switch (featureType) {
        case 'power_range':
            return `Los tractores de ${name} son equipos versátiles diseñados para labores que requieren esa capacidad de tiro y esfuerzo de toma de fuerza. En Ruralpop puedes consultar ${stats.modelsCount} modelos${brandsContext}, comparar sus datos técnicos detallados y acceder a posibles anuncios de segunda mano relacionados.`;
        case 'engine':
            return `Los tractores equipados con motor ${name} destacan por su fiabilidad y rendimiento en el campo. Hemos recopilado ${stats.modelsCount} modelos diferentes que montan estos propulsores. Consulta sus cilindradas, potencias máximas y fichas técnicas completas.`;
        case 'transmission':
            return `Los tractores con transmisión ${name} ofrecen unas características de conducción y eficiencia específicas para ciertas labores agrícolas. Revisa nuestro catálogo de ${stats.modelsCount} modelos${brandsContext} que utilizan este sistema, comparando número de marchas y velocidades máximas.`;
        case 'use':
            return `Para trabajos relacionados con ${name}, la maniobrabilidad, el peso y la potencia hidráulica suelen ser claves. En esta sección agrupamos ${stats.modelsCount} modelos recomendados para ${name}. Encuentra el equipo perfecto para tu explotación y consulta opciones de compra de segunda mano.`;
        case 'crop':
            return `Las labores en ${name} exigen dimensiones y prestaciones específicas. Hemos seleccionado ${stats.modelsCount} modelos de tractores${brandsContext} que se adaptan a los requerimientos de este cultivo. Analiza sus características y fichas técnicas.`;
        case 'weight':
            return `El peso es un factor fundamental para la tracción y la compactación del suelo. Los tractores de ${name} están representados en nuestro catálogo por ${stats.modelsCount} modelos. Descubre sus especificaciones técnicas y encuentra el equilibrio perfecto para tus implementos.`;
        case 'segment':
            return `Dentro de la categoría de tractores ${name}, disponemos de ${stats.modelsCount} modelos catalogados. Estos equipos están orientados a necesidades específicas del agricultor. Explora las opciones${brandsContext} y compara especificaciones.`;
        case 'traction':
            return `Los tractores con ${name} ofrecen una transferencia de potencia al suelo característica. Analiza los ${stats.modelsCount} modelos registrados en nuestro knowledge graph que cuentan con este tipo de tracción y evalúa si se ajustan a las condiciones de tu terreno.`;
        default:
            return `Explora nuestra base de datos de tractores con ${name}. Actualmente contamos con ${stats.modelsCount} modelos catalogados${brandsContext}. Compara fichas técnicas y descubre opciones en el mercado de segunda mano.`;
    }
}

export function generateFeatureSeoText(featureType: FeatureType, name: string, stats: FeatureStats): string {
    const intro = generateFeatureIntro(featureType, name, stats);
    
    let content = `<h2>Características técnicas de los tractores ${featureType === 'use' || featureType === 'crop' ? 'para ' : 'con '}${name}</h2>\n`;
    content += `<p>Al evaluar maquinaria agrícola, los detalles técnicos marcan la diferencia en la productividad diaria. Nuestro catálogo incluye <strong>${stats.modelsCount} modelos de tractores</strong> en la categoría de <em>${name}</em>. `;
    
    if (stats.minPower && stats.maxPower) {
        content += `Las potencias en este grupo oscilan desde los ${stats.minPower} CV hasta los ${stats.maxPower} CV, cubriendo una amplia variedad de necesidades operativas.</p>\n`;
    } else {
        content += `Estos modelos han sido diseñados para optimizar tareas específicas en la agricultura y ganadería.</p>\n`;
    }

    content += `<h3>Marcas y fabricantes destacados</h3>\n`;
    content += `<p>La innovación en este segmento está liderada por fabricantes históricos. Entre los modelos registrados en nuestra base de datos, destacan marcas como <strong>${stats.topBrands.join(', ')}</strong>. Cada marca aporta su propia tecnología propietaria en cabinas, gestión electrónica y sistemas hidráulicos.</p>\n`;

    content += `<h3>El mercado de segunda mano</h3>\n`;
    content += `<p>Adquirir tractores de segunda mano es una excelente estrategia para optimizar la inversión de la explotación agraria. En Ruralpop conectamos la información técnica más rigurosa con el mercado real de maquinaria usada, facilitando la toma de decisiones informadas.</p>`;

    return intro + "\n\n" + content;
}

export function generateFeatureFaqs(featureType: FeatureType, name: string, stats: FeatureStats) {
    const faqs = [];

    // General FAQ 1
    faqs.push({
        question: `¿Cuántos modelos de tractores ${featureType === 'use' || featureType === 'crop' ? 'para ' : ''}${name} hay en el mercado?`,
        answer: `En nuestra base de datos técnica tenemos documentados actualmente ${stats.modelsCount} modelos de tractores clasificados bajo ${name}, pertenecientes a ${stats.brandsCount} marcas diferentes.`
    });

    // Specific FAQs based on type
    if (featureType === 'power_range') {
        faqs.push({
            question: `¿Para qué tamaño de explotación son ideales los tractores de ${name}?`,
            answer: `Depende del tipo de cultivo y relieve, pero en general la potencia determina el tamaño de los aperos que se pueden arrastrar de manera eficiente y segura.`
        });
        faqs.push({
            question: `¿Qué marcas fabrican tractores en el rango de ${name}?`,
            answer: `Entre las marcas más destacadas en esta franja de potencia se encuentran ${stats.topBrands.slice(0, 4).join(', ')}.`
        });
    } else if (featureType === 'use' || featureType === 'crop') {
        faqs.push({
            question: `¿Qué requisitos debe cumplir un tractor para ${name}?`,
            answer: `Principalmente debe tener las dimensiones adecuadas para no dañar el cultivo, la potencia de toma de fuerza requerida para los implementos específicos y, preferiblemente, un sistema hidráulico de alto caudal.`
        });
    } else if (featureType === 'transmission') {
        faqs.push({
            question: `¿Cuáles son las ventajas de la transmisión ${name}?`,
            answer: `Esta transmisión está diseñada para ofrecer una transferencia de potencia continua o escalonada de forma eficiente, reduciendo la fatiga del operario y optimizando el consumo de combustible en ciertas labores de tiro o transporte.`
        });
    } else {
        faqs.push({
            question: `¿Por qué elegir un tractor con ${name}?`,
            answer: `Elegir las especificaciones técnicas correctas garantiza que el tractor no esté ni sobredimensionado ni se quede corto para el trabajo diario, maximizando así la vida útil del motor y los componentes mecánicos.`
        });
    }

    return faqs;
}

export function generateFeatureMetaTitle(featureType: FeatureType, name: string): string {
    switch (featureType) {
        case 'power_range': return `Tractores de ${name}: modelos y fichas técnicas | Ruralpop`;
        case 'use': return `Tractores para ${name}: modelos, potencia y características | Ruralpop`;
        case 'crop': return `Tractores para ${name}: modelos, medidas y características | Ruralpop`;
        case 'transmission': return `Tractores con transmisión ${name}: modelos y fichas | Ruralpop`;
        case 'engine': return `Tractores con motor ${name} | Ruralpop`;
        default: return `Tractores con ${name}: modelos y características | Ruralpop`;
    }
}

export function generateFeatureMetaDescription(featureType: FeatureType, name: string, stats: FeatureStats): string {
    const count = stats.modelsCount;
    switch (featureType) {
        case 'power_range': return `Consulta ${count} tractores de ${name} con fichas técnicas, potencia, motor, transmisión, usos y anuncios relacionados de segunda mano en Ruralpop.`;
        case 'use': return `Descubre ${count} tractores recomendados para ${name}, compara modelos, potencia, transmisión, dimensiones y consulta anuncios relacionados en Ruralpop.`;
        case 'crop': return `Explora ${count} modelos de tractores aptos para ${name}. Analiza sus fichas técnicas, medidas y descubre maquinaria de ocasión en Ruralpop.`;
        case 'transmission': return `Consulta ${count} modelos de tractores con transmisión ${name}, fichas técnicas, marcas, potencia, usos habituales y anuncios relacionados.`;
        case 'engine': return `Modelos de tractores con motor ${name}, características técnicas, potencia, transmisión y fichas completas en Ruralpop.`;
        default: return `Consulta el catálogo de ${count} tractores con ${name}. Fichas técnicas, características, marcas y mercado de segunda mano agrícola en Ruralpop.`;
    }
}
