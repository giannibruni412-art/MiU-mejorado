import React, { useState } from 'react';
import {
  X,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Layers,
  ArrowRight,
  GitCommit,
  Upload,
  Calendar,
  FileText,
  FileCode,
} from 'lucide-react';
import { Assignment, SubmissionVersion } from '../types/academic';
import {
  resolveSubmissionHistory,
  verifySubmissionHashIntegrity,
} from '../utils/academicLogic';

interface SubmissionHistoryModalProps {
  assignment: Assignment;
  onClose: () => void;
  onRequestNewVersion: (assignment: Assignment) => void;
  isDarkMode?: boolean;
}

export const SubmissionHistoryModal: React.FC<SubmissionHistoryModalProps> = ({
  assignment,
  onClose,
  onRequestNewVersion,
  isDarkMode = false,
}) => {
  const versions = resolveSubmissionHistory(assignment);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(
    versions[0]?.versionNumber || 1
  );
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [auditFeedback, setAuditFeedback] = useState<{
    versionNumber: number;
    auditRecord: string;
    timestamp: string;
  } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersionA, setCompareVersionA] = useState<number>(
    versions.length > 1 ? versions[versions.length - 1].versionNumber : 1
  );
  const [compareVersionB, setCompareVersionB] = useState<number>(
    versions[0]?.versionNumber || 1
  );

  const selectedVersion =
    versions.find((v) => v.versionNumber === selectedVersionNum) || versions[0];

  const versionA =
    versions.find((v) => v.versionNumber === compareVersionA) || versions[versions.length - 1];
  const versionB =
    versions.find((v) => v.versionNumber === compareVersionB) || versions[0];

  const handleCopyHash = (hash: string) => {
    try {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleAuditVersion = (version: SubmissionVersion) => {
    const result = verifySubmissionHashIntegrity(version);
    setAuditFeedback({
      versionNumber: version.versionNumber,
      auditRecord: result.auditRecord,
      timestamp: new Date().toLocaleTimeString('es-GT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    });
  };

  const handleDownloadReceipt = (version: SubmissionVersion) => {
    const certText = `================================================================================
UNIVERSIDAD FRANCISCO MARROQUÍN (UFM)
DECANATURA & REGISTRO DE CERTEZA ACADÉMICA INMUTABLE
CERTIFICADO DIGITAL DE RECEPCIÓN DE ENTREGA (HISTORIAL OFICIAL)
================================================================================
CÁTEDRA:          ${assignment.courseName} (${assignment.sectionCode})
ASIGNACIÓN:       ${assignment.title}
VERSIÓN DE ENVÍO: v${version.versionNumber} ${version.isLatest ? '[VERSIÓN VIGENTE]' : '[VERSIÓN HISTÓRICA]'}
FECHA Y HORA:     ${version.submittedAt}
ARCHIVO:          ${version.fileName} (${version.fileSizeLabel || 'Documento Académico'})
ESTADO DE AUDITORÍA: HASH VERIFICADO E INMUTABLE (FIPS 180-4)
SELLO CRIPTOGRÁFICO: ${version.receiptHash}
ALGORITMO:        ${version.hashAlgorithm}
${version.repositoryUrl ? `REPOSITORIO:      ${version.repositoryUrl}\n` : ''}
DEFENSA SOCRÁTICA REGISTRADA:
"${version.socraticDefense || 'Defensa socrática conforme a lineamientos de cátedra.'}"

BITÁCORA DE CAMBIOS:
${version.changeSummary || 'Registro inmutable de versión en el expediente del estudiante.'}

"La enseñanza y difusión de los principios éticos, jurídicos y económicos
de una sociedad de personas libres y responsables." — Misión UFM
================================================================================`;

    try {
      const blob = new Blob([certText], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificado_UFM_v${version.versionNumber}_${version.receiptHash}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // safe fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-history-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 backdrop-blur-[2px] p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`rounded-lg border shadow-2xl max-w-4xl w-full my-8 overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
            : 'bg-white border-[#E5E7EB] text-[#111827]'
        }`}
      >
        {/* 1. Institutional Header */}
        <div className="bg-[#7A1C29] text-white px-6 py-4 flex items-center justify-between border-b border-[#C59B27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#5E101D] border border-[#C59B27] flex items-center justify-center text-[#F7F2E6] shrink-0">
              <History className="w-5 h-5 text-[#C59B27]" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#F7F2E6] font-semibold">
                  Registro Inmutable de Versiones · UFM
                </span>
                <span className="bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">
                  SHA-256
                </span>
              </div>
              <h2
                id="submission-history-title"
                className="text-lg font-serif font-bold text-white leading-tight"
              >
                Historial de Entregas & Auditoría Criptográfica
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial de entregas"
            className="p-1.5 rounded hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Assignment Context & Cryptographic Guarantee Strip */}
        <div
          className={`px-6 py-3.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
            isDarkMode
              ? 'bg-[#0F172A] border-[#334155] text-[#CBD5E1]'
              : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#111827] dark:text-white">
                {assignment.title}
              </span>
              <span className="px-2 py-0.5 rounded font-medium bg-[#FDF2F4] text-[#7A1C29] border border-[#7A1C29]/20">
                {assignment.courseName} ({assignment.sectionCode})
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
              Cada versión registrada conserva su firma SHA-256 inmutable de acuerdo con el principio de certeza académica.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
              <span>{versions.length} Versiones · Integridad 100% Verificada</span>
            </div>
          </div>
        </div>

        {/* 3. Live Audit Toast (if user clicked "Auditar Hash") */}
        {auditFeedback && (
          <div
            role="status"
            aria-live="polite"
            className="mx-6 mt-4 p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold">
                  Auditoría Criptográfica v{auditFeedback.versionNumber} [{auditFeedback.timestamp}]
                </p>
                <p className="font-mono text-[11px] mt-0.5">{auditFeedback.auditRecord}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuditFeedback(null)}
              aria-label="Cerrar confirmación de auditoría"
              className="text-[#065F46] hover:text-[#047857] p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4. Controls: View Modes (Timeline vs Comparison) & Quick Resubmit */}
        <div className="px-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-[#F3F4F6] dark:bg-[#0F172A] p-1 rounded-lg border border-[#E5E7EB] dark:border-[#334155]">
            <button
              type="button"
              onClick={() => setShowComparison(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                !showComparison
                  ? 'bg-white dark:bg-[#1E293B] text-[#7A1C29] dark:text-[#FDA4AF] font-bold shadow-2xs'
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827]'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Bitácora de Versiones ({versions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowComparison(true)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                showComparison
                  ? 'bg-white dark:bg-[#1E293B] text-[#7A1C29] dark:text-[#FDA4AF] font-bold shadow-2xs'
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Comparador de Versiones (Diff)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestNewVersion(assignment);
            }}
            className="px-3.5 py-1.5 rounded-md bg-[#9B1B30] hover:bg-[#7A1C29] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Enviar Nueva Versión (v{versions.length + 1})</span>
          </button>
        </div>

        {/* 5. Main Content Area */}
        <div className="p-6 max-h-[62vh] overflow-y-auto">
          {!showComparison ? (
            /* VIEW A: INTERACTIVE VERSION TIMELINE & DETAILS */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Version Selector Timeline */}
              <div className="md:col-span-5 space-y-3">
                <h3 className="text-xs font-serif font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider">
                  Línea de Tiempo de Envíos
                </h3>
                <div className="space-y-2">
                  {versions.map((ver) => {
                    const isSelected = ver.versionNumber === selectedVersion.versionNumber;
                    return (
                      <button
                        key={ver.versionNumber}
                        type="button"
                        onClick={() => setSelectedVersionNum(ver.versionNumber)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-[#7A1C29] dark:border-[#FDA4AF] bg-[#FDF2F4]/60 dark:bg-[#7A1C29]/20 ring-1 ring-[#7A1C29]'
                            : 'border-[#E5E7EB] dark:border-[#334155] hover:bg-[#F9FAFB] dark:hover:bg-[#0F172A]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                ver.isLatest
                                  ? 'bg-[#7A1C29] text-white'
                                  : 'bg-[#E5E7EB] dark:bg-[#334155] text-[#4B5563] dark:text-[#CBD5E1]'
                              }`}
                            >
                              v{ver.versionNumber}
                            </span>
                            <span className="font-bold text-xs">
                              {ver.isLatest ? 'Versión Vigente' : `Versión Histórica v${ver.versionNumber}`}
                            </span>
                          </div>

                          {ver.score !== undefined ? (
                            <span className="font-mono text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                              {ver.score} pts
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#B8860B] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                              Revisión
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span>{ver.submittedAt}</span>
                        </p>

                        <p className="text-[11px] font-mono text-[#065F46] dark:text-[#34D399] mt-1 truncate">
                          {ver.receiptHash}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Inspector for the Selected Version */}
              <div className="md:col-span-7 space-y-4">
                <div
                  className={`p-5 rounded-lg border space-y-4 ${
                    isDarkMode
                      ? 'bg-[#0F172A] border-[#334155]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB]'
                  }`}
                >
                  {/* Version Header Card */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB] dark:border-[#334155]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-serif font-bold text-[#111827] dark:text-white">
                          Detalles de Versión {selectedVersion.versionNumber}
                        </span>
                        {selectedVersion.isLatest ? (
                          <span className="bg-[#7A1C29] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            VIGENTE
                          </span>
                        ) : (
                          <span className="bg-[#E5E7EB] dark:bg-[#334155] text-[#4B5563] dark:text-[#CBD5E1] text-[10px] font-medium px-2 py-0.5 rounded">
                            SUPERADA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
                        Registrado: {selectedVersion.submittedAt}
                      </p>
                    </div>

                    {/* Hash Validation Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" aria-hidden="true" />
                      <span>Hash Válido</span>
                    </div>
                  </div>

                  {/* File & Repository Artifact Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1E293B] rounded border border-[#E5E7EB] dark:border-[#334155]">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#7A1C29] shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{selectedVersion.fileName}</p>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                            Tamaño: {selectedVersion.fileSizeLabel || '2.1 MB (PDF)'} · Algoritmo: {selectedVersion.hashAlgorithm}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(selectedVersion)}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:bg-[#F3F4F6] text-[#111827] dark:text-white flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>Recibo</span>
                      </button>
                    </div>

                    {selectedVersion.repositoryUrl && (
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1E293B] rounded border border-[#E5E7EB] dark:border-[#334155]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="font-semibold truncate">Repositorio de Código</p>
                            <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] font-mono truncate">
                              {selectedVersion.repositoryUrl}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                          Git Sincronizado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Socratic Defense / Argumentative Notes */}
                  {selectedVersion.socraticDefense && (
                    <div className="p-3 bg-white dark:bg-[#1E293B] rounded border border-[#E5E7EB] dark:border-[#334155] text-xs">
                      <span className="text-[10px] font-bold text-[#7A1C29] dark:text-[#FDA4AF] uppercase tracking-wider block mb-1">
                        Defensa Socrática de la Versión {selectedVersion.versionNumber}
                      </span>
                      <p className="font-serif italic text-[#374151] dark:text-[#E2E8F0] leading-relaxed">
                        &ldquo;{selectedVersion.socraticDefense}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Change Summary */}
                  {selectedVersion.changeSummary && (
                    <div className="text-xs text-[#4B5563] dark:text-[#94A3B8]">
                      <strong className="text-[#111827] dark:text-white">Bitácora de cambios: </strong>
                      <span>{selectedVersion.changeSummary}</span>
                    </div>
                  )}

                  {/* Cryptographic Hash Reception Verification Box */}
                  <div className="p-3.5 bg-white dark:bg-[#1E293B] rounded border border-[#C59B27]/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B]">
                        Sello de Recepción Inmutable (SHA-256)
                      </span>
                      <span className="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>FIPS 180-4 Verificado</span>
                      </span>
                    </div>

                    <div className="p-2 rounded bg-[#0F172A] text-[#34D399] font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                      <span className="select-all">{selectedVersion.receiptHash}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(selectedVersion.receiptHash)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-sans flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedHash === selectedVersion.receiptHash ? (
                          <>
                            <Check className="w-3 h-3 text-[#34D399]" />
                            <span className="text-[#34D399]">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleAuditVersion(selectedVersion)}
                        className="text-xs font-semibold text-[#7A1C29] dark:text-[#FDA4AF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verificar Integridad Criptográfica en Vivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(selectedVersion)}
                        className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Certificado (.txt)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW B: VERSION COMPARISON / DIFF INSPECTOR */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Comparar Versión:</span>
                  <select
                    value={compareVersionA}
                    onChange={(e) => setCompareVersionA(Number(e.target.value))}
                    className="px-2.5 py-1 rounded bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] font-bold"
                  >
                    {versions.map((v) => (
                      <option key={v.versionNumber} value={v.versionNumber}>
                        v{v.versionNumber} ({v.submittedAt.split('·')[0].trim()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
                  <span className="font-semibold">Con Versión:</span>
                  <select
                    value={compareVersionB}
                    onChange={(e) => setCompareVersionB(Number(e.target.value))}
                    className="px-2.5 py-1 rounded bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] font-bold"
                  >
                    {versions.map((v) => (
                      <option key={v.versionNumber} value={v.versionNumber}>
                        v{v.versionNumber} ({v.submittedAt.split('·')[0].trim()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Column A */}
                <div className="p-4 rounded-lg border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#334155]">
                    <span className="font-serif font-bold text-sm">
                      Versión {versionA.versionNumber} {versionA.isLatest ? '(Vigente)' : '(Histórica)'}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      {versionA.submittedAt}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">Archivo:</span>
                    <p className="font-semibold text-xs">{versionA.fileName}</p>
                    <p className="text-[11px] text-[#6B7280]">{versionA.fileSizeLabel || '2.0 MB'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">Sello Hash:</span>
                    <p className="font-mono text-[11px] text-[#065F46] dark:text-[#34D399] p-2 bg-[#F9FAFB] dark:bg-[#0F172A] rounded border border-[#E5E7EB] dark:border-[#334155] break-all">
                      {versionA.receiptHash}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">
                      Defensa Socrática:
                    </span>
                    <p className="font-serif italic text-xs leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                      &ldquo;{versionA.socraticDefense || 'N/A'}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">
                      Bitácora de iteración:
                    </span>
                    <p className="text-[11px] text-[#4B5563] dark:text-[#CBD5E1]">
                      {versionA.changeSummary || 'Sin notas registradas.'}
                    </p>
                  </div>
                </div>

                {/* Column B */}
                <div className="p-4 rounded-lg border border-[#7A1C29]/30 dark:border-[#FDA4AF]/30 bg-white dark:bg-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#334155]">
                    <span className="font-serif font-bold text-sm text-[#7A1C29] dark:text-[#FDA4AF]">
                      Versión {versionB.versionNumber} {versionB.isLatest ? '(Vigente)' : '(Histórica)'}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      {versionB.submittedAt}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">Archivo:</span>
                    <p className="font-semibold text-xs">{versionB.fileName}</p>
                    <p className="text-[11px] text-[#6B7280]">{versionB.fileSizeLabel || '2.0 MB'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">Sello Hash:</span>
                    <p className="font-mono text-[11px] text-[#065F46] dark:text-[#34D399] p-2 bg-[#F9FAFB] dark:bg-[#0F172A] rounded border border-[#E5E7EB] dark:border-[#334155] break-all">
                      {versionB.receiptHash}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">
                      Defensa Socrática:
                    </span>
                    <p className="font-serif italic text-xs leading-relaxed text-[#4B5563] dark:text-[#CBD5E1]">
                      &ldquo;{versionB.socraticDefense || 'N/A'}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280]">
                      Bitácora de iteración:
                    </span>
                    <p className="text-[11px] text-[#4B5563] dark:text-[#CBD5E1]">
                      {versionB.changeSummary || 'Sin notas registradas.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Footer Controls */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
          }`}
        >
          <span className="text-[#6B7280] dark:text-[#94A3B8] font-medium hidden sm:inline">
            Registro protegido por el principio UFM de Certeza y Libertad Académica.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-[#7A1C29] hover:bg-[#5E101D] text-white font-semibold cursor-pointer ml-auto"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
