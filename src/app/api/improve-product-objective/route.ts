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
          content: `Eres un experto en estrategia de producto y desarrollo de negocios. Tu tarea es mejorar objetivos de producto para que sean claros, medibles y alcanzables.

          Responde ÚNICAMENTE con el objetivo mejorado, sin explicaciones adicionales. El objetivo debe:
          - Ser Específico y claro
          - Ser Medible cuantitativamente
          - Ser Alcanzable y realista
          - Ser Relevante para el negocio
          - Tener un plazo definido

          Ejemplos de buenos objetivos de producto:
          - "Lanzar 3 nuevas características del producto en los próximos 6 meses para aumentar la retención de usuarios en un 15%"
          - "Mejorar la calidad del producto reduciendo los defectos en un 40% durante el próximo trimestre"
          - "Desarrollar una versión móvil del producto y alcanzar 10,000 descargas en los primeros 3 meses"`
        },
        {
          role: 'user',
          content: `Mejora este objetivo de producto: "${objective}"`
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
    console.error('Error al mejorar objetivo de producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}