'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Image as ImageIcon, Plus, Save, Trash2 } from 'lucide-react'
import { dataStore, StoreHeroSlide } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ImageUpload } from '@/components/admin/image-upload'

const emptySlide = (): StoreHeroSlide => ({
  id: `shop-hero-${Date.now()}`,
  imageUrl: '/uploads/hero-router.jpg',
  mediaType: 'image',
  linkHref: '/loja',
  altText: 'Destaque da loja ARKNET',
  active: true,
})

export default function AdminCarrosselPage() {
  const { success, error } = useToast()
  const [slides, setSlides] = useState<StoreHeroSlide[]>(() => dataStore.getSettings().carouselSlides || [])
  const [isSaving, setIsSaving] = useState(false)

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
    if (slides.some((slide) => !slide.imageUrl.trim() || !slide.altText.trim())) {
      error('Cada banner precisa de um ficheiro e de um texto alternativo.')
      return
    }

    setIsSaving(true)
    dataStore.updateSettings({ carouselSlides: slides })
    setIsSaving(false)
    success('Conteúdo do carrossel atualizado com sucesso.', 'Carrossel Guardado')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 bg-white border border-slate-200 p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Conteúdo do Carrossel</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Edite os banners apresentados no topo da página da loja online.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSlides((current) => [...current, emptySlide()])}
            className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2.5 text-xs font-bold uppercase text-slate-700 transition hover:bg-slate-200"
          >
            <Plus className="h-4 w-4" />
            Novo Banner
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-secondary px-4 py-2.5 text-xs font-bold uppercase text-white transition hover:bg-secondary/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>

      {slides.length === 0 && (
        <div className="border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Não existem banners ativos. Crie um novo banner para preencher o carrossel.
        </div>
      )}

      <div className="space-y-5">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white border border-slate-200 p-5 shadow-xs sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Banner {index + 1}</span>
                <h2 className="text-base font-bold text-slate-900">{slide.altText || 'Banner sem descrição'}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveSlide(index, -1)} disabled={index === 0} title="Mover para cima" className="p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-25">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} title="Mover para baixo" className="p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-25">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setSlides((current) => current.filter((item) => item.id !== slide.id))} title="Remover banner" className="p-2 text-rose-600 transition hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                <ImageUpload
                  value={slide.imageUrl}
                  onChange={(imageUrl) => updateSlide(slide.id, { imageUrl })}
                  label={slide.mediaType === 'video' ? 'Vídeo do banner' : 'Imagem do banner'}
                  helperText={`Escolha um ${slide.mediaType === 'video' ? 'vídeo' : 'ficheiro de imagem'} do computador ou arraste-o para esta área.`}
                  aspectRatio="video"
                  mediaType={slide.mediaType}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="text-xs font-semibold text-slate-600">
                  <legend>Tipo de ficheiro</legend>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(['image', 'video'] as const).map((mediaType) => (
                      <button
                        key={mediaType}
                        type="button"
                        onClick={() => updateSlide(slide.id, { mediaType, imageUrl: '' })}
                        aria-pressed={slide.mediaType === mediaType}
                        className={`h-10 border text-xs font-bold transition ${slide.mediaType === mediaType ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-primary'}`}
                      >
                        {mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="flex items-center gap-2 self-end pb-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={slide.active} onChange={(event) => updateSlide(slide.id, { active: event.target.checked })} className="h-4 w-4 accent-primary" />
                  Mostrar no carrossel
                </label>
                <label className="text-xs font-semibold text-slate-600">Texto alternativo da imagem
                  <input value={slide.altText} onChange={(event) => updateSlide(slide.id, { altText: event.target.value })} className="mt-1 h-10 w-full border border-slate-200 px-3 font-normal text-slate-900 outline-none focus:border-primary" />
                </label>
                <label className="text-xs font-semibold text-slate-600">Link do banner
                  <input value={slide.linkHref} onChange={(event) => updateSlide(slide.id, { linkHref: event.target.value })} className="mt-1 h-10 w-full border border-slate-200 px-3 font-normal text-slate-900 outline-none focus:border-primary" />
                </label>
                <label className="text-xs font-semibold text-slate-600">Título em destaque <span className="font-normal text-slate-400">(opcional)</span>
                  <input value={slide.title || ''} onChange={(event) => updateSlide(slide.id, { title: event.target.value })} placeholder="Ex.: Internet mais rápida para a sua casa" className="mt-1 h-10 w-full border border-slate-200 px-3 font-normal text-slate-900 outline-none focus:border-primary" />
                </label>
                <label className="text-xs font-semibold text-slate-600">Subtítulo <span className="font-normal text-slate-400">(opcional)</span>
                  <textarea value={slide.subtitle || ''} onChange={(event) => updateSlide(slide.id, { subtitle: event.target.value })} placeholder="Uma frase curta para reforçar a oferta." rows={2} className="mt-1 w-full resize-none border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-primary" />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
