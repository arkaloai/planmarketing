---
Task ID: 1
Agent: Main Agent
Task: Add document upload feature to analysis section for automatic analysis and objective generation

Work Log:
- Read and understood the full page.tsx structure (2100+ lines)
- Installed mammoth (Word parsing) and pdf-parse (PDF parsing) packages
- Created API endpoint /api/analyze-document that:
  - Accepts file uploads (PDF, DOCX, TXT, MD)
  - Extracts text from documents using mammoth and pdf-parse
  - Sends extracted text to AI for structured analysis
  - Returns analysis situacional + objetivos tentativos
- Added state variables: isAnalyzingDocument, uploadedDocument, dragActive
- Added functions: analyzeDocument, handleFileUpload, handleDrag, handleDrop
- Added document upload UI card in analysis tab with:
  - Drag & drop support
  - File type validation (PDF, Word, TXT)
  - Size limit (10MB)
  - Loading animation with progress indicators
  - Success message with document details
  - Error display
- Auto-fills all analysis fields AND generates objectives from document content
- Lint passes with no errors

Stage Summary:
- Users can now upload analysis/diagnosis documents in the Análisis tab
- The system automatically extracts text, analyzes it with AI, and fills in:
  - Diagnóstico Situacional
  - Contexto del Mercado
  - Problemas Detectados
  - Oportunidades Identificadas
  - Objetivos Tentativos (3 per each P: Producto, Precio, Distribución, Comunicación)
- All fields remain editable after auto-fill
