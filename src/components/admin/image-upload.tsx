'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { UploadCloud, Link as LinkIcon, X, Eye, Check } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  helperText?: string
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto'
}

export function ImageUpload({
  value,
  onChange,
  label = 'Imagem',
  helperText = 'Formatos suportados: PNG, JPG, WebP (máx. 5MB)',
  aspectRatio = 'auto',
}: ImageUploadProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState(value || '')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincroniza o estado interno se o valor externo mudar (ex: ao abrir modal para editar)
  React.useEffect(() => {
    setUrlInput(value || '')
  }, [value])

  const compressImage = (dataUrl: string, callback: (compressed: string) => void) => {
    if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) {
      callback(dataUrl)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const maxDim = 800
      let width = img.width
      let height = img.height

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        try {
          // Comprime para JPEG a 80% (reduz de 5MB para ~50KB-80KB)
          const compressed = canvas.toDataURL('image/jpeg', 0.8)
          callback(compressed)
        } catch {
          callback(dataUrl)
        }
      } else {
        callback(dataUrl)
      }
    }
    img.onerror = () => callback(dataUrl)
    img.src = dataUrl
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um ficheiro de imagem válido.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        compressImage(result, (compressedUrl) => {
          onChange(compressedUrl)
          setUrlInput(compressedUrl)
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleUrlInputChange = (val: string) => {
    setUrlInput(val)
    onChange(val.trim())
  }

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
    }
  }

  const handleClear = () => {
    onChange('')
    setUrlInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`text-xs font-semibold px-3 py-1.5 transition ${
            tab === 'upload' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Carregar do Computador
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`text-xs font-semibold px-3 py-1.5 transition ${
            tab === 'url' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inserir Link / URL
        </button>
      </div>

      {/* Upload Zone or URL Input */}
      {tab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed p-6 text-center cursor-pointer transition ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-slate-300 hover:border-primary/60 bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-white shadow-sm border border-slate-200 text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Clique para selecionar ou arraste a imagem para aqui
            </p>
            <p className="text-xs text-slate-400">{helperText}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlInputChange(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white text-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase hover:bg-primary transition flex items-center gap-1.5 shrink-0"
          >
            <Check className="h-4 w-4" />
            Aplicar
          </button>
        </div>
      )}

      {/* Preview Section */}
      {value && (
        <div className="relative mt-3 p-3 bg-slate-100 border border-slate-200 flex items-center gap-4">
          <div className="relative h-20 w-24 bg-white border border-slate-200 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Pré-visualização" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">Imagem selecionada</p>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">{value}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
              <Check className="h-3 w-3" /> Pronta a utilizar
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white transition border border-transparent hover:border-slate-200"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
