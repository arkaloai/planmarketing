'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, Download, Target, Package, DollarSign, Store, Megaphone, FileText, Sparkles, Loader2, Upload, FileUp, CheckCircle2, AlertCircle } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  price: number
}

interface Estrategia {
  id: string
  nombre: string
  descripcion: string
}

interface MarketingPlan {
  analisisSituacional: {
    diagnostico: string
    contextoMercado: string
    problemasDetectados: string[]
    oportunidadesIdentificadas: string[]
  }
  objetivosTentativos: {
    producto: string[]
    precio: string[]
    distribucion: string[]
    comunicacion: string[]
  }
  producto: {
    objetivo: string
    nombre: string
    descripcion: string
    propuestaValor: string
    caracteristicas: string[]
    foda: {
      fortalezas: string
      oportunidades: string
      debilidades: string
      amenazas: string
    }
    estrategia: string
    estrategiasPropuestas: Estrategia[]
    estrategiaSeleccionada: string
    descripcionEstrategia: string
  }
  precio: {
    objetivo: string
    costoUnitario: number
    margenBeneficio: number
    estrategia: string
    competencia: Competitor[]
    estrategiasPropuestas: Estrategia[]
    estrategiaSeleccionada: string
    descripcionEstrategia: string
  }
  distribucion: {
    objetivo: string
    canales: string[]
    estrategiaLogistica: string
    inventarioMinimo: number
    estrategia: string
    estrategiasPropuestas: Estrategia[]
    estrategiaSeleccionada: string
    descripcionEstrategia: string
  }
  comunicacion: {
    objetivo: string
    objetivoSMART: string
    mensajeCentral: string
    canales: string[]
    presupuesto: number
    estrategia: string
    estrategiasPropuestas: Estrategia[]
    estrategiaSeleccionada: string
    descripcionEstrategia: string
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analisis')
  const [isImprovingObjective, setIsImprovingObjective] = useState(false)
  const [improvingType, setImprovingType] = useState<'producto' | 'precio' | 'distribucion' | 'comunicacion' | null>(null)
  const [improvingField, setImprovingField] = useState<string | null>(null)
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false)
  const [isGeneratingStrategies, setIsGeneratingStrategies] = useState(false)
  const [generatingStrategiesType, setGeneratingStrategiesType] = useState<'producto' | 'precio' | 'distribucion' | 'comunicacion' | null>(null)
  const [error, setError] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<{nombre: string; tamaño: string; caracteresExtraidos: number} | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [marketingPlan, setMarketingPlan] = useState<MarketingPlan>({
    analisisSituacional: {
      diagnostico: '',
      contextoMercado: '',
      problemasDetectados: [''],
      oportunidadesIdentificadas: ['']
    },
    objetivosTentativos: {
      producto: ['', '', ''],
      precio: ['', '', ''],
      distribucion: ['', '', ''],
      comunicacion: ['', '', '']
    },
    producto: {
      objetivo: '',
      nombre: '',
      descripcion: '',
      propuestaValor: '',
      caracteristicas: [''],
      foda: {
        fortalezas: '',
        oportunidades: '',
        debilidades: '',
        amenazas: ''
      },
      estrategia: '',
      estrategiasPropuestas: [],
      estrategiaSeleccionada: '',
      descripcionEstrategia: ''
    },
    precio: {
      objetivo: '',
      costoUnitario: 0,
      margenBeneficio: 50,
      estrategia: '',
      competencia: [],
      estrategiasPropuestas: [],
      estrategiaSeleccionada: '',
      descripcionEstrategia: ''
    },
    distribucion: {
      objetivo: '',
      canales: [],
      estrategiaLogistica: '',
      inventarioMinimo: 0,
      estrategia: '',
      estrategiasPropuestas: [],
      estrategiaSeleccionada: '',
      descripcionEstrategia: ''
    },
    comunicacion: {
      objetivo: '',
      objetivoSMART: '',
      mensajeCentral: '',
      canales: [],
      presupuesto: 0,
      estrategia: '',
      estrategiasPropuestas: [],
      estrategiaSeleccionada: '',
      descripcionEstrategia: ''
    }
  })

  const updateProducto = useCallback((field: string, value: any) => {
    setMarketingPlan(prev => ({
      ...prev,
      producto: { ...prev.producto, [field]: value }
    }))
  }, [])

