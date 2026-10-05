'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  X,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface NewsletterImageSlotProps {
  label: string
  slot: 'cover' | 'banner' | 'product' | 'general'
  value: string
  altValue: string
  onChange: (url: string, alt: string) => void
  helperText?: string
  altPlaceholder?: string
  requiredAlt?: boolean
  aspectRatio?: 'banner' | 'square' | 'wide'
  samplePlaceholder?: string
}

export function NewsletterImageSlot({
  label,
  slot,
  value,
  altValue,
  onChange,
  helperText = 'Formatos aceites: JPG, PNG e WebP (máx. 2 MB). Otimizado automaticamente.',
  altPlaceholder = 'Descrição da imagem para acessibilidade...',
  requiredAlt = false,
  aspectRatio = 'wide',
}: NewsletterImageSlotProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAdminToken = () => {
    if (typeof window === 'undefined') return null
    const cookies = document.cookie.split(';')
    for (const c of cookies) {
      const [k, v] = c.trim().split('=')
      if (k === 'arknet_admin_token') return v
    }
    return localStorage.getItem('arknet_admin_token') || null
  }

  const handleUpload = (file: File) => {
    setErrorMessage(null)

    // 1. Validação prévia de tamanho no cliente
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Ficheiro muito grande. O tamanho máximo permitido é de 2 MB.')
      return
    }

    // 2. Validação prévia de formato no cliente
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!validExtensions.includes(ext) && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Formato inválido. Apenas imagens JPG, PNG e WebP são aceites.')
      return
    }

    setUploading(true)
    setProgress(10)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('slot', slot)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload/newsletter', true)

    const token = getAdminToken()
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90)
        setProgress(Math.max(10, percent))
      }
    }

    xhr.onload = () => {
      setUploading(false)
      setProgress(100)

      try {
        const response = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && response.success && response.url) {
          const autoAlt = altValue.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          onChange(response.url, autoAlt)
          setErrorMessage(null)
        } else {
          setErrorMessage(response.message || 'Falha ao processar o upload da imagem.')
        }
      } catch {
        setErrorMessage('Resposta inválida do servidor de upload.')
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      setErrorMessage('Falha de ligação ao servidor. Verifique a sua ligação à internet.')
    }

    xhr.send(formData)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleRemove = () => {
    onChange('', '')
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'banner':
        return 'aspect-[2.8/1] min-h-[140px]'
      case 'square':
        return 'aspect-square max-h-[160px]'
      case 'wide':
      default:
        return 'aspect-[2/1] min-h-[130px]'
    }
  }

  return (
    <div className="space-y-3 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
      {/* Label e Helper */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
            {label}
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
        </div>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Imagem Pronta
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0])
          }
        }}
      />

      {/* Dropzone ou Preview */}
      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${getAspectClass()} ${
            dragActive
              ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
              : 'border-slate-300 hover:border-primary/70 hover:bg-slate-50/70 bg-slate-50/30'
          }`}
        >
          {uploading ? (
            <div className="w-full max-w-xs space-y-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>A otimizar e carregar imagem...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-primary shadow-2xs mb-2">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Clique para carregar ou arraste o ficheiro para aqui
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                JPG, PNG ou WebP até 2 MB (compressão e redimensionamento automático no servidor)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Card com Preview da Imagem */}
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={altValue || label}
              className={`w-full object-contain mx-auto max-h-[220px] bg-slate-900`}
            />

            {/* Overlay com Botões de Trocar e Remover */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-lg hover:bg-slate-100 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Trocar Imagem
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-rose-700 transition"
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </button>
            </div>
          </div>

          {/* Ações Visíveis Abaixo (para mobile ou fácil acesso) */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-mono text-[11px] text-slate-500 truncate max-w-[280px]">
              {value}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Trocar
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Campo de Texto Alternativo (Alt Text) */}
      <div className="pt-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
          Texto Alternativo (Alt Text){requiredAlt && ' *'}
        </label>
        <input
          type="text"
          value={altValue}
          onChange={(e) => onChange(value, e.target.value)}
          placeholder={altPlaceholder}
          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium text-slate-800 transition"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Aparece se o cliente de correio (ex: Outlook) bloquear o carregamento de imagens ou para leitores de ecrã.
        </p>
      </div>
    </div>
  )
}
