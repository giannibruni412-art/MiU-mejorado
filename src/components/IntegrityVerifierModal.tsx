import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Download,
  ExternalLink,
  ClipboardPaste,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Assignment } from '../types/academic';
import { HashLookupResult, lookupReceiptHash } from '../utils/academicLogic';

interface IntegrityVerifierModalProps {
  assignments: Assignment[];
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const IntegrityVerifierModal: React.FC<IntegrityVerifierModalProps> = ({
  assignments,
  isOpen,
  onClose,
  isDarkMode = false,
}) => {
  const [inputHash, setInputHash] = useState('');
  const [lookupResult, setLookupResult] = useState<HashLookupResult | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real hashes extracted from currently active student submissions for 1-click test
  const sampleHashes = [
    {
      label: 'Sprint Review 2 (v3)',
      hash: 'UFM-SHA256-8F4A92C1-3B19D04E',
    },
    {
      label: 'Coloquio Socrático (v2)',
      hash: 'UFM-SHA256-3A88E10C-55D29F41',
    },
    {
      label: 'Consenso Raft (v2)',
      hash: 'UFM-SHA256-4E91C77A-902F11B8',
    },
    {
      label: 'Cálculo Económico (v1)',
      hash: 'UFM-SHA256-7D20B81F-C4519A02',
    },
  ];

  const handleVerify = (hashToTest?: string) => {
    const target = hashToTest !== undefined ? hashToTest : inputHash;
    const result = lookupReceiptHash(target, assignments);
    setLookupResult(result);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = text.trim();
        setInputHash(cleaned);
        handleVerify(cleaned);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyCertificate = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedStatus('copiado');
      setTimeout(() => setCopiedStatus(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadCertificate = (result: HashLookupResult) => {
    if (!result.assignment || !result.version) return;

    const certContent = `================================================================================
UNIVERSIDAD FRANCISCO MARROQUÍN (UFM)
SISTEMA DE VERIFICACIÓN DE INTEGRIDAD Y CERTEZA ACADÉMICA
CONSTANCIA PÚBLICA DE AUDITORÍA CRIPTOGRÁFICA INMUTABLE
================================================================================
SELLO CONSULTADO: ${result.queryHash}
ESTADO:           RECEPCIÓN OFICIAL VERIFICADA E INMUTABLE
FECHA AUDITORÍA:  ${result.verificationTimestamp}
ESTÁNDAR:         FIPS 180-4 (SHA-256)

DATOS DE LA ENTREGA INSTITUCIONAL:
--------------------------------------------------------------------------------
CÁTEDRA:          ${result.assignment.courseName} (${result.assignment.sectionCode})
ASIGNACIÓN:       ${result.assignment.title}
VERSIÓN:          v${result.version.versionNumber} ${result.version.isLatest ? '[VERSIÓN VIGENTE]' : '[VERSIÓN HISTÓRICA]'}
FECHA DE ENVÍO:   ${result.version.submittedAt}
ARCHIVO:          ${result.version.fileName} (${result.version.fileSizeLabel || '2.0 MB PDF'})
ESTADO DE NOTA:   ${result.version.score !== undefined ? `${result.version.score}/${result.version.maxScore} pts` : 'En revisión por cátedra'}
${result.version.repositoryUrl ? `REPOSITORIO:      ${result.version.repositoryUrl}\n` : ''}
DEFENSA SOCRÁTICA REGISTRADA:
"${result.version.socraticDefense || 'Defensa socrática verificada en claustro.'}"

DICTAMEN DE AUDITORÍA:
${result.auditTrail}

"La enseñanza y difusión de los principios éticos, jurídicos y económicos
de una sociedad de personas libres y responsables." — Misión UFM
================================================================================`;

    try {
      const blob = new Blob([certContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Constancia_Verificacion_UFM_${result.queryHash}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verifier-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 backdrop-blur-[2px] p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`rounded-lg border shadow-2xl max-w-2xl w-full my-8 overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
            : 'bg-white border-[#E5E7EB] text-[#111827]'
        }`}
      >
        {/* Header Institucional UFM */}
        <div className="bg-[#7A1C29] text-white px-6 py-4 flex items-center justify-between border-b border-[#C59B27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#5E101D] border border-[#C59B27] flex items-center justify-center text-[#F7F2E6] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C59B27]" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#F7F2E6] font-semibold">
                  Transparencia & Certeza Académica UFM
                </span>
                <span className="bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">
                  SHA-256
                </span>
              </div>
              <h2 id="verifier-modal-title" className="text-lg font-serif font-bold text-white leading-tight">
                Verificador de Integridad de Entregas
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar verificador de integridad"
            className="p-1.5 rounded hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario de Entrada Manual del Hash */}
        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="manual-hash-input"
              className="block text-xs font-semibold text-[#111827] dark:text-white mb-1.5"
            >
              Ingresa el Sello Criptográfico SHA-256 de tu Entrega
            </label>
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-2.5">
              Introduce manualmente el identificador emitido al momento de subir tu asignación para certificar su validez en el registro inmutable del claustro.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="manual-hash-input"
                  type="text"
                  value={inputHash}
                  onChange={(e) => setInputHash(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  placeholder="UFM-SHA256-XXXXXXXX-XXXXXXXX"
                  className="w-full h-11 px-3.5 pr-10 rounded border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-mono text-[#111827] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
                />
                {inputHash && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputHash('');
                      setLookupResult(null);
                    }}
                    aria-label="Borrar texto del hash"
                    className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="h-11 px-3 rounded border border-[#E5E7EB] dark:border-[#334155] hover:bg-[#F9FAFB] dark:hover:bg-[#0F172A] text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-[#7A1C29] dark:text-[#FDA4AF]" />
                  <span>Pegar</span>
                </button>

                <button
                  id="btn-run-hash-verification"
                  type="button"
                  onClick={() => handleVerify()}
                  className="h-11 px-5 rounded bg-[#9B1B30] hover:bg-[#7A1C29] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Validar Hash</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Hash Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C59B27]" />
                <span>Ejemplos de entregas registradas:</span>
              </span>
              {sampleHashes.map((sample) => (
                <button
                  key={sample.hash}
                  type="button"
                  onClick={() => {
                    setInputHash(sample.hash);
                    handleVerify(sample.hash);
                  }}
                  className="px-2.5 py-1 rounded bg-[#F9FAFB] dark:bg-[#0F172A] hover:bg-[#FDF2F4] text-[11px] font-mono text-[#7A1C29] dark:text-[#FDA4AF] border border-[#E5E7EB] dark:border-[#334155] cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel de Resultados de Validación */}
          {lookupResult && (
            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#334155] space-y-4">
              {/* CASO 1: HASH ENCONTRADO Y OFICIALMENTE CONFIRMADO */}
              {lookupResult.isFound && lookupResult.assignment && lookupResult.version && (
                <div className="p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#A7F3D0]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-[#065F46] uppercase tracking-wider">
                          Recepción Oficial Verificada e Inmutable
                        </h3>
                        <p className="text-[11px] text-[#047857]">
                          Algoritmo: {lookupResult.version.hashAlgorithm} · Registro Claustro UFM
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-white text-[#065F46] border border-[#A7F3D0] self-start sm:self-center">
                      v{lookupResult.version.versionNumber}{' '}
                      {lookupResult.version.isLatest ? '(Vigente)' : '(Histórica)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#065F46]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#047857] block">
                        Cátedra:
                      </span>
                      <p className="font-semibold">
                        {lookupResult.assignment.courseName} ({lookupResult.assignment.sectionCode})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#047857] block">
                        Asignación:
                      </span>
                      <p className="font-semibold">{lookupResult.assignment.title}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#047857] block">
                        Archivo de Entrega:
                      </span>
                      <p className="font-mono text-[11px]">
                        {lookupResult.version.fileName} (
                        {lookupResult.version.fileSizeLabel || '2.0 MB PDF'})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#047857] block">
                        Fecha y Hora de Recepción:
                      </span>
                      <p className="font-medium">{lookupResult.version.submittedAt}</p>
                    </div>
                  </div>

                  {lookupResult.version.socraticDefense && (
                    <div className="p-2.5 bg-white/80 rounded border border-[#A7F3D0] text-xs">
                      <span className="text-[10px] font-bold uppercase text-[#047857] block mb-0.5">
                        Defensa Socrática Registrada:
                      </span>
                      <p className="font-serif italic text-[#065F46]">
                        &ldquo;{lookupResult.version.socraticDefense}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="p-2.5 bg-white/90 rounded border border-[#A7F3D0] font-mono text-[11px] text-[#065F46] break-all">
                    {lookupResult.queryHash}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCertificate(lookupResult.auditTrail)}
                        className="px-3 py-1.5 rounded bg-white hover:bg-[#F9FAFB] border border-[#A7F3D0] text-xs font-semibold text-[#065F46] flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedStatus ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#059669]" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Dictamen</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadCertificate(lookupResult)}
                        className="px-3.5 py-1.5 rounded bg-[#065F46] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Constancia (.txt)</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-medium text-[#047857]">
                      Firma inalterable con certeza académica
                    </span>
                  </div>
                </div>
              )}

              {/* CASO 2: FORMATO VÁLIDO PERO NO REGISTRADO EN EL EXPEDIENTE */}
              {!lookupResult.isFound && lookupResult.isFormatValid && (
                <div className="p-4 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B8860B] shrink-0" />
                    <span className="font-bold">Formato Válido · Sello No Encontrado en este Ciclo</span>
                  </div>
                  <p className="leading-relaxed">
                    El identificador <code className="font-mono font-bold">{lookupResult.queryHash}</code> cumple con la especificación de longitud y digest SHA-256 de la Universidad Francisco Marroquín, pero no se encuentra registrado en el expediente del ciclo actual de este estudiante.
                  </p>
                  <p className="text-[11px] text-[#B45309]">
                    Verifica que no existan caracteres erróneos o que el hash pertenezca a otra cátedra o período académico anterior.
                  </p>
                </div>
              )}

              {/* CASO 3: FORMATO INVÁLIDO */}
              {!lookupResult.isFormatValid && (
                <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span className="font-bold">Estructura de Hash No Reconocida</span>
                  </div>
                  <p>{lookupResult.auditTrail}</p>
                  <p className="text-[11px] text-[#B91C1C]">
                    Ejemplo de formato válido: <code className="font-mono font-bold">UFM-SHA256-8F4A92C1-3B19D04E</code>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Institucional */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
          }`}
        >
          <span className="text-[#6B7280] dark:text-[#94A3B8] font-medium hidden sm:inline font-serif italic">
            &ldquo;Personas libres y responsables ante sus compromisos académicos.&rdquo;
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-[#7A1C29] hover:bg-[#5E101D] text-white font-semibold cursor-pointer ml-auto"
          >
            Cerrar Verificador
          </button>
        </div>
      </div>
    </div>
  );
};
