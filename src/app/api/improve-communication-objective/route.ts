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
          content: `Eres un experto en comunicación de marketing y publicidad. Tu tarea es mejorar objetivos de comunicación para que sean claros, medibles y alcanzables.

          Responde ÚNICAMENTE con el objetivo mejorado, sin explicaciones adicionales. El objetivo debe:
          - Ser Específico sobre metas de comunicación o marca
          - Ser Medible en términos de alcance o impacto
          - Ser Alcanzable según presupuesto y recursos
          - Ser Relevante para la estrategia de marketing
          - Tener un plazo definido

          Ejemplos de buenos objetivos de comunicación:
          - "Aumentar el reconocimiento de marca en un 30% entre el público objetivo en los próximos 6 meses mediante campaña digital"
          - "Alcanzar 1 millón de impresiones y 50,000 interacciones en redes sociales durante el próximo trimestre"
          - "Generar un aumento del 25% en el tráfico web y 15% en leads cualificados mediante estrategia de contenidos en 4 meses"`
        },
        {
          role: 'user',
          content: `Mejora este objetivo de comunicación: "${objective}"`
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
    console.error('Error al mejorar objetivo de comunicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}