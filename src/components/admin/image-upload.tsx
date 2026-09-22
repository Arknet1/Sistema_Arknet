'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { UploadCloud, Link as LinkIcon, X, Eye, Check, Loader2, FolderOpen, Search, RefreshCw } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  helperText?: string
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto'
  mediaType?: 'image' | 'video'
}

interface UploadedFileItem {
  fileName: string
  url: string
  size: number
  mtime: number
}

export function ImageUpload({
  value,
  onChange,
  label = 'Imagem',
  mediaType = 'image',
  helperText = mediaType === 'video'
    ? 'Formatos suportados: MP4, WebM ou OGG (máx. 50MB)'
    : 'Formatos suportados: PNG, JPG, WebP (máx. 10MB)',
  aspectRatio = 'auto',
}: ImageUploadProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'gallery'>('upload')
  const [urlInput, setUrlInput] = useState(value || '')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Galeria de ficheiros do servidor
  const [galleryFiles, setGalleryFiles] = useState<UploadedFileItem[]>([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [gallerySearch, setGallerySearch] = useState('')

  // Sincroniza o estado interno se o valor externo mudar (ex: ao abrir modal para editar)
  useEffect(() => {
    setUrlInput(value || '')
  }, [value])

  const fetchGallery = async () => {
    setLoadingGallery(true)
    try {
      const res = await fetch('/api/upload')
      if (res.ok) {
        const data = await res.json()
        if (data && data.success && Array.isArray(data.files)) {
          setGalleryFiles(data.files)
        }
      }
    } catch (e) {
      console.warn('[ImageUpload] Erro ao carregar galeria:', e)
    } finally {
      setLoadingGallery(false)
    }
  }

  useEffect(() => {
    if (tab === 'gallery') {
      fetchGallery()
    }
  }, [tab])

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

  const [uploading, setUploading] = useState(false)

  const processFile = async (file: File) => {
    const validFile = mediaType === 'video' ? file.type.startsWith('video/') : file.type.startsWith('image/')
    if (!validFile) {
      alert(`Por favor, selecione um ficheiro de ${mediaType === 'video' ? 'vídeo' : 'imagem'} válido.`)
      return
    }

    setUploading(true)

    try {
      // 1. Tentar upload direto via FormData
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success && data.url) {
        onChange(data.url)
        setUrlInput(data.url)
        setUploading(false)
        return
      }
    } catch (err) {
      console.warn('[ImageUpload] Falha no upload via FormData, tentando compressão:', err)
    }

    // Fallback: comprimir e enviar via Base64 para a API
    if (mediaType === 'video') {
      setUploading(false)
      alert('Não foi possível carregar o vídeo. Verifique o formato e tente novamente.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        compressImage(result, async (compressedUrl) => {
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dataUrl: compressedUrl,
                filename: file.name,
              }),
            })
            const resData = await res.json()
            if (res.ok && resData.success && resData.url) {
              onChange(resData.url)
              setUrlInput(resData.url)
            } else {
              onChange(compressedUrl)
              setUrlInput(compressedUrl)
            }
          } catch (e) {
            onChange(compressedUrl)
            setUrlInput(compressedUrl)
          } finally {
            setUploading(false)
          }
        })
      } else {
        setUploading(false)
      }
    }
    reader.onerror = () => setUploading(false)
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

  const filteredGallery = galleryFiles.filter((f) => {
    if (!gallerySearch.trim()) return true
    return f.fileName.toLowerCase().includes(gallerySearch.toLowerCase())
  })

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
          onClick={() => setTab('gallery')}
          className={`text-xs font-semibold px-3 py-1.5 transition flex items-center gap-1.5 ${
            tab === 'gallery' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Fotos no Servidor ({galleryFiles.length > 0 ? galleryFiles.length : 'Galeria'})
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

      {/* Upload Zone */}
      {tab === 'upload' && (
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
            accept={mediaType === 'video' ? 'video/*' : 'image/*'}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <>
                <div className="p-3 bg-white shadow-sm border border-slate-200 text-primary animate-spin">
                  <Loader2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-primary">
                  A enviar e a guardar {mediaType === 'video' ? 'vídeo' : 'imagem'} no servidor...
                </p>
                <p className="text-xs text-slate-400">Por favor, aguarde um instante</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-white shadow-sm border border-slate-200 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Clique para selecionar ou arraste o {mediaType === 'video' ? 'vídeo' : 'ficheiro'} para aqui
                </p>
                <p className="text-xs text-slate-400">{helperText}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Server Gallery Tab */}
      {tab === 'gallery' && (
        <div className="border border-slate-200 bg-slate-50 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar fotos guardadas no servidor..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-white focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={fetchGallery}
              className="p-2 bg-white border border-slate-300 text-slate-600 hover:text-primary transition"
              title="Atualizar fotos do servidor"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingGallery ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingGallery ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-xs font-medium">A carregar fotos do servidor...</p>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma imagem encontrada na pasta de uploads.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1 bg-white border border-slate-200">
              {filteredGallery.map((file) => {
                const isSelected = value === file.url
                return (
                  <button
                    key={file.fileName}
                    type="button"
                    onClick={() => {
                      onChange(file.url)
                      setUrlInput(file.url)
                    }}
                    className={`relative group aspect-square border rounded overflow-hidden p-1 transition ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                        : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                    }`}
                    title={file.fileName}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.fileName}
                      className="h-full w-full object-contain"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            Dica: Todas as fotos carregadas anteriormente no servidor estão disponíveis aqui para seleção com 1 clique.
          </p>
        </div>
      )}

      {/* URL Input */}
      {tab === 'url' && (
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
            {mediaType === 'video' ? (
              <video src={value} muted className="h-full w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Pré-visualização" className="h-full w-full object-contain" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{mediaType === 'video' ? 'Vídeo selecionado' : 'Imagem selecionada'}</p>
            <p className="text-[11px] text-slate-500 truncate max-w-xs font-mono">{value}</p>
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
