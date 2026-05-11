import React from 'react';
import { Settings, Gauge, Key, Battery, Weight, Layers, ShieldCheck, Zap } from 'lucide-react';

interface Props {
    model: any; // Using any for simplicity here
}

export function TractorSpecsTable({ model }: Props) {
    if (!model) return null;

    const sections = [
        {
            title: "Motor y Potencia",
            icon: <Gauge className="w-5 h-5 text-gray-500" />,
            specs: [
                { label: "Potencia (CV)", value: model.power_hp_min ? `${model.power_hp_min}${model.power_hp_max && model.power_hp_max !== model.power_hp_min ? ' - ' + model.power_hp_max : ''} CV` : null },
                { label: "Motor", value: model.engine },
                { label: "Marca Motor", value: model.engine_brand },
                { label: "Cilindros", value: model.cylinders ? `${model.cylinders}` : null },
                { label: "Cilindrada (L)", value: model.displacement_l ? `${model.displacement_l} L` : null },
                { label: "Emisiones", value: model.emissions_standard }
            ]
        },
        {
            title: "Transmisión y Desplazamiento",
            icon: <Settings className="w-5 h-5 text-gray-500" />,
            specs: [
                { label: "Transmisión", value: model.transmission },
                { label: "Marchas", value: model.gears },
                { label: "Velocidad Máx.", value: model.max_speed_kmh ? `${model.max_speed_kmh} km/h` : null },
                { label: "Tracción", value: model.traction },
            ]
        },
        {
            title: "Capacidades y Dimensiones",
            icon: <Weight className="w-5 h-5 text-gray-500" />,
            specs: [
                { label: "Peso", value: model.weight_kg ? `${model.weight_kg} kg` : null },
                { label: "Distancia entre ejes", value: model.wheelbase_mm ? `${model.wheelbase_mm} mm` : null },
                { label: "Depósito Combustible", value: model.fuel_tank_l ? `${model.fuel_tank_l} L` : null },
                { label: "Caudal Hidráulico", value: model.hydraulic_flow_l_min ? `${model.hydraulic_flow_l_min} L/min` : null },
                { label: "Capacidad de Elevación", value: model.lift_capacity_kg ? `${model.lift_capacity_kg} kg` : null },
            ]
        },
        {
            title: "General",
            icon: <Layers className="w-5 h-5 text-gray-500" />,
            specs: [
                { label: "Años de Producción", value: model.production_years },
                { label: "Serie", value: model.series },
                { label: "Cabina", value: model.cabin },
                { label: "Usos comunes", value: model.uses && model.uses.length > 0 ? model.uses.join(", ") : null },
                { label: "Cultivos ideales", value: model.crops && model.crops.length > 0 ? model.crops.join(", ") : null },
            ]
        }
    ];

    // Check if there are any specs at all
    const hasAnySpec = sections.some(s => s.specs.some(spec => spec.value !== null && spec.value !== undefined && spec.value !== ""));
    
    if (!hasAnySpec) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500 border border-gray-100">
                <p>Las especificaciones técnicas detalladas aún no están disponibles para este modelo.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                    Ficha Técnica y Especificaciones
                </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
                {sections.map((section, idx) => {
                    const validSpecs = section.specs.filter(s => s.value !== null && s.value !== undefined && s.value !== "");
                    if (validSpecs.length === 0) return null;
                    
                    return (
                        <div key={idx} className="p-8 sm:p-10 flex flex-col md:flex-row gap-6 md:gap-12 hover:bg-gray-50/30 transition-colors">
                            <div className="w-full md:w-1/3 flex items-start gap-3">
                                <div className="mt-1 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                    {section.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800">{section.title}</h4>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                {validSpecs.map((spec, sIdx) => (
                                    <div key={sIdx} className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-500 mb-1">{spec.label}</span>
                                        <span className="font-semibold text-gray-900">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Memory:
 * - Componente aislado para la tabla de especificaciones.
 * - Filtra automáticamente las secciones y campos vacíos (null).
 * - Diseño UI Premium alineado con Ruralpop: Cards con bordes redondeados, iconos, divisiones limpias.
 */
