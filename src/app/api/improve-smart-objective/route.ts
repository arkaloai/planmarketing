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
          content: `Eres un experto en marketing y estrategia empresarial. Tu tarea es mejorar objetivos de comunicación para que cumplan con la metodología SMART (Specific, Measurable, Achievable, Relevant, Time-bound).

          Responde ÚNICAMENTE con el objetivo mejorado, sin explicaciones adicionales. El objetivo debe:
          - Ser Específico (Specific): Claro y preciso
          - Ser Medible (Measurable): Cuantificable
          - Ser Alcanzable (Achievable): Realista
          - Ser Relevante (Relevant): Alineado con los objetivos del negocio
          - Tener un plazo (Time-bound): Con fecha límite definida

          Ejemplos de buenos objetivos SMART:
          - "Aumentar el reconocimiento de marca en un 25% en los próximos 6 meses mediante campañas en redes sociales"
          - "Generar 500 leads cualificados mensuales durante el próximo trimestre a través de marketing de contenidos"
          - "Alcanzar una tasa de conversión del 3% en la página de producto en los próximos 90 días"`
        },
        {
          role: 'user',
          content: `Mejora este objetivo de comunicación para que sea SMART: "${objective}"`
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
    console.error('Error al mejorar objetivo SMART:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}