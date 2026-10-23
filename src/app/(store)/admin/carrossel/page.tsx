'use client'

import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Eye,
} from 'lucide-react'
import { dataStore, StoreHeroSlide } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ImageUpload } from '@/components/admin/image-upload'

const emptySlide = (): StoreHeroSlide => ({
  id: `shop-hero-${Date.now()}`,
  imageUrl: '/uploads/hero-router.jpg',
  mediaType: 'image',
  linkHref: '/loja',
  altText: 'Destaque ARKNET',
  badge: 'Destaque ARKNET',
  title: 'Leve o essencial.',
  subtitle: 'Viva o extraordinário.',
  active: true,
})

export default function AdminCarrosselPage() {
  const { success } = useToast()
  const [slides, setSlides] = useState<StoreHeroSlide[]>(() => dataStore.getSettings().carouselSlides || [])
  const [isSaving, setIsSaving] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)

  useEffect(() => {
    return dataStore.subscribe(() => {
      setSlides(dataStore.getSettings().carouselSlides || [])
    })
  }, [])

  const updateSlide = (id: string, updates: Partial<StoreHeroSlide>) => {
    setSlides((current) => current.map((slide) => (slide.id === id ? { ...slide, ...updates } : slide)))
  }

  const moveSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= slides.length) return
    const next = [...slides]
    ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
    setSlides(next)
  }

  const handleSave = () => {
    setIsSaving(true)
    const cleanSlides = slides.map((slide) => ({
      ...slide,
      title: slide.title?.trim() || 'Leve o essencial.',
      subtitle: slide.subtitle?.trim() || 'Viva o extraordinário.',
      altText: slide.altText?.trim() || slide.title?.trim() || 'Destaque da Loja ARKNET',
      badge: slide.badge || 'Destaque ARKNET',
      linkHref: slide.linkHref?.trim() || '/loja',
      mediaType: (slide.mediaType || 'image') as 'image' | 'video',
      imageUrl: slide.imageUrl?.trim() || '/uploads/hero-router.jpg',
      active: slide.active !== false,
    }))
    dataStore.updateSettings({ carouselSlides: cleanSlides })
    setSlides(cleanSlides)
    setIsSaving(false)
    success('Banners do carrossel guardados com sucesso!', 'Carrossel Atualizado')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200 p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Gestão dos Banners da Loja</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Defina apenas o <strong>Título</strong> e a <strong>Frase</strong> de cada banner para exibir com destaque na Loja.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSlides((current) => [...current, emptySlide()])}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold uppercase text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Banner
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 px-5 py-2.5 text-xs font-bold uppercase text-white transition shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </div>

      {slides.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 rounded-xl">
          Não existem banners ativos. Clique no botão &quot;Novo Banner&quot; acima para adicionar o primeiro destaque.
        </div>
      )}

      {/* List of Banner Editors */}
      <div className="space-y-6">
        {slides.map((slide, index) => {
          const isPreviewOpen = previewId === slide.id

          return (
            <div key={slide.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              
              {/* Slide Card Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      {slide.title || 'Leve o essencial.'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {slide.subtitle || 'Viva o extraordinário.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewId(isPreviewOpen ? null : slide.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition border cursor-pointer ${
                      isPreviewOpen
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {isPreviewOpen ? 'Ocultar Prévia' : 'Pré-visualizar'}
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  <button
                    type="button"
                    onClick={() => moveSlide(index, -1)}
                    disabled={index === 0}
                    title="Mover para cima"
                    className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-20 transition cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(index, 1)}
                    disabled={index === slides.length - 1}
                    title="Mover para baixo"
                    className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-20 transition cursor-pointer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlides((current) => current.filter((item) => item.id !== slide.id))}
                    title="Remover banner"
                    className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition ml-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Live Preview Bar */}
              {isPreviewOpen && (
                <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Pré-visualização do Banner na Loja
                  </p>

                  <div className="bg-[#f5f7fa] text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-300 grid md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                        {slide.title || 'Leve o essencial.'}
                      </h3>
                      <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                        {slide.subtitle || 'Viva o extraordinário.'}
                      </p>
                    </div>

                    <div className="h-40 flex items-center justify-center p-2 bg-white rounded-lg border border-slate-200">
                      {slide.imageUrl ? (
                        slide.mediaType === 'video' ? (
                          <video
                            src={slide.imageUrl}
                            className="max-h-full max-w-full object-contain"
                            muted
                            autoPlay
                            loop
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={slide.imageUrl} alt={slide.title || 'Banner'} className="max-h-full max-w-full object-contain" />
                        )
                      ) : (
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Content: Media (Foto/Imagem ou Vídeo) + Título and Frase */}
              <div className="p-5 sm:p-6 grid gap-6 lg:grid-cols-[280px_1fr]">
                
                {/* Media Upload */}
                <div className="space-y-3">
                  {/* Selector: Foto/Imagem vs Vídeo */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Tipo de Ficheiro
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateSlide(slide.id, { mediaType: 'image' })}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          slide.mediaType === 'image'
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Foto / Imagem
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSlide(slide.id, { mediaType: 'video' })}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          slide.mediaType === 'video'
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Vídeo
                      </button>
                    </div>
                  </div>

                  <ImageUpload
                    value={slide.imageUrl}
                    onChange={(imageUrl) => updateSlide(slide.id, { imageUrl })}
                    label={slide.mediaType === 'video' ? 'Carregar Vídeo do Banner' : 'Carregar Foto / Imagem'}
                    helperText={
                      slide.mediaType === 'video'
                        ? 'Carregue um vídeo em formato MP4 ou WebM.'
                        : 'Carregue uma foto ou imagem em alta qualidade (PNG, JPG, WebP).'
                    }
                    aspectRatio="video"
                    mediaType={slide.mediaType}
                  />

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.active}
                        onChange={(e) => updateSlide(slide.id, { active: e.target.checked })}
                        className="h-4 w-4 rounded text-primary focus:ring-primary"
                      />
                      <span>Banner Ativo na Loja</span>
                    </label>
                  </div>
                </div>

                {/* ONLY 2 Fields: Título and Frase */}
                <div className="flex flex-col justify-center space-y-5">
                  
                  {/* Título */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                      Título
                    </label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                      placeholder="Ex: Leve o essencial."
                      className="w-full px-4 py-3 text-base font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-primary focus:outline-none transition shadow-2xs"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      O título principal exibido com fonte grande e animação fluida na loja.
                    </p>
                  </div>

                  {/* Frase */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                      Frase
                    </label>
                    <textarea
                      rows={2}
                      value={slide.subtitle || ''}
                      onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                      placeholder="Ex: Viva o extraordinário."
                      className="w-full p-4 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-primary focus:outline-none transition shadow-2xs resize-none leading-relaxed"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      A frase de impacto exibida logo abaixo do título.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

