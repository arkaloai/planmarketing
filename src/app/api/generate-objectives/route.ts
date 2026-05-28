import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface AnalysisData {
  diagnostico: string;
  contextoMercado: string;
  problemas: string[];
  oportunidades: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalysisData = await request.json();
    
    const { diagnostico, contextoMercado, problemas, oportunidades } = data;

    // Validar que todos los campos necesarios estén presentes
    if (!diagnostico || !contextoMercado || !problemas || !oportunidades) {
      return NextResponse.json(
        { error: 'Faltan datos necesarios para generar objetivos' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Crear el prompt para generar objetivos basados en el análisis
    const prompt = `Basado en el siguiente análisis situacional, genera 3 objetivos estratégicos específicos y medibles para cada una de las 4 P's del marketing (Producto, Precio, Distribución, Comunicación).

ANÁLISIS SITUACIONAL:

Diagnóstico:
${diagnostico}

Contexto del Mercado:
${contextoMercado}

Problemas Detectados:
${problemas.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Oportunidades Identificadas:
${oportunidades.map((o, i) => `${i + 1}. ${o}`).join('\n')}

INSTRUCCIONES:
1. Genera exactamente 3 objetivos para cada P (Producto, Precio, Distribución, Comunicación)
2. Los objetivos deben ser específicos, medibles, alcanzables, relevantes y con plazo (SMART)
3. Los objetivos deben abordar directamente los problemas detectados y aprovechar las oportunidades identificadas
4. Cada objetivo debe ser una frase completa y clara
5. Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "producto": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "precio": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "distribucion": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "comunicacion": ["objetivo 1", "objetivo 2", "objetivo 3"]
}

Ejemplos de objetivos SMART:
- "Lanzar una nueva línea de productos eco-friendly para capturar el 15% del mercado verde en los próximos 6 meses"
- "Implementar una estrategia de precios dinámicos que aumente el margen de rentabilidad en 8% durante el próximo trimestre"
- "Expandir la red de distribución a 3 nuevas ciudades clave para aumentar la cobertura geográfica en 25% en 1 año"
- "Desarrollar una campaña digital integrada que incremente el reconocimiento de marca en 30% en los próximos 4 meses"`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en estrategia de marketing especializado en la metodología 4P. Tu tarea es analizar situaciones de negocio y generar objetivos estratégicos SMART. Responde siempre con JSON válido y nada más.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    if (!messageContent) {
      throw new Error('No se recibió respuesta del modelo');
    }

    // Intentar parsear el JSON
    let objetivos;
    try {
      // Limpiar el contenido para asegurar que sea JSON válido
      const cleanContent = messageContent.replace(/```json\n?|\n?```/g, '').trim();
      objetivos = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Raw content:', messageContent);
      throw new Error('La respuesta del modelo no contiene un JSON válido');
    }

    // Validar la estructura de los objetivos
    const requiredKeys = ['producto', 'precio', 'distribucion', 'comunicacion'];
    for (const key of requiredKeys) {
      if (!objetivos[key] || !Array.isArray(objetivos[key]) || objetivos[key].length !== 3) {
        throw new Error(`La estructura de objetivos para ${key} es inválida`);
      }
    }

    return NextResponse.json({ objetivos });

  } catch (error) {
    console.error('Error generating objectives:', error);
    return NextResponse.json(
      { error: 'Error al generar objetivos. Por favor intente nuevamente.' },
      { status: 500 }
    );
  }
}