import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { objective } = await request.json()

    if (!objective || objective.trim().length === 0) {
      return NextResponse.json(
        { error: 'El objetivo es requerido' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un experto en logística, cadena de suministro y distribución comercial. Tu tarea es mejorar objetivos de distribución para que sean claros, medibles y alcanzables.

          Responde ÚNICAMENTE con el objetivo mejorado, sin explicaciones adicionales. El objetivo debe:
          - Ser Específico sobre cobertura o eficiencia de distribución
          - Ser Medible en términos de alcance o tiempo
          - Ser Alcanzable según recursos disponibles
          - Ser Relevante para la estrategia de mercado
          - Tener un plazo definido

          Ejemplos de buenos objetivos de distribución:
          - "Expandir la cobertura de distribución a 15 nuevas ciudades en los próximos 9 meses alcanzando 500 puntos de venta"
          - "Reducir el tiempo de entrega promedio de 5 a 2 días en el próximo trimestre mediante optimización logística"
          - "Implementar un sistema de distribución omnicanal integrando 3 canales de venta en los próximos 6 meses"`
        },
        {
          role: 'user',
          content: `Mejora este objetivo de distribución: "${objective}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    const improvedObjective = completion.choices[0]?.message?.content?.trim()

    if (!improvedObjective) {
      return NextResponse.json(
        { error: 'No se pudo generar una respuesta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ improvedObjective })

  } catch (error) {
    console.error('Error al mejorar objetivo de distribución:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}