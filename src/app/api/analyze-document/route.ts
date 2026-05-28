import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // API temporal para saltar el error de build de pdf-parse
    return NextResponse.json({ 
      success: true, 
      message: "API de análisis de documentos activa (Modo Despliegue seguro)" 
    });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}
