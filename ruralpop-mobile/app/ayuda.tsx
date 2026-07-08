import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { IS_EQUIPOP } from '../src/config/tenants';

const faqs = [
    {
        category: 'Cuenta',
        questions: [
            {
                q: `¿Cómo me registro en ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}?`,
                a: `1. Haz clic en el icono de usuario o "Entrar / Registro" en la parte superior derecha de la pantalla.\n2. Selecciona "Crear cuenta" o usa directamente tu cuenta de Google o Apple para acceder rápidamente.\n3. Rellena tus datos básicos y ¡listo! Ya eres parte de la comunidad.`
            },
            {
                q: '¿Cómo elimino mi cuenta?',
                a: '1. Inicia sesión y ve a tu "Perfil" en la esquina superior derecha.\n2. Haz clic en "Ajustes".\n3. En la parte inferior, verás la opción "Eliminar cuenta". Pulsa ahí y sigue los pasos de seguridad para confirmar tu solicitud.'
            },
            {
                q: '¿Cómo contacto con otro usuario por chat?',
                a: `1. Encuentra un anuncio que te interese.\n2. En la página del anuncio, haz clic en el botón "Contactar".\n3. Escribe tu mensaje y el usuario lo recibirá al instante en su buzón de ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} y por correo electrónico.`
            },
            {
                q: `¿Es seguro usar ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}?`,
                a: '1. Sí. Verificamos constantemente las cuentas profesionales.\n2. Contamos con un sistema de reportes en cada anuncio por si ves algo sospechoso.\n3. Mantenemos tu privacidad intacta: tus datos de contacto no son públicos a menos que tú decidas compartirlos.'
            },
            {
                q: '¿Eres profesional o empresa del sector?',
                a: '1. Si tienes una empresa o negocio relacionado con el sector.\n2. Te recomendamos crear directamente una cuenta Profesional para disfrutar de tu propio escaparate digital y subir anuncios sin límite.'
            }
        ]
    },
    {
        category: 'Anuncios',
        questions: [
            {
                q: `¿Cómo subo un anuncio a ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}?`,
                a: `1. Una vez logueado, haz clic en el botón verde "Vender" de la barra superior.\n2. Selecciona la categoría principal y subcategoría para tu producto.\n3. Sube fotos claras, pon un título descriptivo y un precio.\n4. Revisa los datos y dale a publicar. Ya estará visible para miles de personas.`
            },
            {
                q: '¿Cuántos anuncios puedo subir?',
                a: '1. Si eres un usuario Particular, puedes subir un número limitado de anuncios gratuitos activos al mismo tiempo.\n2. Si eres Profesional o Empresa, puedes pasarte a un Plan Pro y subir tantos catálogos de productos como tu negocio necesite.'
            },
            {
                q: '¿Cómo puedo destacar mis anuncios?',
                a: '1. Entra a tu perfil y luego a tus "Anuncios".\n2. Al lado del anuncio que quieras potenciar, verás una opción "Destacar".\n3. Estos anuncios aparecerán siempre arriba en las búsquedas y tendrán un resaltado especial.'
            },
            {
                q: '¿Cómo elimino un anuncio?',
                a: '1. Ve a "Mis Anuncios" desde tu menú de perfil.\n2. Localiza el anuncio a borrar.\n3. Accede a sus opciones (los tres puntitos) y selecciona "Eliminar". Se retirará de inmediato de la web.'
            }
        ]
    },
    {
        category: 'Profesionales',
        questions: [
            {
                q: 'Crear cuenta de profesional',
                a: '1. Dirígete a la sección "Profesionales" en la página de inicio o en el menú.\n2. Selecciona y paga la suscripción que mejor se adapte (mensual o anual).\n3. Rellena los datos fiscales y de contacto público de tu negocio.'
            },
            {
                q: 'Beneficios cuentas profesionales',
                a: `1. Tu propia página web (landing page) con la URL ${IS_EQUIPOP ? 'equipop.app' : 'ruralpop.com'}/empresa/tu-nombre.\n2. Publicación de anuncios ilimitados sin caducidad.\n3. Etiqueta destacada en tus anuncios que da mayor confianza a los compradores.\n4. Estadísticas detalladas de visualizaciones y contactos recibidos.`
            }
        ]
    },
    {
        category: 'Compras',
        questions: [
            {
                q: `Comprar con Protección ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}`,
                a: `Compra y vende con tranquilidad con Protección ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}. Disfruta de transacciones fáciles y seguras y no te preocupes de nada más.\n\n¿Qué es Protección ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}?\nProtección ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} proporciona una experiencia de compra sencilla y sin preocupaciones mediante nuestro servicio de pago seguro.\n\nComprar con Protección ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}\nAl realizar una compra, aplicamos un cargo obligatorio mediante el cual:\nTu dinero está seguro con nosotros mientras compruebas que lo que has recibido es correcto (Dispones de 7 días desde la confirmación de entrega del producto por parte de la compañia de transporte). Si todo está bien, pasado ese plazo pagaremos al vendedor.\nSi lo que has recibido no coincide con la descripción o está defectuoso tienes la posibilidad de solicitar un reembolso.\n\nVender con Protección ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}\nRealizando tus ventas a través de ${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'}:\nMantenemos el dinero seguro hasta que el producto llegue al comprador y confirme que es correcto o hayan transcurrido 7 días que tiene para comprobarlo.\nNuestro equipo de atención al cliente está siempre a tu disposición.\n\nCompra y vende sin preocupaciones, ¡nosotros nos encargamos del resto!`
            }
        ]
    }
];

export default function AyudaScreen() {
    const router = useRouter();
    const [selectedFaq, setSelectedFaq] = useState<{q: string, a: string} | null>(null);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text">Ayuda</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {faqs.map((section, idx) => (
                    <View key={idx} className="mb-6">
                        <Text className="text-[15px] font-bold text-gray-800 mb-2 ml-1">{section.category}</Text>
                        
                        <View className="bg-white">
                            {section.questions.map((faq, qIdx) => (
                                <TouchableOpacity 
                                    key={qIdx}
                                    onPress={() => setSelectedFaq(faq)}
                                    className={`flex-row justify-between items-center py-4 ${qIdx !== section.questions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <Text className="text-[16px] text-[#374151] flex-1 mr-4 ml-1">{faq.q}</Text>
                                    <ChevronRight color="#9ca3af" size={20} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal
                visible={!!selectedFaq}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedFaq(null)}
            >
                <SafeAreaView className="flex-1 bg-white">
                    <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
                        <View style={{ width: 44 }} />
                        <Text className="text-xl font-bold text-text text-center flex-1" numberOfLines={1}>Respuesta</Text>
                        <TouchableOpacity onPress={() => setSelectedFaq(null)} className="p-2 -mr-2 rounded-full active:bg-gray-100">
                            <X color="#111827" size={28} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="flex-1 px-6 py-6">
                        <Text className="text-2xl font-bold text-text mb-6 leading-tight">{selectedFaq?.q}</Text>
                        <Text className="text-[17px] text-gray-700 leading-relaxed">
                            {selectedFaq?.a}
                        </Text>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