  const updateAnalisisSituacional = useCallback((field: string, value: any) => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: { ...prev.analisisSituacional, [field]: value }
    }))
  }, [])

  const updateObjetivosTentativos = useCallback((p: string, index: number, value: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      objetivosTentativos: {
        ...prev.objetivosTentativos,
        [p]: prev.objetivosTentativos[p as keyof typeof prev.objetivosTentativos].map((obj, i) => i === index ? value : obj)
      }
    }))
  }, [])

  const addProblemaDetectado = useCallback(() => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: {
        ...prev.analisisSituacional,
        problemasDetectados: [...prev.analisisSituacional.problemasDetectados, '']
      }
    }))
  }, [])

  const removeProblemaDetectado = useCallback((index: number) => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: {
        ...prev.analisisSituacional,
        problemasDetectados: prev.analisisSituacional.problemasDetectados.filter((_, i) => i !== index)
      }
    }))
  }, [])

  const updateProblemaDetectado = useCallback((index: number, value: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: {
        ...prev.analisisSituacional,
        problemasDetectados: prev.analisisSituacional.problemasDetectados.map((prob, i) => i === index ? value : prob)
      }
    }))
  }, [])

  const addOportunidadIdentificada = useCallback(() => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: {
        ...prev.analisisSituacional,
        oportunidadesIdentificadas: [...prev.analisisSituacional.oportunidadesIdentificadas, '']
      }
    }))
  }, [])

  const removeOportunidadIdentificada = useCallback((index: number) => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: {
        ...prev.analisisSituacional,
        oportunidadesIdentificadas: prev.analisisSituacional.oportunidadesIdentificadas.filter((_, i) => i !== index)
      }
    }))
  }, [])

  const updateOportunidadIdentificada = useCallback((index: number, value: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      analisisSituacional: {
        ...prev.analisisSituacional,
        oportunidadesIdentificadas: prev.analisisSituacional.oportunidadesIdentificadas.map((oportunidad, i) => i === index ? value : oportunidad)
      }
    }))
  }, [])

  const updateProductoFODA = useCallback((field: string, value: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      producto: {
        ...prev.producto,
        foda: { ...prev.producto.foda, [field]: value }
      }
    }))
  }, [])

  const updatePrecio = useCallback((field: string, value: any) => {
    setMarketingPlan(prev => ({
      ...prev,
      precio: { ...prev.precio, [field]: value }
    }))
  }, [])

  const updateDistribucion = useCallback((field: string, value: any) => {
    setMarketingPlan(prev => ({
      ...prev,
      distribucion: { ...prev.distribucion, [field]: value }
    }))
  }, [])

  const updateComunicacion = useCallback((field: string, value: any) => {
    setMarketingPlan(prev => ({
      ...prev,
      comunicacion: { ...prev.comunicacion, [field]: value }
    }))
  }, [])

  const addCaracteristica = useCallback(() => {
    setMarketingPlan(prev => ({
      ...prev,
      producto: {
        ...prev.producto,
        caracteristicas: [...prev.producto.caracteristicas, '']
      }
    }))
  }, [])

  const updateCaracteristica = useCallback((index: number, value: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      producto: {
        ...prev.producto,
        caracteristicas: prev.producto.caracteristicas.map((car, i) => i === index ? value : car)
      }
    }))
  }, [])

  const removeCaracteristica = useCallback((index: number) => {
    setMarketingPlan(prev => ({
      ...prev,
      producto: {
        ...prev.producto,
        caracteristicas: prev.producto.caracteristicas.filter((_, i) => i !== index)
      }
    }))
  }, [])

  const addCompetitor = useCallback(() => {
    setMarketingPlan(prev => ({
      ...prev,
      precio: {
        ...prev.precio,
        competencia: [...prev.precio.competencia, { id: Date.now().toString(), name: '', price: 0 }]
      }
    }))
  }, [])

  const updateCompetitor = useCallback((id: string, field: string, value: any) => {
    setMarketingPlan(prev => ({
      ...prev,
      precio: {
        ...prev.precio,
        competencia: prev.precio.competencia.map(comp => 
          comp.id === id ? { ...comp, [field]: value } : comp
        )
      }
    }))
  }, [])

  const removeCompetitor = useCallback((id: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      precio: {
        ...prev.precio,
        competencia: prev.precio.competencia.filter(comp => comp.id !== id)
      }
    }))
  }, [])

  const toggleCanalDistribucion = useCallback((canal: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      distribucion: {
        ...prev.distribucion,
        canales: prev.distribucion.canales.includes(canal)
          ? prev.distribucion.canales.filter(c => c !== canal)
          : [...prev.distribucion.canales, canal]
      }
    }))
  }, [])

  const toggleCanalComunicacion = useCallback((canal: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      comunicacion: {
        ...prev.comunicacion,
        canales: prev.comunicacion.canales.includes(canal)
          ? prev.comunicacion.canales.filter(c => c !== canal)
          : [...prev.comunicacion.canales, canal]
      }
    }))
  }, [])

  const calcularPrecioSugerido = useCallback(() => {
    const { costoUnitario, margenBeneficio } = marketingPlan.precio
    if (margenBeneficio >= 100) return 0 // Evitar división por cero o negativo
    return costoUnitario / (1 - margenBeneficio / 100)
  }, [marketingPlan.precio])

  // Funciones para actualizar estrategias
  const updateEstrategiaSeleccionada = useCallback((tipo: 'producto' | 'precio' | 'distribucion' | 'comunicacion', estrategiaId: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        estrategiaSeleccionada: estrategiaId,
        descripcionEstrategia: ''
      }
    }))
  }, [])

  const updateDescripcionEstrategia = useCallback((tipo: 'producto' | 'precio' | 'distribucion' | 'comunicacion', descripcion: string) => {
    setMarketingPlan(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        descripcionEstrategia: descripcion
      }
    }))
  }, [])

  const improveFieldWithAI = useCallback(async (field: string, currentValue: string, type: 'producto' | 'precio' | 'distribucion' | 'comunicacion') => {
    if (!currentValue || currentValue.trim().length === 0) {
      alert('Por favor, escribe contenido primero para poder mejorarlo.')
      return
    }

    setIsImprovingObjective(true)
    setImprovingType(type)
    setImprovingField(field)
    
    try {
      let endpoint = ''
      let systemPrompt = ''

      // Determinar el endpoint y prompt según el campo
      if (field === 'objetivo') {
        switch (type) {
          case 'producto':
            endpoint = '/api/improve-product-objective'
            break
          case 'precio':
            endpoint = '/api/improve-price-objective'
            break
          case 'distribucion':
            endpoint = '/api/improve-distribution-objective'
            break
          case 'comunicacion':
            endpoint = '/api/improve-communication-objective'
            break
        }
      } else if (field === 'objetivoSMART') {
        endpoint = '/api/improve-smart-objective'
      } else {
        // Para otros campos, usar un endpoint genérico
        endpoint = '/api/improve-generic-field'
        systemPrompt = getFieldPrompt(field, type)
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          objective: currentValue,
          field,
          type,
          systemPrompt
        }),
      })

      if (!response.ok) {
        throw new Error('Error al mejorar el campo')
      }

      const data = await response.json()
      
      if (data.improvedObjective || data.improvedText) {
        const improvedText = data.improvedObjective || data.improvedText
        
        switch (type) {
          case 'producto':
            updateProducto(field, improvedText)
            break
          case 'precio':
            updatePrecio(field, improvedText)
            break
          case 'distribucion':
            updateDistribucion(field, improvedText)
            break
          case 'comunicacion':
            updateComunicacion(field, improvedText)
            break
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('No se pudo mejorar el contenido. Por favor, intenta nuevamente.')
    } finally {
      setIsImprovingObjective(false)
      setImprovingType(null)
      setImprovingField(null)
    }
  }, [updateProducto, updatePrecio, updateDistribucion, updateComunicacion])

  // Generar objetivos automáticamente basados en el análisis
  const generateObjectives = async () => {
    if (!marketingPlan.analisisSituacional.diagnostico || !marketingPlan.analisisSituacional.contextoMercado || 
        marketingPlan.analisisSituacional.problemasDetectados.filter(p => p.trim()).length === 0 || 
        marketingPlan.analisisSituacional.oportunidadesIdentificadas.filter(o => o.trim()).length === 0) {
      setError('Por favor, complete todos los campos del análisis (diagnóstico, contexto, problemas y oportunidades) antes de generar objetivos');
      return;
    }

    setIsGeneratingObjectives(true);
    setError('');

    try {
      const response = await fetch('/api/generate-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnostico: marketingPlan.analisisSituacional.diagnostico,
          contextoMercado: marketingPlan.analisisSituacional.contextoMercado,
          problemas: marketingPlan.analisisSituacional.problemasDetectados.filter(p => p.trim()),
          oportunidades: marketingPlan.analisisSituacional.oportunidadesIdentificadas.filter(o => o.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar objetivos');
      }

      const data = await response.json();
      
      // Actualizar el plan con los objetivos generados
      setMarketingPlan(prev => ({
        ...prev,
        objetivosTentativos: data.objetivos
      }));

    } catch (error) {
      console.error('Error generating objectives:', error);
      setError('Error al generar objetivos. Por favor intente nuevamente.');
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  // Generar estrategias automáticamente basadas en el objetivo seleccionado
  const generateStrategies = async (tipo: 'producto' | 'precio' | 'distribucion' | 'comunicacion') => {
    const objetivo = marketingPlan[tipo].objetivo;
    
    if (!objetivo || objetivo.trim().length === 0) {
      setError('Por favor, seleccione un objetivo antes de generar estrategias');
      return;
    }

    setIsGeneratingStrategies(true);
    setGeneratingStrategiesType(tipo);
    setError('');

    try {
      const response = await fetch('/api/generate-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo,
          objetivo,
          contexto: {
            diagnostico: marketingPlan.analisisSituacional.diagnostico,
            contextoMercado: marketingPlan.analisisSituacional.contextoMercado,
            problemas: marketingPlan.analisisSituacional.problemasDetectados.filter(p => p.trim()),
            oportunidades: marketingPlan.analisisSituacional.oportunidadesIdentificadas.filter(o => o.trim()),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar estrategias');
      }

      const data = await response.json();
      
      // Actualizar el plan con las estrategias generadas
      setMarketingPlan(prev => ({
        ...prev,
        [tipo]: {
          ...prev[tipo],
          estrategiasPropuestas: data.estrategias,
          estrategiaSeleccionada: '',
          descripcionEstrategia: ''
        }
      }));

    } catch (error) {
      console.error('Error generating strategies:', error);
      setError('Error al generar estrategias. Por favor intente nuevamente.');
    } finally {
      setIsGeneratingStrategies(false);
      setGeneratingStrategiesType(null);
    }
  };

  // Analizar documento subido
  const analyzeDocument = async (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const fileName = file.name.toLowerCase();
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      setError('Formato de archivo no soportado. Use PDF, Word (.docx) o texto (.txt)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
      return;
    }

    setIsAnalyzingDocument(true);
    setError('');
    setUploadedDocument(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el documento');
      }

      const data = await response.json();
      
      // Actualizar el plan con los datos extraídos del documento
      setMarketingPlan(prev => ({
        ...prev,
        analisisSituacional: {
          diagnostico: data.analisisSituacional.diagnostico || prev.analisisSituacional.diagnostico,
          contextoMercado: data.analisisSituacional.contextoMercado || prev.analisisSituacional.contextoMercado,
          problemasDetectados: data.analisisSituacional.problemasDetectados?.length > 0 
            ? data.analisisSituacional.problemasDetectados 
            : prev.analisisSituacional.problemasDetectados,
          oportunidadesIdentificadas: data.analisisSituacional.oportunidadesIdentificadas?.length > 0 
            ? data.analisisSituacional.oportunidadesIdentificadas 
            : prev.analisisSituacional.oportunidadesIdentificadas,
        },
        objetivosTentativos: data.objetivosTentativos || prev.objetivosTentativos,
      }));

      setUploadedDocument(data.documentoResumen);

    } catch (error) {
      console.error('Error analyzing document:', error);
      setError(error instanceof Error ? error.message : 'Error al analizar el documento. Por favor intente nuevamente.');
    } finally {
      setIsAnalyzingDocument(false);
    }
  };

  // Manejar la subida de archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeDocument(file);
    }
  };

  // Manejar drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      analyzeDocument(file);
    }
  };

  // Componente reutilizable para botón de mejora con IA
  const ImproveButton = ({ field, currentValue, type }: { 
    field: string, 
    currentValue: string, 
    type: 'producto' | 'precio' | 'distribucion' | 'comunicacion' 
  }) => (
    <Button 
      onClick={() => improveFieldWithAI(field, currentValue, type)} 
      size="sm" 
      variant="outline"
      disabled={isImprovingObjective && improvingType === type && improvingField === field}
      className="flex items-center gap-2"
    >
      {isImprovingObjective && improvingType === type && improvingField === field ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Mejorando...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Mejorar con IA
        </>
      )}
    </Button>
  )

  const getFieldPrompt = (field: string, type: string) => {
    const prompts: Record<string, string> = {
      'diagnostico': 'Mejora este diagnóstico situacional para que sea más analítico, preciso y completo. Incluye datos cuantitativos cuando sea posible.',
      'contextoMercado': 'Mejora esta descripción del contexto de mercado para que sea más estratégica y detallada. Incluye tendencias, tamaño del mercado y comportamientos del consumidor.',
      'nombre': 'Mejora este nombre de producto para que sea más atractivo y memorable. Responde únicamente con el nombre mejorado.',
      'descripcion': 'Mejora esta descripción de producto para que sea más persuasiva y profesional. Mantén el mismo significado pero mejora el estilo.',
      'propuestaValor': 'Mejora esta propuesta de valor para que sea más clara y convincente. Enfócate en los beneficios clave.',
      'estrategiaLogistica': 'Mejora esta descripción de estrategia logística para que sea más detallada y profesional.',
      'mensajeCentral': 'Mejora este mensaje central para que sea más impactante y memorable.',
      'fortalezas': 'Mejora esta descripción de fortalezas para que sea más específica y contundente.',
      'oportunidades': 'Mejora esta descripción de oportunidades para que sea más concreta y realista.',
      'debilidades': 'Mejora esta descripción de debilidades para que sea más honesta y constructiva.',
      'amenazas': 'Mejora esta descripción de amenazas para que sea más precisa y estratégica.'
    }
    return prompts[field] || 'Mejora este texto para que sea más profesional y efectivo.'
  }

  const exportToMarkdown = useCallback(() => {
    const markdown = `# Plan de Marketing Completo

## 📊 Análisis Situacional y Diagnóstico

### Diagnóstico Situacional
${marketingPlan.analisisSituacional.diagnostico || 'No especificado'}

### Contexto del Mercado
${marketingPlan.analisisSituacional.contextoMercado || 'No especificado'}

### Problemas Detectados
${marketingPlan.analisisSituacional.problemasDetectados.filter(p => p.trim()).length > 0 
  ? marketingPlan.analisisSituacional.problemasDetectados.filter(p => p.trim()).map((p, i) => `${i + 1}. ${p}`).join('\n')
  : '- No especificado'}

### Oportunidades Identificadas
${marketingPlan.analisisSituacional.oportunidadesIdentificadas.filter(o => o.trim()).length > 0 
  ? marketingPlan.analisisSituacional.oportunidadesIdentificadas.filter(o => o.trim()).map((o, i) => `${i + 1}. ${o}`).join('\n')
  : '- No especificado'}

---

## 🎯 Objetivos Tentativos por P

### Objetivos Tentativos de Producto
${marketingPlan.objetivosTentativos.producto.filter(obj => obj.trim()).length > 0 
  ? marketingPlan.objetivosTentativos.producto.filter(obj => obj.trim()).map((obj, i) => `${i + 1}. ${obj}`).join('\n')
  : '- No especificado'}

### Objetivos Tentativos de Precio
${marketingPlan.objetivosTentativos.precio.filter(obj => obj.trim()).length > 0 
  ? marketingPlan.objetivosTentativos.precio.filter(obj => obj.trim()).map((obj, i) => `${i + 1}. ${obj}`).join('\n')
  : '- No especificado'}

### Objetivos Tentativos de Distribución
${marketingPlan.objetivosTentativos.distribucion.filter(obj => obj.trim()).length > 0 
  ? marketingPlan.objetivosTentativos.distribucion.filter(obj => obj.trim()).map((obj, i) => `${i + 1}. ${obj}`).join('\n')
  : '- No especificado'}

### Objetivos Tentativos de Comunicación
${marketingPlan.objetivosTentativos.comunicacion.filter(obj => obj.trim()).length > 0 
  ? marketingPlan.objetivosTentativos.comunicacion.filter(obj => obj.trim()).map((obj, i) => `${i + 1}. ${obj}`).join('\n')
  : '- No especificado'}

---

## 1. Plan de Producto

### Objetivo Final del Producto
${marketingPlan.producto.objetivo || 'No especificado'}

### Estrategia de Producto
${marketingPlan.producto.estrategia || 'No especificado'}

### Nombre del Producto
${marketingPlan.producto.nombre || 'No especificado'}

### Descripción / Visión
${marketingPlan.producto.descripcion || 'No especificado'}

### Propuesta de Valor Única (PVU)
${marketingPlan.producto.propuestaValor || 'No especificado'}

### Características Clave
${marketingPlan.producto.caracteristicas.filter(c => c.trim()).length > 0 
  ? marketingPlan.producto.caracteristicas.filter(c => c.trim()).map(c => `- ${c}`).join('\n')
  : '- No especificado'}

### Análisis FODA

**Fortalezas:**
${marketingPlan.producto.foda.fortalezas || 'No especificado'}

**Oportunidades:**
${marketingPlan.producto.foda.oportunidades || 'No especificado'}

**Debilidades:**
${marketingPlan.producto.foda.debilidades || 'No especificado'}

**Amenazas:**
${marketingPlan.producto.foda.amenazas || 'No especificado'}

---

## 2. Plan de Precio

### Objetivo Final de Precio
${marketingPlan.precio.objetivo || 'No especificado'}

### Estrategia de Precios
${marketingPlan.precio.estrategia || 'No especificado'}

### Costo Unitario de Producción (CUP)
$${marketingPlan.precio.costoUnitario.toFixed(2)}

### Margen de Beneficio Deseado
${marketingPlan.precio.margenBeneficio}%

### Precio Sugerido
$${calcularPrecioSugerido().toFixed(2)}

### Análisis de Competencia
${marketingPlan.precio.competencia.length > 0 
  ? marketingPlan.precio.competencia.map(c => `- **${c.name}**: $${c.price.toFixed(2)}`).join('\n')
  : '- No especificado'}

---

## 3. Plan de Distribución (Plaza)

### Objetivo Final de Distribución
${marketingPlan.distribucion.objetivo || 'No especificado'}

### Estrategia de Distribución
${marketingPlan.distribucion.estrategia || 'No especificado'}

### Canales de Venta
${marketingPlan.distribucion.canales.length > 0 
  ? marketingPlan.distribucion.canales.map(c => `- ${c}`).join('\n')
  : '- No especificado'}

### Estrategia Logística
${marketingPlan.distribucion.estrategiaLogistica || 'No especificado'}

### Métricas de Inventario
**Nivel de Inventario Mínimo de Seguridad:** ${marketingPlan.distribucion.inventarioMinimo} unidades

---

## 4. Plan de Comunicación (Promoción)

### Objetivo Final de Comunicación
${marketingPlan.comunicacion.objetivo || 'No especificado'}

### Estrategia de Comunicación
${marketingPlan.comunicacion.estrategia || 'No especificado'}

### Objetivo de Comunicación SMART
${marketingPlan.comunicacion.objetivoSMART || 'No especificado'}

### Mensaje Central / Lema
${marketingPlan.comunicacion.mensajeCentral || 'No especificado'}

### Canales de Promoción
${marketingPlan.comunicacion.canales.length > 0 
  ? marketingPlan.comunicacion.canales.map(c => `- ${c}`).join('\n')
  : '- No especificado'}

### Presupuesto Asignado
$${marketingPlan.comunicacion.presupuesto.toFixed(2)}

---

*Generado el ${new Date().toLocaleDateString('es-ES')}*`

    navigator.clipboard.writeText(markdown)
    alert('¡Plan de marketing exportado al portapapeles!')
  }, [marketingPlan, calcularPrecioSugerido])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Plan de Marketing 4P's</h1>
          <p className="text-slate-600">Estructura tu estrategia de marketing completa</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="analisis" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="producto" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Producto</span>
            </TabsTrigger>
            <TabsTrigger value="precio" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Precio</span>
            </TabsTrigger>
            <TabsTrigger value="distribucion" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Distribución</span>
            </TabsTrigger>
            <TabsTrigger value="comunicacion" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Promoción</span>
            </TabsTrigger>
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analisis" className="space-y-6">
            {/* Document Upload Card */}
            <Card className="border-dashed border-2 border-amber-300 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <FileUp className="w-5 h-5" />
                  Subir Documento de Análisis y Diagnóstico
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Sube un documento PDF, Word o de texto con tu análisis de diagnóstico y la IA lo analizará automáticamente para llenar todos los campos y generar objetivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-amber-500 bg-amber-100 scale-[1.02]'
                      : 'border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50/50'
                  } ${isAnalyzingDocument ? 'pointer-events-none opacity-60' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="document-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={handleFileUpload}
                    disabled={isAnalyzingDocument}
                  />
                  
                  {isAnalyzingDocument ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                          <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-amber-900">Analizando documento...</p>
                        <p className="text-sm text-amber-700 mt-1">Extrayendo información y generando análisis y objetivos</p>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-sm text-amber-600">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          Leyendo documento
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></span>
                          Analizando contenido
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></span>
                          Generando objetivos
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                          <Upload className="w-8 h-8 text-amber-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-amber-900">
                          Arrastra tu documento aquí o haz clic para seleccionar
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          Formatos soportados: PDF, Word (.docx), Texto (.txt, .md) — Máximo 10MB
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs text-amber-600">
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded">
                          📄 PDF
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded">
                          📝 Word
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded">
                          📋 TXT
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document analysis result */}
                {uploadedDocument && !isAnalyzingDocument && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">Documento analizado exitosamente</p>
                      <div className="text-sm text-green-700 mt-1 space-y-1">
                        <p>Archivo: <span className="font-medium">{uploadedDocument.nombre}</span></p>
                        <p>Tamaño: <span className="font-medium">{uploadedDocument.tamaño}</span></p>
                        <p>Caracteres extraídos: <span className="font-medium">{uploadedDocument.caracteresExtraidos.toLocaleString()}</span></p>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Los campos de análisis y objetivos tentativos han sido completados automáticamente. Puedes editarlos si lo deseas.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message for document */}
                {error && !isAnalyzingDocument && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900">Error al analizar el documento</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Análisis Situacional y Diagnóstico
                </CardTitle>
                <CardDescription>Fundamenta tu plan de marketing con un análisis completo de la situación actual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="diagnostico">Diagnóstico Situacional</Label>
                    <ImproveButton field="diagnostico" currentValue={marketingPlan.analisisSituacional.diagnostico} type="producto" />
                  </div>
                  <Textarea
                    id="diagnostico"
                    value={marketingPlan.analisisSituacional.diagnostico}
                    onChange={(e) => updateAnalisisSituacional('diagnostico', e.target.value)}
                    placeholder="Describe la situación actual de tu empresa/producto, incluyendo datos relevantes, contexto y principales hallazgos..."
                    rows={6}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Incluye información sobre: situación financiera, posición en el mercado, recursos disponibles, desempeño reciente, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contexto-mercado">Contexto del Mercado</Label>
                    <ImproveButton field="contextoMercado" currentValue={marketingPlan.analisisSituacional.contextoMercado} type="producto" />
                  </div>
                  <Textarea
                    id="contexto-mercado"
                    value={marketingPlan.analisisSituacional.contextoMercado}
                    onChange={(e) => updateAnalisisSituacional('contextoMercado', e.target.value)}
                    placeholder="Describe el entorno del mercado: tamaño, tendencias, competencia, comportamiento del consumidor, factores externos..."
                    rows={6}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Considera: tendencias del sector, cambios tecnológicos, factores económicos, regulaciones, comportamiento del consumidor.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Problemas Detectados</Label>
                    <Button onClick={addProblemaDetectado} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Problema
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {marketingPlan.analisisSituacional.problemasDetectados.map((problema, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={problema}
                          onChange={(e) => updateProblemaDetectado(index, e.target.value)}
                          placeholder="Describe un problema específico detectado..."
                          rows={2}
                          className="flex-1"
                        />
                        {marketingPlan.analisisSituacional.problemasDetectados.length > 1 && (
                          <Button
                            onClick={() => removeProblemaDetectado(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Oportunidades Identificadas</Label>
                    <Button onClick={addOportunidadIdentificada} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Oportunidad
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {marketingPlan.analisisSituacional.oportunidadesIdentificadas.map((oportunidad, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={oportunidad}
                          onChange={(e) => updateOportunidadIdentificada(index, e.target.value)}
                          placeholder="Describe una oportunidad específica identificada..."
                          rows={2}
                          className="flex-1"
                        />
                        {marketingPlan.analisisSituacional.oportunidadesIdentificadas.length > 1 && (
                          <Button
                            onClick={() => removeOportunidadIdentificada(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos Tentativos por P
                </CardTitle>
                <CardDescription>Basado en tu diagnóstico, define 3 objetivos tentativos para cada P del marketing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h4 className="font-semibold text-blue-900">Generar Objetivos con IA</h4>
                    <p className="text-sm text-blue-700">Basado en tu análisis, el sistema propondrá 3 objetivos para cada P</p>
                  </div>
                  <Button 
                    onClick={generateObjectives}
                    disabled={isGeneratingObjectives || !marketingPlan.analisisSituacional.diagnostico || !marketingPlan.analisisSituacional.contextoMercado}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingObjectives ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generar Objetivos
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Objetivos Tentativos de Producto
                  </Label>
                  {marketingPlan.objetivosTentativos.producto.map((objetivo, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Objetivo {index + 1}</Label>
                      <Textarea
                        value={objetivo}
                        onChange={(e) => updateObjetivosTentativos('producto', index, e.target.value)}
                        placeholder="Define un objetivo tentativo para la estrategia de producto..."
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Objetivos Tentativos de Precio
                  </Label>
                  {marketingPlan.objetivosTentativos.precio.map((objetivo, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Objetivo {index + 1}</Label>
                      <Textarea
                        value={objetivo}
                        onChange={(e) => updateObjetivosTentativos('precio', index, e.target.value)}
                        placeholder="Define un objetivo tentativo para la estrategia de precios..."
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Objetivos Tentativos de Distribución
                  </Label>
                  {marketingPlan.objetivosTentativos.distribucion.map((objetivo, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Objetivo {index + 1}</Label>
                      <Textarea
                        value={objetivo}
                        onChange={(e) => updateObjetivosTentativos('distribucion', index, e.target.value)}
                        placeholder="Define un objetivo tentativo para la estrategia de distribución..."
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Objetivos Tentativos de Comunicación
                  </Label>
                  {marketingPlan.objetivosTentativos.comunicacion.map((objetivo, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Objetivo {index + 1}</Label>
                      <Textarea
                        value={objetivo}
                        onChange={(e) => updateObjetivosTentativos('comunicacion', index, e.target.value)}
                        placeholder="Define un objetivo tentativo para la estrategia de comunicación..."
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="producto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Plan de Producto
                </CardTitle>
                <CardDescription>Define los aspectos fundamentales de tu producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Objetivos Tentativos de Producto</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    {marketingPlan.objetivosTentativos.producto.filter(obj => obj.trim()).length > 0 ? (
                      marketingPlan.objetivosTentativos.producto.filter(obj => obj.trim()).map((obj, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{obj}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-600 italic">No hay objetivos tentativos definidos. Ve a la pestaña "Análisis" para definirlos.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="objetivo-producto">Objetivo Final del Producto</Label>
                    <ImproveButton field="objetivo" currentValue={marketingPlan.producto.objetivo} type="producto" />
                  </div>
                  <Textarea
                    id="objetivo-producto"
                    value={marketingPlan.producto.objetivo}
                    onChange={(e) => updateProducto('objetivo', e.target.value)}
                    placeholder="Basado en los objetivos tentativos, define el objetivo final y específico para tu estrategia de producto..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Selecciona y refina uno de los objetivos tentativos anteriores o combina elementos para crear tu objetivo definitivo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estrategia-producto">Estrategia de Producto</Label>
                  <Select value={marketingPlan.producto.estrategia} onValueChange={(value) => updateProducto('estrategia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una estrategia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diferenciacion">Diferenciación</SelectItem>
                      <SelectItem value="liderazgo-costos">Liderazgo en Costos</SelectItem>
                      <SelectItem value="enfoque-nicho">Enfoque en Nicho</SelectItem>
                      <SelectItem value="innovacion">Innovación Continua</SelectItem>
                      <SelectItem value="calidad">Calidad Superior</SelectItem>
                      <SelectItem value="personalizacion">Personalización Masiva</SelectItem>
                      <SelectItem value="ecologico">Producto Ecológico/Sostenible</SelectItem>
                      <SelectItem value="luxo">Posicionamiento de Lujo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {marketingPlan.producto.objetivo && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <h4 className="font-semibold text-green-900">Generar Estrategias con IA</h4>
                        <p className="text-sm text-green-700">Basado en tu objetivo, el sistema propondrá 3 estrategias específicas</p>
                      </div>
                      <Button 
                        onClick={() => generateStrategies('producto')}
                        disabled={isGeneratingStrategies && generatingStrategiesType === 'producto'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isGeneratingStrategies && generatingStrategiesType === 'producto' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar Estrategias
                          </>
                        )}
                      </Button>
                    </div>

                    {marketingPlan.producto.estrategiasPropuestas.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-green-800">Estrategias Propuestas</Label>
                        <div className="space-y-3">
                          {marketingPlan.producto.estrategiasPropuestas.map((estrategia) => (
                            <Card key={estrategia.id} className={`cursor-pointer transition-all ${
                              marketingPlan.producto.estrategiaSeleccionada === estrategia.id 
                                ? 'ring-2 ring-green-500 bg-green-50' 
                                : 'hover:bg-gray-50'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="estrategia-producto"
                                    checked={marketingPlan.producto.estrategiaSeleccionada === estrategia.id}
                                    onChange={() => updateEstrategiaSeleccionada('producto', estrategia.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-green-900 mb-2">{estrategia.nombre}</h5>
                                    <p className="text-sm text-gray-700 mb-3">{estrategia.descripcion}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {marketingPlan.producto.estrategiaSeleccionada && (
                          <div className="space-y-2">
                            <Label htmlFor="descripcion-estrategia-producto">Describe tu implementación</Label>
                            <Textarea
                              id="descripcion-estrategia-producto"
                              value={marketingPlan.producto.descripcionEstrategia}
                              onChange={(e) => updateDescripcionEstrategia('producto', e.target.value)}
                              placeholder="Describe cómo implementarás esta estrategia en tu contexto específico..."
                              rows={4}
                            />
                            <p className="text-xs text-slate-500">
                              💡 Personaliza la estrategia seleccionada con los detalles específicos de tu negocio.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="nombre-producto">Nombre del Producto</Label>
                      <ImproveButton field="nombre" currentValue={marketingPlan.producto.nombre} type="producto" />
                    </div>
                    <Input
                      id="nombre-producto"
                      value={marketingPlan.producto.nombre}
                      onChange={(e) => updateProducto('nombre', e.target.value)}
                      placeholder="Ej: Café Orgánico Premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="propuesta-valor">Propuesta de Valor Única</Label>
                      <ImproveButton field="propuestaValor" currentValue={marketingPlan.producto.propuestaValor} type="producto" />
                    </div>
                    <Textarea
                      id="propuesta-valor"
                      value={marketingPlan.producto.propuestaValor}
                      onChange={(e) => updateProducto('propuestaValor', e.target.value)}
                      placeholder="¿Qué te hace único en el mercado?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="descripcion">Descripción / Visión</Label>
                    <ImproveButton field="descripcion" currentValue={marketingPlan.producto.descripcion} type="producto" />
                  </div>
                  <Textarea
                    id="descripcion"
                    value={marketingPlan.producto.descripcion}
                    onChange={(e) => updateProducto('descripcion', e.target.value)}
                    placeholder="Describe tu producto y su visión en el mercado"
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Características Clave</Label>
                    <Button onClick={addCaracteristica} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {marketingPlan.producto.caracteristicas.map((caracteristica, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={caracteristica}
                          onChange={(e) => updateCaracteristica(index, e.target.value)}
                          placeholder="Característica del producto"
                        />
                        {marketingPlan.producto.caracteristicas.length > 1 && (
                          <Button
                            onClick={() => removeCaracteristica(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Análisis FODA</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fortalezas">Fortalezas</Label>
                        <ImproveButton field="fortalezas" currentValue={marketingPlan.producto.foda.fortalezas} type="producto" />
                      </div>
                      <Textarea
                        id="fortalezas"
                        value={marketingPlan.producto.foda.fortalezas}
                        onChange={(e) => updateProductoFODA('fortalezas', e.target.value)}
                        placeholder="¿Qué ventajas internas tienes?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="oportunidades">Oportunidades</Label>
                        <ImproveButton field="oportunidades" currentValue={marketingPlan.producto.foda.oportunidades} type="producto" />
                      </div>
                      <Textarea
                        id="oportunidades"
                        value={marketingPlan.producto.foda.oportunidades}
                        onChange={(e) => updateProductoFODA('oportunidades', e.target.value)}
                        placeholder="¿Qué oportunidades externas puedes aprovechar?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debilidades">Debilidades</Label>
                        <ImproveButton field="debilidades" currentValue={marketingPlan.producto.foda.debilidades} type="producto" />
                      </div>
                      <Textarea
                        id="debilidades"
                        value={marketingPlan.producto.foda.debilidades}
                        onChange={(e) => updateProductoFODA('debilidades', e.target.value)}
                        placeholder="¿Qué limitaciones internas tienes?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="amenazas">Amenazas</Label>
                        <ImproveButton field="amenazas" currentValue={marketingPlan.producto.foda.amenazas} type="producto" />
                      </div>
                      <Textarea
                        id="amenazas"
                        value={marketingPlan.producto.foda.amenazas}
                        onChange={(e) => updateProductoFODA('amenazas', e.target.value)}
                        placeholder="¿Qué amenazas externas enfrentas?"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Plan de Precio
                </CardTitle>
                <CardDescription>Define tu estrategia de precios y análisis competitivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">📋 Objetivos Tentativos de Precio</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    {marketingPlan.objetivosTentativos.precio.filter(obj => obj.trim()).length > 0 ? (
                      marketingPlan.objetivosTentativos.precio.filter(obj => obj.trim()).map((obj, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{obj}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-green-600 italic">No hay objetivos tentativos definidos. Ve a la pestaña "Análisis" para definirlos.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="objetivo-precio">Objetivo Final de Precio</Label>
                    <ImproveButton field="objetivo" currentValue={marketingPlan.precio.objetivo} type="precio" />
                  </div>
                  <Textarea
                    id="objetivo-precio"
                    value={marketingPlan.precio.objetivo}
                    onChange={(e) => updatePrecio('objetivo', e.target.value)}
                    placeholder="Basado en los objetivos tentativos, define el objetivo final y específico para tu estrategia de precios..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Selecciona y refina uno de los objetivos tentativos anteriores o combina elementos para crear tu objetivo definitivo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estrategia-precios">Estrategia de Precios</Label>
                  <Select value={marketingPlan.precio.estrategia} onValueChange={(value) => updatePrecio('estrategia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una estrategia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skimming">Precio Skimming (Alto inicial)</SelectItem>
                      <SelectItem value="penetracion">Penetración de Mercado (Bajo inicial)</SelectItem>
                      <SelectItem value="valor">Basado en Valor</SelectItem>
                      <SelectItem value="competitivo">Precio Competitivo</SelectItem>
                      <SelectItem value="dinamico">Precios Dinámicos</SelectItem>
                      <SelectItem value="psicologico">Precio Psicológico</SelectItem>
                      <SelectItem value="premium">Precio Premium</SelectItem>
                      <SelectItem value="economia">Economía/Escala</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {marketingPlan.precio.objetivo && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <h4 className="font-semibold text-green-900">Generar Estrategias con IA</h4>
                        <p className="text-sm text-green-700">Basado en tu objetivo, el sistema propondrá 3 estrategias específicas</p>
                      </div>
                      <Button 
                        onClick={() => generateStrategies('precio')}
                        disabled={isGeneratingStrategies && generatingStrategiesType === 'precio'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isGeneratingStrategies && generatingStrategiesType === 'precio' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar Estrategias
                          </>
                        )}
                      </Button>
                    </div>

                    {marketingPlan.precio.estrategiasPropuestas.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-green-800">Estrategias Propuestas</Label>
                        <div className="space-y-3">
                          {marketingPlan.precio.estrategiasPropuestas.map((estrategia) => (
                            <Card key={estrategia.id} className={`cursor-pointer transition-all ${
                              marketingPlan.precio.estrategiaSeleccionada === estrategia.id 
                                ? 'ring-2 ring-green-500 bg-green-50' 
                                : 'hover:bg-gray-50'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="estrategia-precio"
                                    checked={marketingPlan.precio.estrategiaSeleccionada === estrategia.id}
                                    onChange={() => updateEstrategiaSeleccionada('precio', estrategia.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-green-900 mb-2">{estrategia.nombre}</h5>
                                    <p className="text-sm text-gray-700 mb-3">{estrategia.descripcion}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {marketingPlan.precio.estrategiaSeleccionada && (
                          <div className="space-y-2">
                            <Label htmlFor="descripcion-estrategia-precio">Describe tu implementación</Label>
                            <Textarea
                              id="descripcion-estrategia-precio"
                              value={marketingPlan.precio.descripcionEstrategia}
                              onChange={(e) => updateDescripcionEstrategia('precio', e.target.value)}
                              placeholder="Describe cómo implementarás esta estrategia de precios en tu contexto específico..."
                              rows={4}
                            />
                            <p className="text-xs text-slate-500">
                              💡 Personaliza la estrategia seleccionada con los detalles específicos de tu negocio.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="costo-unitario">Costo Unitario de Producción (CUP)</Label>
                    <Input
                      id="costo-unitario"
                      type="number"
                      value={marketingPlan.precio.costoUnitario}
                      onChange={(e) => updatePrecio('costoUnitario', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margen-beneficio">Margen de Beneficio Deseado: {marketingPlan.precio.margenBeneficio}%</Label>
                    <Slider
                      id="margen-beneficio"
                      min={0}
                      max={200}
                      step={5}
                      value={[marketingPlan.precio.margenBeneficio]}
                      onValueChange={(value) => updatePrecio('margenBeneficio', value[0])}
                      className="mt-4"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Precio Sugerido:</span>
                    <span className="text-2xl font-bold text-slate-900">
                      ${calcularPrecioSugerido().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Análisis de Competencia</Label>
                    <Button onClick={addCompetitor} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Competidor
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {marketingPlan.precio.competencia.map((competitor) => (
                      <div key={competitor.id} className="flex gap-2 p-3 border rounded-lg">
                        <Input
                          value={competitor.name}
                          onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                          placeholder="Nombre del competidor"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={competitor.price}
                          onChange={(e) => updateCompetitor(competitor.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Precio"
                          className="w-32"
                        />
                        <Button
                          onClick={() => removeCompetitor(competitor.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {marketingPlan.precio.competencia.length === 0 && (
                      <p className="text-center text-slate-500 py-4">No hay competidores agregados</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribucion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Plan de Distribución (Plaza)
                </CardTitle>
                <CardDescription>Define tus canales de venta y estrategia logística</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">📋 Objetivos Tentativos de Distribución</h4>
                  <div className="space-y-2 text-sm text-orange-800">
                    {marketingPlan.objetivosTentativos.distribucion.filter(obj => obj.trim()).length > 0 ? (
                      marketingPlan.objetivosTentativos.distribucion.filter(obj => obj.trim()).map((obj, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{obj}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-orange-600 italic">No hay objetivos tentativos definidos. Ve a la pestaña "Análisis" para definirlos.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="objetivo-distribucion">Objetivo Final de Distribución</Label>
                    <ImproveButton field="objetivo" currentValue={marketingPlan.distribucion.objetivo} type="distribucion" />
                  </div>
                  <Textarea
                    id="objetivo-distribucion"
                    value={marketingPlan.distribucion.objetivo}
                    onChange={(e) => updateDistribucion('objetivo', e.target.value)}
                    placeholder="Basado en los objetivos tentativos, define el objetivo final y específico para tu estrategia de distribución..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Selecciona y refina uno de los objetivos tentativos anteriores o combina elementos para crear tu objetivo definitivo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estrategia-distribucion">Estrategia de Distribución</Label>
                  <Select value={marketingPlan.distribucion.estrategia} onValueChange={(value) => updateDistribucion('estrategia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una estrategia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intensiva">Distribución Intensiva</SelectItem>
                      <SelectItem value="selectiva">Distribución Selectiva</SelectItem>
                      <SelectItem value="exclusiva">Distribución Exclusiva</SelectItem>
                      <SelectItem value="omnicanal">Estrategia Omnicanal</SelectItem>
                      <SelectItem value="directa">Venta Directa</SelectItem>
                      <SelectItem value="indirecta">Venta Indirecta</SelectItem>
                      <SelectItem value="hbrida">Modelo Híbrido</SelectItem>
                      <SelectItem value="franquicias">Sistema de Franquicias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {marketingPlan.distribucion.objetivo && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <h4 className="font-semibold text-green-900">Generar Estrategias con IA</h4>
                        <p className="text-sm text-green-700">Basado en tu objetivo, el sistema propondrá 3 estrategias específicas</p>
                      </div>
                      <Button 
                        onClick={() => generateStrategies('distribucion')}
                        disabled={isGeneratingStrategies && generatingStrategiesType === 'distribucion'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isGeneratingStrategies && generatingStrategiesType === 'distribucion' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar Estrategias
                          </>
                        )}
                      </Button>
                    </div>

                    {marketingPlan.distribucion.estrategiasPropuestas.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-green-800">Estrategias Propuestas</Label>
                        <div className="space-y-3">
                          {marketingPlan.distribucion.estrategiasPropuestas.map((estrategia) => (
                            <Card key={estrategia.id} className={`cursor-pointer transition-all ${
                              marketingPlan.distribucion.estrategiaSeleccionada === estrategia.id 
                                ? 'ring-2 ring-green-500 bg-green-50' 
                                : 'hover:bg-gray-50'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="estrategia-distribucion"
                                    checked={marketingPlan.distribucion.estrategiaSeleccionada === estrategia.id}
                                    onChange={() => updateEstrategiaSeleccionada('distribucion', estrategia.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-green-900 mb-2">{estrategia.nombre}</h5>
                                    <p className="text-sm text-gray-700 mb-3">{estrategia.descripcion}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {marketingPlan.distribucion.estrategiaSeleccionada && (
                          <div className="space-y-2">
                            <Label htmlFor="descripcion-estrategia-distribucion">Describe tu implementación</Label>
                            <Textarea
                              id="descripcion-estrategia-distribucion"
                              value={marketingPlan.distribucion.descripcionEstrategia}
                              onChange={(e) => updateDescripcionEstrategia('distribucion', e.target.value)}
                              placeholder="Describe cómo implementarás esta estrategia de distribución en tu contexto específico..."
                              rows={4}
                            />
                            <p className="text-xs text-slate-500">
                              💡 Personaliza la estrategia seleccionada con los detalles específicos de tu negocio.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Separator />
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Canales de Venta</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'E-commerce Propio',
                      'Retail Físico',
                      'Mayoristas',
                      'Venta Directa'
                    ].map((canal) => (
                      <div key={canal} className="flex items-center space-x-2">
                        <Checkbox
                          id={canal}
                          checked={marketingPlan.distribucion.canales.includes(canal)}
                          onCheckedChange={() => toggleCanalDistribucion(canal)}
                        />
                        <Label htmlFor={canal} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {canal}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {marketingPlan.distribucion.canales.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {marketingPlan.distribucion.canales.map((canal) => (
                        <Badge key={canal} variant="secondary">
                          {canal}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="estrategia-logistica">Estrategia Logística</Label>
                    <ImproveButton field="estrategiaLogistica" currentValue={marketingPlan.distribucion.estrategiaLogistica} type="distribucion" />
                  </div>
                  <Textarea
                    id="estrategia-logistica"
                    value={marketingPlan.distribucion.estrategiaLogistica}
                    onChange={(e) => updateDistribucion('estrategiaLogistica', e.target.value)}
                    placeholder="Describe tu método de almacenamiento y envío"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventario-minimo">Nivel de Inventario Mínimo de Seguridad</Label>
                  <Input
                    id="inventario-minimo"
                    type="number"
                    value={marketingPlan.distribucion.inventarioMinimo}
                    onChange={(e) => updateDistribucion('inventarioMinimo', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comunicacion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Plan de Comunicación (Promoción)
                </CardTitle>
                <CardDescription>Define tu estrategia de comunicación y promoción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">📋 Objetivos Tentativos de Comunicación</h4>
                  <div className="space-y-2 text-sm text-purple-800">
                    {marketingPlan.objetivosTentativos.comunicacion.filter(obj => obj.trim()).length > 0 ? (
                      marketingPlan.objetivosTentativos.comunicacion.filter(obj => obj.trim()).map((obj, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{obj}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-purple-600 italic">No hay objetivos tentativos definidos. Ve a la pestaña "Análisis" para definirlos.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="objetivo-comunicacion">Objetivo Final de Comunicación</Label>
                    <ImproveButton field="objetivo" currentValue={marketingPlan.comunicacion.objetivo} type="comunicacion" />
                  </div>
                  <Textarea
                    id="objetivo-comunicacion"
                    value={marketingPlan.comunicacion.objetivo}
                    onChange={(e) => updateComunicacion('objetivo', e.target.value)}
                    placeholder="Basado en los objetivos tentativos, define el objetivo final y específico para tu estrategia de comunicación..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Selecciona y refina uno de los objetivos tentativos anteriores o combina elementos para crear tu objetivo definitivo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estrategia-comunicacion">Estrategia de Comunicación</Label>
                  <Select value={marketingPlan.comunicacion.estrategia} onValueChange={(value) => updateComunicacion('estrategia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una estrategia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Generación de Awareness (Notoriedad)</SelectItem>
                      <SelectItem value="consideracion">Fomento de Consideración</SelectItem>
                      <SelectItem value="conversion">Impulso a Conversión</SelectItem>
                      <SelectItem value="lealtad">Programa de Lealtad</SelectItem>
                      <SelectItem value="advocacy">Brand Advocacy</SelectItem>
                      <SelectItem value="content">Marketing de Contenidos</SelectItem>
                      <SelectItem value="influencer">Marketing de Influencers</SelectItem>
                      <SelectItem value="experiential">Marketing Experiencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {marketingPlan.comunicacion.objetivo && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <h4 className="font-semibold text-green-900">Generar Estrategias con IA</h4>
                        <p className="text-sm text-green-700">Basado en tu objetivo, el sistema propondrá 3 estrategias específicas</p>
                      </div>
                      <Button 
                        onClick={() => generateStrategies('comunicacion')}
                        disabled={isGeneratingStrategies && generatingStrategiesType === 'comunicacion'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isGeneratingStrategies && generatingStrategiesType === 'comunicacion' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar Estrategias
                          </>
                        )}
                      </Button>
                    </div>

                    {marketingPlan.comunicacion.estrategiasPropuestas.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-green-800">Estrategias Propuestas</Label>
                        <div className="space-y-3">
                          {marketingPlan.comunicacion.estrategiasPropuestas.map((estrategia) => (
                            <Card key={estrategia.id} className={`cursor-pointer transition-all ${
                              marketingPlan.comunicacion.estrategiaSeleccionada === estrategia.id 
                                ? 'ring-2 ring-green-500 bg-green-50' 
                                : 'hover:bg-gray-50'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="estrategia-comunicacion"
                                    checked={marketingPlan.comunicacion.estrategiaSeleccionada === estrategia.id}
                                    onChange={() => updateEstrategiaSeleccionada('comunicacion', estrategia.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-green-900 mb-2">{estrategia.nombre}</h5>
                                    <p className="text-sm text-gray-700 mb-3">{estrategia.descripcion}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {marketingPlan.comunicacion.estrategiaSeleccionada && (
                          <div className="space-y-2">
                            <Label htmlFor="descripcion-estrategia-comunicacion">Describe tu implementación</Label>
                            <Textarea
                              id="descripcion-estrategia-comunicacion"
                              value={marketingPlan.comunicacion.descripcionEstrategia}
                              onChange={(e) => updateDescripcionEstrategia('comunicacion', e.target.value)}
                              placeholder="Describe cómo implementarás esta estrategia de comunicación en tu contexto específico..."
                              rows={4}
                            />
                            <p className="text-xs text-slate-500">
                              💡 Personaliza la estrategia seleccionada con los detalles específicos de tu negocio.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="objetivo-smart">Objetivo de Comunicación SMART</Label>
                    <ImproveButton field="objetivoSMART" currentValue={marketingPlan.comunicacion.objetivoSMART} type="comunicacion" />
                  </div>
                  <Textarea
                    id="objetivo-smart"
                    value={marketingPlan.comunicacion.objetivoSMART}
                    onChange={(e) => updateComunicacion('objetivoSMART', e.target.value)}
                    placeholder="Específico, Medible, Alcanzable, Relevante, Tiempo-bound"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">
                    💡 Tip: Usa el botón "Mejorar con IA" para optimizar tu objetivo siguiendo la metodología SMART
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mensaje-central">Mensaje Central / Lema (Key Message)</Label>
                    <ImproveButton field="mensajeCentral" currentValue={marketingPlan.comunicacion.mensajeCentral} type="comunicacion" />
                  </div>
                  <Input
                    id="mensaje-central"
                    value={marketingPlan.comunicacion.mensajeCentral}
                    onChange={(e) => updateComunicacion('mensajeCentral', e.target.value)}
                    placeholder="Tu mensaje principal de marketing"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Canales de Promoción</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Redes Sociales',
                      'Email Marketing',
                      'Publicidad Pagada (PPC)',
                      'Relaciones Públicas (PR)'
                    ].map((canal) => (
                      <div key={canal} className="flex items-center space-x-2">
                        <Checkbox
                          id={canal}
                          checked={marketingPlan.comunicacion.canales.includes(canal)}
                          onCheckedChange={() => toggleCanalComunicacion(canal)}
                        />
                        <Label htmlFor={canal} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {canal}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {marketingPlan.comunicacion.canales.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {marketingPlan.comunicacion.canales.map((canal) => (
                        <Badge key={canal} variant="secondary">
                          {canal}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presupuesto">Presupuesto Asignado ($)</Label>
                  <Input
                    id="presupuesto"
                    type="number"
                    value={marketingPlan.comunicacion.presupuesto}
                    onChange={(e) => updateComunicacion('presupuesto', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumen" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resumen del Plan
                </CardTitle>
                <CardDescription>Vista consolidada de tu plan de marketing completo</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Plan de Producto
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Objetivo:</span> {marketingPlan.producto.objetivo || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Estrategia:</span> {marketingPlan.producto.estrategia || 'No especificado'}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Nombre:</span> {marketingPlan.producto.nombre || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">PVU:</span> {marketingPlan.producto.propuestaValor || 'No especificado'}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Descripción:</span> {marketingPlan.producto.descripcion || 'No especificado'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Características:</span>
                        <ul className="ml-4 mt-1">
                          {marketingPlan.producto.caracteristicas.filter(c => c.trim()).length > 0 
                            ? marketingPlan.producto.caracteristicas.filter(c => c.trim()).map((car, i) => (
                                <li key={i}>• {car}</li>
                              ))
                            : <li>• No especificado</li>
                          }
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Plan de Precio
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Objetivo:</span> {marketingPlan.precio.objetivo || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Estrategia:</span> {marketingPlan.precio.estrategia || 'No especificado'}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Costo Unitario:</span> ${marketingPlan.precio.costoUnitario.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Margen:</span> {marketingPlan.precio.margenBeneficio}%
                        </div>
                        <div>
                          <span className="font-medium">Precio Sugerido:</span> ${calcularPrecioSugerido().toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Competencia:</span>
                        <ul className="ml-4 mt-1">
                          {marketingPlan.precio.competencia.length > 0 
                            ? marketingPlan.precio.competencia.map((comp) => (
                                <li key={comp.id}>• {comp.name}: ${comp.price.toFixed(2)}</li>
                              ))
                            : <li>• No especificado</li>
                          }
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Plan de Distribución
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Objetivo:</span> {marketingPlan.distribucion.objetivo || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Estrategia:</span> {marketingPlan.distribucion.estrategia || 'No especificado'}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Canales:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {marketingPlan.distribucion.canales.length > 0 
                            ? marketingPlan.distribucion.canales.map((canal) => (
                                <Badge key={canal} variant="outline">{canal}</Badge>
                              ))
                            : <span>No especificado</span>
                          }
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Estrategia Logística:</span> {marketingPlan.distribucion.estrategiaLogistica || 'No especificado'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Inventario Mínimo:</span> {marketingPlan.distribucion.inventarioMinimo} unidades
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Megaphone className="w-5 h-5" />
                        Plan de Comunicación
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Objetivo:</span> {marketingPlan.comunicacion.objetivo || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Estrategia:</span> {marketingPlan.comunicacion.estrategia || 'No especificado'}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Objetivo SMART:</span> {marketingPlan.comunicacion.objetivoSMART || 'No especificado'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Mensaje Central:</span> {marketingPlan.comunicacion.mensajeCentral || 'No especificado'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Canales:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {marketingPlan.comunicacion.canales.length > 0 
                            ? marketingPlan.comunicacion.canales.map((canal) => (
                                <Badge key={canal} variant="outline">{canal}</Badge>
                              ))
                            : <span>No especificado</span>
                          }
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Presupuesto:</span> ${marketingPlan.comunicacion.presupuesto.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="mt-6 pt-6 border-t">
                  <Button onClick={exportToMarkdown} className="w-full" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar a Markdown
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App