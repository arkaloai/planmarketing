import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface StrategyRequest {
  tipo: 'producto' | 'precio' | 'distribucion' | 'comunicacion';
  objetivo: string;
  contexto: {
    diagnostico: string;
    contextoMercado: string;
    problemas: string[];
    oportunidades: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: StrategyRequest = await request.json();
    
    const { tipo, objetivo, contexto } = data;

    // Validar que todos los campos necesarios estén presentes
    if (!tipo || !objetivo || !contexto) {
      return NextResponse.json(
        { error: 'Faltan datos necesarios para generar estrategias' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Crear el prompt específico según el tipo
    const getPromptForType = (tipo: string, objetivo: string, contexto: any) => {
      const baseContext = `
CONTEXTO DEL ANÁLISIS:
Diagnóstico: ${contexto.diagnostico}
Contexto del Mercado: ${contexto.contextoMercado}
Problemas Detectados: ${contexto.problemas.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
Oportunidades Identificadas: ${contexto.oportunidades.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')}

OBJETIVO SELECCIONADO:
${objetivo}
`;

      const prompts: Record<string, string> = {
        producto: `${baseContext}

Basado en el objetivo de PRODUCTO seleccionado, genera 3 estrategias ESPECÍFICAS DE PRODUCTO que aborden aspectos como:
- Características y atributos del producto
- Calidad y diseño
- Empaque y presentación
- Innovación y desarrollo
- Marca y posicionamiento del producto

INSTRUCCIONES:
1. Genera exactamente 3 estrategias de PRODUCTO diferentes
2. Cada estrategia debe enfocarse en aspectos tangibles del producto/servicio
3. Las estrategias deben ser específicas para mejorar, modificar o posicionar el producto
4. NO incluir estrategias de precio, distribución o comunicación
5. Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "estrategias": [
    {
      "id": "1",
      "nombre": "Nombre breve de la estrategia de producto 1",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de producto, incluyendo cambios específicos, mejoras, desarrollo de características o posicionamiento del producto"
    },
    {
      "id": "2", 
      "nombre": "Nombre breve de la estrategia de producto 2",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de producto, incluyendo cambios específicos, mejoras, desarrollo de características o posicionamiento del producto"
    },
    {
      "id": "3",
      "nombre": "Nombre breve de la estrategia de producto 3", 
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de producto, incluyendo cambios específicos, mejoras, desarrollo de características o posicionamiento del producto"
    }
  ]
}`,

        precio: `${baseContext}

Basado en el objetivo de PRECIO seleccionado, genera 3 estrategias ESPECÍFICAS DE PRECIO que aborden aspectos como:
- Niveles y estructuras de precios
- Estrategias de descuento y promoción
- Políticas de precios
- Relación precio-valor
- Posicionamiento competitivo de precios

INSTRUCCIONES:
1. Genera exactamente 3 estrategias de PRECIO diferentes
2. Cada estrategia debe enfocarse exclusivamente en aspectos de pricing y monetización
3. Las estrategias deben ser específicas para fijar, ajustar o estructurar precios
4. NO incluir estrategias de producto, distribución o comunicación
5. Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "estrategias": [
    {
      "id": "1",
      "nombre": "Nombre breve de la estrategia de precio 1",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de precios, incluyendo estructura específica, niveles, descuentos, políticas y justificación basada en valor"
    },
    {
      "id": "2",
      "nombre": "Nombre breve de la estrategia de precio 2", 
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de precios, incluyendo estructura específica, niveles, descuentos, políticas y justificación basada en valor"
    },
    {
      "id": "3",
      "nombre": "Nombre breve de la estrategia de precio 3",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de precios, incluyendo estructura específica, niveles, descuentos, políticas y justificación basada en valor"
    }
  ]
}`,

        distribucion: `${baseContext}

Basado en el objetivo de DISTRIBUCIÓN (PLAZA) seleccionado, genera 3 estrategias ESPECÍFICAS DE DISTRIBUCIÓN que aborden aspectos como:
- Canales de distribución (online, offline, directos, indirectos)
- Logística y cadena de suministro
- Cobertura geográfica
- Gestión de inventario
- Puntos de venta y experiencia en tienda

INSTRUCCIONES:
1. Genera exactamente 3 estrategias de DISTRIBUCIÓN diferentes
2. Cada estrategia debe enfocarse exclusivamente en aspectos logísticos y de canales
3. Las estrategias deben ser específicas para mejorar, expandir o optimizar la distribución
4. NO incluir estrategias de producto, precio o comunicación
5. Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "estrategias": [
    {
      "id": "1",
      "nombre": "Nombre breve de la estrategia de distribución 1",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de distribución, incluyendo canales específicos, logística, cobertura geográfica, gestión de inventario y puntos de venta"
    },
    {
      "id": "2",
      "nombre": "Nombre breve de la estrategia de distribución 2",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de distribución, incluyendo canales específicos, logística, cobertura geográfica, gestión de inventario y puntos de venta"
    },
    {
      "id": "3", 
      "nombre": "Nombre breve de la estrategia de distribución 3",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de distribución, incluyendo canales específicos, logística, cobertura geográfica, gestión de inventario y puntos de venta"
    }
  ]
}`,

        comunicacion: `${baseContext}

Basado en el objetivo de COMUNICACIÓN (PROMOCIÓN) seleccionado, genera 3 estrategias ESPECÍFICAS DE COMUNICACIÓN que aborden aspectos como:
- Publicidad y medios
- Relaciones públicas
- Marketing digital y redes sociales
- Promociones de ventas
- Comunicación integrada de marketing

INSTRUCCIONES:
1. Genera exactamente 3 estrategias de COMUNICACIÓN diferentes
2. Cada estrategia debe enfocarse exclusivamente en aspectos de comunicación y promoción
3. Las estrategias deben ser específicas para transmitir mensajes, construir marca o generar respuesta
4. NO incluir estrategias de producto, precio o distribución
5. Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "estrategias": [
    {
      "id": "1",
      "nombre": "Nombre breve de la estrategia de comunicación 1",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de comunicación, incluyendo canales específicos, mensajes clave, tácticas publicitarias, contenido digital y métricas de impacto"
    },
    {
      "id": "2",
      "nombre": "Nombre breve de la estrategia de comunicación 2",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de comunicación, incluyendo canales específicos, mensajes clave, tácticas publicitarias, contenido digital y métricas de impacto"
    },
    {
      "id": "3",
      "nombre": "Nombre breve de la estrategia de comunicación 3",
      "descripcion": "Descripción detallada de cómo implementar esta estrategia de comunicación, incluyendo canales específicos, mensajes clave, tácticas publicitarias, contenido digital y métricas de impacto"
    }
  ]
}`
      };

      return prompts[tipo] || prompts.producto;
    };

    const prompt = getPromptForType(tipo, objetivo, contexto);

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un experto en estrategia de marketing especializado en ${tipo}. Tu tarea es generar estrategias prácticas y efectivas basadas en objetivos específicos y contexto de negocio. 

IMPORTANTE: Genera ÚNICAMENTE estrategias correspondientes a la variable ${tipo.toUpperCase()} del marketing mix:
- Si es PRODUCTO: enfócate exclusivamente en características, calidad, diseño, empaque, innovación del producto
- Si es PRECIO: enfócate exclusivamente en niveles, estructuras, descuentos, políticas de precios
- Si es DISTRIBUCIÓN: enfócate exclusivamente en canales, logística, cobertura, inventario, puntos de venta
- Si es COMUNICACIÓN: enfócate exclusivamente en publicidad, relaciones públicas, marketing digital, promociones

Responde siempre con JSON válido y nada más.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    if (!messageContent) {
      throw new Error('No se recibió respuesta del modelo');
    }

    // Intentar parsear el JSON
    let response;
    try {
      // Limpiar el contenido para asegurar que sea JSON válido
      const cleanContent = messageContent.replace(/```json\n?|\n?```/g, '').trim();
      response = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Raw content:', messageContent);
      throw new Error('La respuesta del modelo no contiene un JSON válido');
    }

    // Validar la estructura de la respuesta
    if (!response.estrategias || !Array.isArray(response.estrategias) || response.estrategias.length !== 3) {
      throw new Error('La estructura de estrategias es inválida');
    }

    // Validar cada estrategia
    for (const estrategia of response.estrategias) {
      if (!estrategia.id || !estrategia.nombre || !estrategia.descripcion) {
        throw new Error('Cada estrategia debe tener id, nombre y descripción');
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating strategies:', error);
    return NextResponse.json(
      { error: 'Error al generar estrategias. Por favor intente nuevamente.' },
      { status: 500 }
    );
  }
}