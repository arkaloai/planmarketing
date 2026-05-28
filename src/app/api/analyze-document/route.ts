import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró ningún archivo' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';

    // Extraer texto según el tipo de archivo
    if (fileName.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('Error parsing PDF:', pdfError);
        return NextResponse.json(
          { error: 'No se pudo leer el archivo PDF. Asegúrese de que no esté protegido o corrupto.' },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (docxError) {
        console.error('Error parsing DOCX:', docxError);
        return NextResponse.json(
          { error: 'No se pudo leer el archivo Word. Asegúrese de que sea un formato .docx válido.' },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Formato de archivo no soportado. Use PDF, Word (.docx) o texto (.txt)' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'El documento no contiene texto legible o está vacío.' },
        { status: 400 }
      );
    }

    // Limitar el texto para no exceder el contexto del modelo
    const maxChars = 8000;
    const truncatedText = extractedText.length > maxChars 
      ? extractedText.substring(0, maxChars) + '\n\n[... documento truncado por longitud ...]' 
      : extractedText;

    const zai = await ZAI.create();

    const prompt = `Analiza el siguiente documento de análisis y diagnóstico de una empresa/producto. Extrae la información relevante y organízala en la estructura indicada.

DOCUMENTO DE ANÁLISIS:
---
${truncatedText}
---

INSTRUCCIONES:
1. Lee cuidadosamente el documento y extrae toda la información relevante para un plan de marketing
2. Identifica el diagnóstico situacional, el contexto del mercado, los problemas detectados y las oportunidades
3. Si algún campo no se encuentra explícitamente en el documento, infiérelo basándote en la información disponible
4. Genera 3 objetivos SMART para cada P del marketing basados en el análisis del documento
5. Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "analisisSituacional": {
    "diagnostico": "Diagnóstico situacional completo extraído o inferido del documento",
    "contextoMercado": "Contexto del mercado extraído o inferido del documento",
    "problemasDetectados": ["problema 1", "problema 2", "problema 3"],
    "oportunidadesIdentificadas": ["oportunidad 1", "oportunidad 2", "oportunidad 3"]
  },
  "objetivosTentativos": {
    "producto": ["objetivo SMART 1", "objetivo SMART 2", "objetivo SMART 3"],
    "precio": ["objetivo SMART 1", "objetivo SMART 2", "objetivo SMART 3"],
    "distribucion": ["objetivo SMART 1", "objetivo SMART 2", "objetivo SMART 3"],
    "comunicacion": ["objetivo SMART 1", "objetivo SMART 2", "objetivo SMART 3"]
  }
}

IMPORTANTE:
- El diagnóstico debe ser un análisis completo de la situación actual
- El contexto de mercado debe incluir tendencias, competencia y factores externos
- Los problemas deben ser específicos y accionables (mínimo 2, máximo 5)
- Las oportunidades deben ser realistas y aprovechables (mínimo 2, máximo 5)
- Los objetivos deben ser SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales)
- Cada objetivo de producto debe referirse a aspectos de PRODUCTO (características, calidad, diseño, innovación)
- Cada objetivo de precio debe referirse a aspectos de PRECIO (niveles, estructura, políticas de precios)
- Cada objetivo de distribución debe referirse a aspectos de DISTRIBUCIÓN (canales, logística, cobertura)
- Cada objetivo de comunicación debe referirse a aspectos de COMUNICACIÓN (publicidad, promoción, mensajes)`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un experto analista de marketing especializado en analizar documentos de diagnóstico empresarial. Tu tarea es extraer información estructurada de documentos de análisis y generar un plan de marketing completo. 
          
IMPORTANTE: Debes generar ÚNICAMENTE estrategias y objetivos correspondientes a cada variable del marketing mix:
- Para PRODUCTO: aspectos de características, calidad, diseño, empaque, innovación del producto
- Para PRECIO: aspectos de niveles, estructuras, descuentos, políticas de precios
- Para DISTRIBUCIÓN: aspectos de canales, logística, cobertura, inventario, puntos de venta
- Para COMUNICACIÓN: aspectos de publicidad, relaciones públicas, marketing digital, promociones

Responde siempre con JSON válido y nada más.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const messageContent = completion.choices[0]?.message?.content;

    if (!messageContent) {
      throw new Error('No se recibió respuesta del modelo');
    }

    // Intentar parsear el JSON
    let analysisResult;
    try {
      const cleanContent = messageContent.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Raw content:', messageContent);
      throw new Error('La respuesta del modelo no contiene un JSON válido');
    }

    // Validar la estructura
    if (!analysisResult.analisisSituacional || !analysisResult.objetivosTentativos) {
      throw new Error('La estructura de la respuesta es inválida');
    }

    const { analisisSituacional, objetivosTentativos } = analysisResult;

    // Validar campos del análisis situacional
    if (!analisisSituacional.diagnostico || !analisisSituacional.contextoMercado) {
      throw new Error('Faltan campos obligatorios en el análisis situacional');
    }

    // Validar objetivos tentativos
    const requiredKeys = ['producto', 'precio', 'distribucion', 'comunicacion'];
    for (const key of requiredKeys) {
      if (!objetivosTentativos[key] || !Array.isArray(objetivosTentativos[key]) || objetivosTentativos[key].length !== 3) {
        throw new Error(`La estructura de objetivos para ${key} es inválida`);
      }
    }

    // Asegurar que problemas y oportunidades sean arrays
    if (!Array.isArray(analisisSituacional.problemasDetectados)) {
      analisisSituacional.problemasDetectados = [analisisSituacional.problemasDetectados || ''];
    }
    if (!Array.isArray(analisisSituacional.oportunidadesIdentificadas)) {
      analisisSituacional.oportunidadesIdentificadas = [analisisSituacional.oportunidadesIdentificadas || ''];
    }

    return NextResponse.json({
      analisisSituacional,
      objetivosTentativos,
      documentoResumen: {
        nombre: file.name,
        tamaño: `${(buffer.length / 1024).toFixed(1)} KB`,
        caracteresExtraidos: extractedText.length,
      }
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al analizar el documento. Por favor intente nuevamente.' },
      { status: 500 }
    );
  }
}
