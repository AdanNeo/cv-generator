import { jsPDF } from 'jspdf'

/** PDF una columna, Helvetica — lectura lineal apta para ATS. */
export function buildAndSavePdf(f, r) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const margin = 18
  const pageW = doc.internal.pageSize.getWidth()
  const maxW = pageW - margin * 2

  const lineH = 5.1
  const gapSection = 5.5

  let y = margin

  function pageBottom() {
    return doc.internal.pageSize.getHeight() - margin
  }

  function needSpace(mm) {
    if (y + mm > pageBottom()) {
      doc.addPage()
      y = margin
    }
  }

  function writeParagraph(text, size = 10.5, style = 'normal') {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    const lh = size >= 14 ? 6.6 : lineH
    const lines = doc.splitTextToSize(String(text ?? ''), maxW)
    for (const line of lines) {
      needSpace(lh)
      doc.text(line, margin, y)
      y += lh
    }
  }

  function writeSectionTitle(title) {
    y += 3
    needSpace(lineH + 2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(String(title), margin, y)
    y += lineH + 1.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
  }

  const name = (f.nombre || 'Candidato').trim()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  writeParagraph(name, 16, 'bold')

  if (f.puesto_objetivo?.trim()) {
    writeParagraph(f.puesto_objetivo.trim(), 11, 'normal')
  }

  const metaBits = []
  if (f.experiencia?.trim()) metaBits.push(`Experiencia: ${f.experiencia.trim()}`)
  if (f.educacion?.trim()) metaBits.push(`Formación: ${f.educacion.trim()}`)
  if (f.idiomas?.trim()) metaBits.push(`Idiomas: ${f.idiomas.trim()}`)
  if (metaBits.length) {
    doc.setTextColor(55, 55, 55)
    writeParagraph(metaBits.join('  |  '), 9.5, 'normal')
    doc.setTextColor(0, 0, 0)
  }

  y += gapSection * 0.5

  writeSectionTitle('HEADLINE')
  writeParagraph(r.frase_impacto, 10.5, 'normal')
  y += gapSection * 0.35

  writeSectionTitle('RESUMEN PROFESIONAL')
  writeParagraph(r.perfil_profesional, 10.5, 'normal')
  y += gapSection * 0.35

  writeSectionTitle('COMPETENCIAS TÉCNICAS')
  const skillsText = Array.isArray(r.skills_optimizados)
    ? r.skills_optimizados.join(', ')
    : String(r.skills_optimizados ?? '')
  writeParagraph(skillsText, 10.5, 'normal')
  y += gapSection * 0.35

  writeSectionTitle('PROYECTOS RELEVANTES')
  const proyectos = Array.isArray(r.proyectos_optimizados) ? r.proyectos_optimizados : []
  proyectos.forEach((p, i) => {
    writeParagraph(`${i + 1}. ${p}`, 10.5, 'normal')
  })
  y += gapSection * 0.35

  if (Array.isArray(r.skills_sugeridos) && r.skills_sugeridos.length) {
    writeSectionTitle('SKILLS COMPLEMENTARIOS (SUGERIDOS)')
    writeParagraph(r.skills_sugeridos.join(', '), 10.5, 'normal')
  }

  y += 4
  needSpace(lineH)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'italic')
  writeParagraph('CV texto plano, una columna (Helvetica). Adecuado para sistemas ATS.', 8, 'italic')
  doc.setTextColor(0, 0, 0)

  const safe = (f.nombre || 'CV').replace(/[^\w\u00C0-\u024f-]+/g, '_').slice(0, 80)
  doc.save(`CV_${safe}.pdf`)
}
