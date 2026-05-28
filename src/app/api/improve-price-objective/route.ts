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
          content: `Eres un experto en estrategia de precios y revenue management. Tu tarea es mejorar objetivos de precios para que sean claros, medibles y alcanzables.

          Responde ÚNICAMENTE con el objetivo mejorado, sin explicaciones adicionales. El objetivo debe:
          - Ser Específico sobre metas de precio o rentabilidad
          - Ser Medible en términos financieros
          - Ser Alcanzable según el mercado
          - Ser Relevante para la estrategia empresarial
          - Tener un plazo definido

          Ejemplos de buenos objetivos de precio:
          - "Aumentar el margen de beneficio promedio del 25% al 35% en los próximos 6 meses mediante optimización de costos y ajuste de precios"
          - "Implementar una estrategia de precios dinámicos para aumentar el revenue en un 20% durante el próximo trimestre"
          - "Alcanzar un precio promedio de $150 por unidad manteniendo un volumen de ventas de 1,000 unidades mensuales"`
        },
        {
          role: 'user',
          content: `Mejora este objetivo de precio: "${objective}"`
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
    console.error('Error al mejorar objetivo de precio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}