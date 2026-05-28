import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { objective, field, type, systemPrompt } = await request.json()

    if (!objective || objective.trim().length === 0) {
      return NextResponse.json(
        { error: 'El contenido es requerido' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'Eres un experto en marketing y comunicación. Mejora el texto proporcionado para que sea más profesional, claro y efectivo. Responde únicamente con el texto mejorado, sin explicaciones adicionales.'
        },
        {
          role: 'user',
          content: `Mejora este texto: "${objective}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const improvedText = completion.choices[0]?.message?.content?.trim()

    if (!improvedText) {
      return NextResponse.json(
        { error: 'No se pudo generar una respuesta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ improvedText })

  } catch (error) {
    console.error('Error al mejorar campo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}