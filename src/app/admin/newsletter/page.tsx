'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Mail,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  X,
  Send,
  FileText,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Bold,
  Italic,
  List,
  Link2,
  Type,
  AlignLeft,
  Image as ImageIcon,
  ShoppingBag,
  Smartphone,
  Monitor,
  Check,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { dataStore, NewsletterSubscriber } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'
import { ImageUpload } from '@/components/admin/image-upload'
import { NewsletterImageSlot } from '@/components/admin/newsletter-image-slot'
import {
  buildImageBlockHtml,
  buildProductBlockHtml,
  generateFullNewsletterHtml,
  generateNewsletterPlainText,
  formatCurrencyAOA,
} from '@/lib/newsletter-template'

type Tab = 'subscritores' | 'compor' | 'historico'

interface Campaign {
  id: string
  subject: string
  body: string
  coverImage?: string | null
  coverImageAlt?: string | null
  offerBannerImage?: string | null
  offerBannerAlt?: string | null
  offerBannerLink?: string | null
  featuredProducts?: string | null
  recipientCount: number
  successCount: number
  failCount: number
  status: string
  sentBy: string | null
  sentAt: string | null
  createdAt: string
}

interface ProductItem {
  id: string
  name: string
  price: number | null
  image: string
  slug?: string
  description?: string
  category?: string
}

export interface FeaturedProductSlotState {
  name: string
  price: string
  image: string
  imageAlt: string
  slug: string
  description: string
}

export default function AdminNewsletterPage() {
  const { success, error, info } = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('subscritores')
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal Novo Subscritor
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Compor Newsletter - 1. Assunto e Corpo
  const [nlSubject, setNlSubject] = useState('')
  const [nlEditionLabel, setNlEditionLabel] = useState('Edição Especial de Outubro')
  const [nlBody, setNlBody] = useState('')

  // Compor Newsletter - 2. Imagem de Capa (Hero)
  const [nlCoverImage, setNlCoverImage] = useState('')
  const [nlCoverImageAlt, setNlCoverImageAlt] = useState('')

  // Compor Newsletter - 3. Banner de Oferta (Opcional)
  const [nlOfferBannerImage, setNlOfferBannerImage] = useState('')
  const [nlOfferBannerAlt, setNlOfferBannerAlt] = useState('')
  const [nlOfferBannerLink, setNlOfferBannerLink] = useState('')

  // Compor Newsletter - 4. Os 3 Produtos Mais Pedidos
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProductSlotState[]>([
    { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' },
    { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' },
    { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' },
  ])
  const [pickingSlotIndex, setPickingSlotIndex] = useState<number | null>(null)

  // Pré-visualização & Envio
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewMode, setPreviewMode] = useState<'visual' | 'plain'>('visual')
  const [isSending, setIsSending] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)

  // Modal Inserir Imagem no Corpo
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [bodyImageUrl, setBodyImageUrl] = useState('')
  const [bodyImageAlt, setBodyImageAlt] = useState('')
  const [bodyImageCaption, setBodyImageCaption] = useState('')
  const [bodyImageLink, setBodyImageLink] = useState('')

  // Modal Inserir Bloco de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productsList, setProductsList] = useState<ProductItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productMode, setProductMode] = useState<'catalog' | 'custom'>('catalog')
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)
  const [customProdName, setCustomProdName] = useState('')
  const [customProdPrice, setCustomProdPrice] = useState<string>('')
  const [customProdImage, setCustomProdImage] = useState('')
  const [customProdImageAlt, setCustomProdImageAlt] = useState('')
  const [customProdSlug, setCustomProdSlug] = useState('')
  const [customProdDesc, setCustomProdDesc] = useState('')

  // Histórico
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null)

  // Subscritores State
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false)

  const getAdminToken = () => {
    if (typeof window === 'undefined') return null
    const cookies = document.cookie.split(';')
    for (const c of cookies) {
      const [key, val] = c.trim().split('=')
      if (key === 'arknet_admin_token') return val
    }
    return localStorage.getItem('arknet_admin_token') || null
  }

  const loadSubscribers = useCallback(async () => {
    setIsLoadingSubscribers(true)
    try {
      const token = getAdminToken()
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/newsletter/subscribers', { headers, credentials: 'include' })
      const data = await res.json()
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers)
      } else {
        const db = dataStore.getSnapshot()
        setSubscribers([...(db.subscribers || [])].sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()))
      }
    } catch {
      const db = dataStore.getSnapshot()
      setSubscribers([...(db.subscribers || [])].sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()))
    } finally {
      setIsLoadingSubscribers(false)
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.products)) {
          setProductsList(data.products)
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar catálogo de produtos:', e)
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    loadSubscribers()
    loadProducts()
    const sync = (db: any) => {
      if (db && Array.isArray(db.subscribers)) {
        setSubscribers([...db.subscribers].sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()))
      }
    }
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [loadSubscribers, loadProducts])

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || sub.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [subscribers, searchTerm, statusFilter])

  const activeCount = subscribers.filter((s) => s.status === 'active').length

  // --- Handlers Subscritores ---
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailToAdd = newEmail.trim()
    if (!emailToAdd) return

    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToAdd, sendWelcome: true }),
      })
      const data = await res.json()
      if (data.success) {
        dataStore.addSubscriber(emailToAdd)
        await loadSubscribers()
        success('Subscritor adicionado e email de boas-vindas enviado!', 'Subscritor Adicionado')
        setIsModalOpen(false)
        setNewEmail('')
      } else {
        error(data.message || 'Erro ao adicionar subscritor.', 'Erro na Subscrição')
      }
    } catch {
      dataStore.addSubscriber(emailToAdd)
      await loadSubscribers()
      success('Subscritor adicionado!', 'Subscritor Adicionado')
      setIsModalOpen(false)
      setNewEmail('')
    }
  }

  const handleToggleStatus = async (sub: NewsletterSubscriber) => {
    const nextStatus = sub.status === 'active' ? 'inactive' : 'active'
    try {
      const token = getAdminToken()
      await fetch('/api/newsletter/subscribers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: sub.id, status: nextStatus }),
      })
    } catch {
      // continua
    }
    dataStore.updateSubscriberStatus(sub.id, nextStatus)
    await loadSubscribers()
    info(`Estado do subscritor "${sub.email}" alterado para ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`)
  }

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      try {
        const token = getAdminToken()
        await fetch(`/api/newsletter/subscribers?id=${deletingId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
      } catch {
        // continua
      }
      dataStore.deleteSubscriber(deletingId)
      await loadSubscribers()
      success('Subscritor removido da lista.', 'Subscritor Eliminado')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredSubscribers,
      'ARKNET_Newsletter_Subscritores',
      [
        { key: 'email', header: 'Endereco de Email' },
        { key: 'status', header: 'Estado', format: (st) => (st === 'active' ? 'Ativo' : 'Inativo') },
        { key: 'subscribedAt', header: 'Data de Subscricao', format: (val) => new Date(val).toLocaleString('pt-PT') },
      ]
    )
  }

  // --- Handlers Compor Newsletter ---
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('nl-body-editor') as HTMLTextAreaElement
    if (!textarea) {
      setNlBody((prev) => prev + '\n' + textToInsert)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newBody = nlBody.substring(0, start) + textToInsert + nlBody.substring(end)
    setNlBody(newBody)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
    }, 50)
  }

  const insertMarkup = (tag: string) => {
    const textarea = document.getElementById('nl-body-editor') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = nlBody.substring(start, end)

    let replacement = ''
    switch (tag) {
      case 'bold':
        replacement = `<strong>${selected || 'texto em destaque'}</strong>`
        break
      case 'italic':
        replacement = `<em>${selected || 'texto em itálico'}</em>`
        break
      case 'heading':
        replacement = `<h2 style="font-size:18px; font-weight:700; color:#0f172a; margin:20px 0 8px 0;">${selected || 'Título da Secção'}</h2>`
        break
      case 'paragraph':
        replacement = `<p style="margin:0 0 14px 0; font-size:14px; color:#334155; line-height:1.7;">${selected || 'Escreva o seu parágrafo informativo aqui...'}</p>`
        break
      case 'list':
        replacement = `<ul style="padding-left:20px; margin:12px 0; font-size:14px; color:#334155; line-height:1.8;">
  <li>${selected || 'Primeiro benefício ou destaque'}</li>
  <li>Segundo ponto relevante para o cliente</li>
  <li>Terceiro item da lista</li>
</ul>`
        break
      case 'link':
        replacement = `<a href="https://arknet.co.ao" style="color:#0284c7; text-decoration:underline; font-weight:600;">${selected || 'Consulte aqui o portal'}</a>`
        break
      case 'divider':
        replacement = `<hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0;" />`
        break
      default:
        return
    }

    insertTextAtCursor(replacement)
  }

  const handleInsertImageModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bodyImageUrl.trim()) {
      error('Por favor carregue ou insira a URL da foto.', 'Imagem em falta')
      return
    }

    const htmlBlock = buildImageBlockHtml({
      url: bodyImageUrl.trim(),
      alt: bodyImageAlt.trim() || 'Foto informativa ARKNET',
      caption: bodyImageCaption.trim() || undefined,
      linkUrl: bodyImageLink.trim() || undefined,
    })

    insertTextAtCursor(htmlBlock)
    setIsImageModalOpen(false)
    setBodyImageUrl('')
    setBodyImageAlt('')
    setBodyImageCaption('')
    setBodyImageLink('')
    success('Foto inserida com sucesso no conteúdo!', 'Imagem Adicionada')
  }

  const handleInsertProductModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let prodData: {
      id?: string
      name: string
      price?: number | null
      image: string
      imageAlt?: string
      slug?: string
      description?: string
    }

    if (productMode === 'catalog') {
      if (!selectedProduct) {
        error('Selecione um produto do catálogo.', 'Seleção Obrigatória')
        return
      }
      prodData = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        imageAlt: selectedProduct.name,
        slug: selectedProduct.slug,
        description: selectedProduct.description,
      }
    } else {
      if (!customProdName.trim() || !customProdImage.trim()) {
        error('Nome e Imagem do produto são obrigatórios.', 'Campos Obrigatórios')
        return
      }
      const numPrice = customProdPrice ? parseFloat(customProdPrice.replace(',', '.')) : null
      prodData = {
        name: customProdName.trim(),
        price: numPrice,
        image: customProdImage.trim(),
        imageAlt: customProdImageAlt.trim() || customProdName.trim(),
        slug: customProdSlug.trim() || undefined,
        description: customProdDesc.trim() || undefined,
      }
    }

    const htmlBlock = buildProductBlockHtml(prodData)
    insertTextAtCursor(htmlBlock)
    setIsProductModalOpen(false)
    setSelectedProduct(null)
    setCustomProdName('')
    setCustomProdPrice('')
    setCustomProdImage('')
    setCustomProdImageAlt('')
    setCustomProdSlug('')
    setCustomProdDesc('')
    success(`Bloco do produto "${prodData.name}" inserido com botões de compra!`, 'Produto Adicionado')
  }

  const updateFeaturedProduct = (index: number, field: keyof FeaturedProductSlotState, value: string) => {
    setFeaturedProducts((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const clearFeaturedProduct = (index: number) => {
    setFeaturedProducts((prev) => {
      const copy = [...prev]
      copy[index] = { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' }
      return copy
    })
  }

  const handleSelectProductForSlot = (prod: ProductItem) => {
    if (pickingSlotIndex !== null) {
      setFeaturedProducts((prev) => {
        const copy = [...prev]
        copy[pickingSlotIndex] = {
          name: prod.name,
          price: prod.price !== null && prod.price !== undefined ? String(prod.price) : '',
          image: prod.image,
          imageAlt: prod.name,
          slug: prod.slug || prod.id,
          description: prod.description || '',
        }
        return copy
      })
      const slotNum = pickingSlotIndex + 1
      setPickingSlotIndex(null)
      success(`Produto "${prod.name}" inserido no Espaço ${slotNum}!`, 'Produto Selecionado')
    }
  }

  const validFeaturedProducts = useMemo(() => {
    return featuredProducts
      .filter((p) => p.name.trim() || p.image.trim())
      .map((p) => ({
        name: p.name.trim() || 'Produto ARKNET',
        price: p.price ? parseFloat(p.price.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
        image: p.image.trim(),
        imageAlt: p.imageAlt.trim() || p.name.trim(),
        slug: p.slug.trim() || undefined,
        description: p.description.trim() || undefined,
      }))
  }, [featuredProducts])

  const handleSendTest = async () => {
    if (!testEmail.trim() || !nlSubject.trim() || !nlBody.trim()) {
      error('Preencha o assunto, conteúdo e email de teste.', 'Campos Obrigatórios')
      return
    }

    setIsSendingTest(true)
    try {
      const token = getAdminToken()
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: nlSubject.trim(),
          editionLabel: nlEditionLabel.trim() || undefined,
          htmlBody: nlBody.trim(),
          coverImage: nlCoverImage.trim() || null,
          coverImageAlt: nlCoverImageAlt.trim() || null,
          offerBannerImage: nlOfferBannerImage.trim() || null,
          offerBannerAlt: nlOfferBannerAlt.trim() || null,
          offerBannerLink: nlOfferBannerLink.trim() || null,
          featuredProducts: validFeaturedProducts.length > 0 ? validFeaturedProducts : null,
          testEmail: testEmail.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        success(data.message, 'Email de Teste Enviado')
      } else {
        error(data.message, 'Falha no Envio de Teste')
      }
    } catch (err: any) {
      error('Erro ao enviar email de teste.', 'Erro')
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleSendNewsletter = async () => {
    setSendConfirmOpen(false)
    if (!nlSubject.trim() || !nlBody.trim()) {
      error('Preencha o assunto e o conteúdo da newsletter.', 'Campos Obrigatórios')
      return
    }

    setIsSending(true)
    try {
      const token = getAdminToken()
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: nlSubject.trim(),
          editionLabel: nlEditionLabel.trim() || undefined,
          htmlBody: nlBody.trim(),
          coverImage: nlCoverImage.trim() || null,
          coverImageAlt: nlCoverImageAlt.trim() || null,
          offerBannerImage: nlOfferBannerImage.trim() || null,
          offerBannerAlt: nlOfferBannerAlt.trim() || null,
          offerBannerLink: nlOfferBannerLink.trim() || null,
          featuredProducts: validFeaturedProducts.length > 0 ? validFeaturedProducts : null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        success(data.message, 'Newsletter Enviada')
        setNlSubject('')
        setNlEditionLabel('Edição Especial de Outubro')
        setNlBody('')
        setNlCoverImage('')
        setNlCoverImageAlt('')
        setNlOfferBannerImage('')
        setNlOfferBannerAlt('')
        setNlOfferBannerLink('')
        setFeaturedProducts([
          { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' },
          { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' },
          { name: '', price: '', image: '', imageAlt: '', slug: '', description: '' },
        ])
        setShowPreview(false)
        setActiveTab('historico')
        loadCampaigns()
      } else {
        error(data.message, 'Falha no Envio')
      }
    } catch (err: any) {
      error('Erro ao enviar newsletter.', 'Erro')
    } finally {
      setIsSending(false)
    }
  }

  // --- Handlers Histórico ---
  const loadCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true)
    try {
      const token = getAdminToken()
      const res = await fetch('/api/newsletter/send', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'historico') {
      loadCampaigns()
    }
  }, [activeTab, loadCampaigns])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviada':
        return { label: 'Enviada', cls: 'bg-emerald-100 text-emerald-800' }
      case 'a_enviar':
        return { label: 'A enviar...', cls: 'bg-amber-100 text-amber-800 animate-pulse' }
      case 'erro':
        return { label: 'Erro', cls: 'bg-rose-100 text-rose-800' }
      case 'rascunho':
        return { label: 'Rascunho', cls: 'bg-slate-100 text-slate-600' }
      default:
        return { label: status, cls: 'bg-slate-100 text-slate-600' }
    }
  }

  // --- Carregar Conteúdo de Exemplo Editorial da Loja ---
  const loadSampleStoreContent = () => {
    setNlSubject('Novidades ARKNET: Equipamentos de Rede e Conectividade para a sua Empresa')
    setNlEditionLabel('Edição Especial de Outubro')
    setNlBody(
      `<h2>Equipamentos de Alto Desempenho e Conectividade</h2>
<p>Descubra a gama completa de soluções tecnológicas da <strong>ARKNET</strong> para otimizar a velocidade, cobertura e segurança da sua infraestrutura.</p>

<p>Contamos com stock imediato de routers Wi-Fi 6 de alta densidade, switches geridos gigabit, cabos de fibra óptica e acessórios de conectividade com garantia e suporte técnico especializado em Luanda.</p>

<h2>Vantagens da Nossa Loja Online</h2>
<ul>
  <li>Equipamentos de marcas de referência mundial com garantia oficial</li>
  <li>Disponibilidade imediata para particulares e empresas</li>
  <li>Encomendas simplificadas com suporte direto via WhatsApp</li>
</ul>`
    )
    setNlCoverImageAlt('Equipamentos e Conectividade Profissional ARKNET')
    setNlOfferBannerAlt('Campanha Especial em Equipamentos de Rede')
    setNlOfferBannerLink('https://arknet.co.ao/loja')

    if (productsList.length >= 3) {
      setFeaturedProducts([
        {
          name: productsList[0].name,
          price: productsList[0].price ? String(productsList[0].price) : '',
          image: productsList[0].image || '',
          imageAlt: productsList[0].name,
          slug: productsList[0].slug || '',
          description: productsList[0].description || '',
        },
        {
          name: productsList[1].name,
          price: productsList[1].price ? String(productsList[1].price) : '',
          image: productsList[1].image || '',
          imageAlt: productsList[1].name,
          slug: productsList[1].slug || '',
          description: productsList[1].description || '',
        },
        {
          name: productsList[2].name,
          price: productsList[2].price ? String(productsList[2].price) : '',
          image: productsList[2].image || '',
          imageAlt: productsList[2].name,
          slug: productsList[2].slug || '',
          description: productsList[2].description || '',
        },
      ])
    }
    info('Modelo de exemplo com foco na loja carregado.')
  }

  const previewHtml = useMemo(() => {
    return generateFullNewsletterHtml({
      subject: nlSubject || 'Novidades e Equipamentos ARKNET',
      editionLabel: nlEditionLabel.trim() || undefined,
      htmlBody:
        nlBody ||
        `<p>Seja bem-vindo à nossa edição de novidades da loja <strong>ARKNET</strong>. Selecionámos os equipamentos de telecomunicações e TI mais procurados para elevar a performance da sua rede.</p>
<p>Explore as nossas ofertas em routers Wi-Fi 6, switches gigabit e cabos de fibra óptica com entrega rápida em Luanda.</p>`,
      coverImage: nlCoverImage || null,
      coverImageAlt: nlCoverImageAlt || 'Equipamentos ARKNET',
      offerBannerImage: nlOfferBannerImage || null,
      offerBannerAlt: nlOfferBannerAlt || 'Banner de Oferta ARKNET',
      offerBannerLink: nlOfferBannerLink || null,
      featuredProducts: validFeaturedProducts.length > 0 ? validFeaturedProducts : null,
      isPreview: true,
    })
  }, [
    nlSubject,
    nlEditionLabel,
    nlBody,
    nlCoverImage,
    nlCoverImageAlt,
    nlOfferBannerImage,
    nlOfferBannerAlt,
    nlOfferBannerLink,
    validFeaturedProducts,
  ])

  const previewPlainText = useMemo(() => {
    return generateNewsletterPlainText(
      nlSubject || 'Assunto da Newsletter ARKNET',
      nlBody || 'Conteúdo da newsletter...',
      undefined,
      validFeaturedProducts.length > 0 ? validFeaturedProducts : null
    )
  }, [nlSubject, nlBody, validFeaturedProducts])

  const filteredCatalog = useMemo(() => {
    if (!productSearch.trim()) return productsList
    return productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
    )
  }, [productsList, productSearch])

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'subscritores', label: 'Subscritores', icon: Users },
    { key: 'compor', label: 'Compor Newsletter com Imagens', icon: FileText },
    { key: 'historico', label: 'Histórico de Envios', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Newsletter ARKNET</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold bg-sky-100 text-sky-800 rounded-full">
              Design Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Gestão de campanhas visuais de alto impacto com banner de capa, fotografias embutidas, cartões de produtos com ligação ao WhatsApp e pré-visualização responsiva multiplataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Ativa</span>
            <span className="text-sm font-extrabold text-slate-900">{activeCount} subscritores</span>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200/80 bg-slate-50/50 px-2 pt-2 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-t-lg border-b-2 ${
                  isActive
                    ? 'border-primary text-primary bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === 'subscritores' && (
                  <span className={`ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {activeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ============================================ */}
        {/* TAB: SUBSCRITORES */}
        {/* ============================================ */}
        {activeTab === 'subscritores' && (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 rounded-xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{subscribers.length}</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100 rounded-xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Subscritores Ativos</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 rounded-xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inativos / Cancelados</p>
                  <p className="text-2xl font-black text-slate-500 mt-1">{subscribers.length - activeCount}</p>
                </div>
                <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por endereço de email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
                >
                  <option value="all">Todos os Subscritores</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Inativos</option>
                </select>
                <button
                  type="button"
                  onClick={() => loadSubscribers()}
                  disabled={isLoadingSubscribers}
                  title="Atualizar lista"
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-primary hover:border-primary hover:bg-slate-50 transition bg-white"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSubscribers ? 'animate-spin' : ''}`} />
                </button>
                <ExportButton onExport={handleExportCSV} label="Exportar CSV" />
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-secondary/90 transition shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Novo Subscritor
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-4 text-center">Estado</th>
                      <th className="py-3.5 px-4">Data de Registo</th>
                      <th className="py-3.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          Nenhum subscritor encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition group">
                          <td className="py-3.5 px-6 font-mono font-semibold text-slate-900 group-hover:text-primary transition">
                            {sub.email}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(sub)}
                              className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold uppercase rounded-full transition shadow-2xs ${
                                sub.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="Clique para alternar estado"
                            >
                              {sub.status === 'active' ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 text-slate-400" />
                                  Inativo
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(sub.subscribedAt).toLocaleDateString('pt-PT')}{' '}
                            <span className="text-[10px] text-slate-400">
                              {new Date(sub.subscribedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`mailto:${sub.email}`}
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 transition rounded-lg"
                                title="Enviar email direto"
                              >
                                <Send className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(sub.id)
                                  setIsDeleteModalOpen(true)
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition rounded-lg"
                                title="Remover subscritor"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: COMPOR NEWSLETTER COM IMAGENS */}
        {/* ============================================ */}
        {activeTab === 'compor' && (
          <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-50 via-sky-50/60 to-white border border-sky-200/80 rounded-xl p-5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-sky-600 text-white rounded-lg shadow-xs shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                    Editor de Newsletter ARKNET · {activeCount} destinatário{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-sky-800 mt-1 leading-relaxed">
                    Componha e-mails corporativos elegantes com imagens de capa, fotografias no corpo e produtos com botão WhatsApp direto. As imagens e links são otimizados para total compatibilidade com Gmail, Outlook e smartphones.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={loadSampleStoreContent}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs"
                  title="Preencher campos com texto profissional focado na loja"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Modelo de Loja
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-xs ${
                    showPreview
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Voltar ao Editor' : 'Pré-visualizar E-mail'}
                </button>
              </div>
            </div>

            {/* Alternância entre Editor e Pré-visualização Completa */}
            {!showPreview ? (
              <div className="space-y-6">
                {/* 1. Assunto e Rótulo da Edição */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        Assunto da Newsletter *
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        {nlSubject.length}/200 caracteres
                      </span>
                    </div>
                    <input
                      type="text"
                      value={nlSubject}
                      onChange={(e) => setNlSubject(e.target.value)}
                      placeholder="Ex: Novos equipamentos e conectividade de alta velocidade ARKNET"
                      className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none bg-white font-semibold text-slate-900 transition"
                      maxLength={200}
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Este título é o assunto apresentado na caixa de entrada dos clientes e no topo do e-mail.
                    </p>
                  </div>

                  {/* Rótulo da Edição Editável */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Rótulo da Edição / Subtítulo Decorativo
                      </label>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Texto Manuscrito Allura
                      </span>
                    </div>
                    <input
                      type="text"
                      value={nlEditionLabel}
                      onChange={(e) => setNlEditionLabel(e.target.value)}
                      placeholder="Ex: Edição Especial de Outubro"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none bg-white font-medium text-slate-900 transition"
                      maxLength={100}
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      Aparece em letra manuscrita com elegância logo abaixo do título <strong>NEWSLETTER</strong>. Pode personalizar para qualquer mês ou campanha (ex.: &ldquo;Edição Especial de Outubro&rdquo;, &ldquo;Novidades da Semana&rdquo;, &ldquo;Especial Black Friday&rdquo;).
                    </p>
                  </div>
                </div>

                {/* 2. Imagem de Capa (Hero Banner) */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        1. Imagem de Capa (Hero Banner)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Banner de topo com alta resolução (redimensionado automaticamente até 1200 px no servidor para ecrãs retina).
                      </p>
                    </div>
                  </div>

                  <NewsletterImageSlot
                    label="Ficheiro da Imagem de Capa"
                    slot="cover"
                    value={nlCoverImage}
                    altValue={nlCoverImageAlt}
                    onChange={(url, alt) => {
                      setNlCoverImage(url)
                      setNlCoverImageAlt(alt)
                    }}
                    aspectRatio="banner"
                    helperText="Aceita apenas JPG, PNG e WebP (máx. 2 MB). Validação real no servidor por magic bytes."
                    altPlaceholder="Ex: Banner principal de tecnologia e telecomunicações ARKNET"
                  />
                </div>

                {/* 3. Editor de Conteúdo com Barra de Ferramentas Rica */}
                <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        2. Conteúdo da Mensagem *
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Estruture o texto principal da newsletter. Pode inserir imagens adicionais no texto ou formatar parágrafos.
                      </p>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-100 border-b border-slate-200">
                    {/* Formatação Básica */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => insertMarkup('heading')}
                        className="p-1.5 text-slate-700 hover:text-primary hover:bg-slate-50 rounded transition"
                        title="Título de Secção (H2)"
                      >
                        <Type className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkup('bold')}
                        className="p-1.5 text-slate-700 hover:text-primary hover:bg-slate-50 rounded transition"
                        title="Texto a Negrito"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkup('italic')}
                        className="p-1.5 text-slate-700 hover:text-primary hover:bg-slate-50 rounded transition"
                        title="Texto em Itálico"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkup('paragraph')}
                        className="p-1.5 text-slate-700 hover:text-primary hover:bg-slate-50 rounded transition"
                        title="Novo Parágrafo"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkup('list')}
                        className="p-1.5 text-slate-700 hover:text-primary hover:bg-slate-50 rounded transition"
                        title="Lista de Tópicos"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkup('link')}
                        className="p-1.5 text-slate-700 hover:text-primary hover:bg-slate-50 rounded transition"
                        title="Inserir Link"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

                    {/* Inserção de Imagens e Produtos no Corpo */}
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-sky-700 transition"
                      title="Inserir Foto no Conteúdo"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Inserir Foto no Texto
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-emerald-700 transition"
                      title="Inserir Bloco de Produto no Texto"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Inserir Bloco no Texto
                    </button>

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkup('divider')}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-bold hover:bg-white rounded-lg transition"
                        title="Linha Divisória"
                      >
                        Linha Divisória
                      </button>
                    </div>
                  </div>

                  {/* Textarea */}
                  <textarea
                    id="nl-body-editor"
                    value={nlBody}
                    onChange={(e) => setNlBody(e.target.value)}
                    placeholder={`Escreva aqui a mensagem principal da newsletter...\n\nExemplo:\n<p>Estimado cliente,</p>\n<p>Temos novidades em stock na nossa loja online com entrega rápida em Luanda.</p>`}
                    className="w-full px-5 py-4 text-sm border-0 focus:ring-0 focus:outline-none bg-white font-mono min-h-[220px] resize-y leading-relaxed text-slate-800"
                  />
                </div>

                {/* 4. Os 3 Produtos "Mais Pedidos" (3 Espaços de Imagem) */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-600" />
                        3. Foto e Dados dos 3 Produtos &quot;Mais Pedidos&quot;
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Carregue a fotografia de cada um dos 3 produtos de destaque com nome, preço e ligação direta à loja e WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {featuredProducts.map((prod, index) => (
                      <div
                        key={index}
                        className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                              {index + 1}
                            </span>
                            Produto #{index + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPickingSlotIndex(index)}
                              className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 px-2 py-0.5 rounded transition"
                              title="Preencher com produto do catálogo"
                            >
                              Catálogo
                            </button>
                            {(prod.name || prod.image) && (
                              <button
                                type="button"
                                onClick={() => clearFeaturedProduct(index)}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline px-1"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Upload da Foto do Produto */}
                        <NewsletterImageSlot
                          label="Foto do Produto"
                          slot="product"
                          value={prod.image}
                          altValue={prod.imageAlt}
                          onChange={(url, alt) => {
                            updateFeaturedProduct(index, 'image', url)
                            updateFeaturedProduct(index, 'imageAlt', alt || prod.name)
                          }}
                          aspectRatio="square"
                          helperText="JPG, PNG, WebP (máx. 2 MB). Redimensionado até 600 px."
                          altPlaceholder={`Foto de ${prod.name || `Produto ${index + 1}`}`}
                        />

                        {/* Campos de Nome, Preço e Link */}
                        <div className="space-y-2.5 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                              Nome do Produto
                            </label>
                            <input
                              type="text"
                              value={prod.name}
                              onChange={(e) => updateFeaturedProduct(index, 'name', e.target.value)}
                              placeholder="Ex: Switch Gigabit 24 Portas"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-emerald-600 font-medium text-slate-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Preço (Kz)
                              </label>
                              <input
                                type="text"
                                value={prod.price}
                                onChange={(e) => updateFeaturedProduct(index, 'price', e.target.value)}
                                placeholder="Ex: 85000"
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-emerald-600 font-medium text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Slug / Link Loja
                              </label>
                              <input
                                type="text"
                                value={prod.slug}
                                onChange={(e) => updateFeaturedProduct(index, 'slug', e.target.value)}
                                placeholder="Ex: switches/switch-24p"
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-emerald-600 font-medium text-slate-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Banner de Oferta (Opcional) */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-sky-600" />
                        4. Banner de Oferta Especial
                        <span className="text-[10px] font-normal text-slate-400 lowercase">(opcional)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Banner de promoção ou desconto exibido antes da secção de produtos (redimensionado até 600 px).
                      </p>
                    </div>
                  </div>

                  <NewsletterImageSlot
                    label="Ficheiro do Banner de Oferta"
                    slot="banner"
                    value={nlOfferBannerImage}
                    altValue={nlOfferBannerAlt}
                    onChange={(url, alt) => {
                      setNlOfferBannerImage(url)
                      setNlOfferBannerAlt(alt)
                    }}
                    aspectRatio="banner"
                    helperText="JPG, PNG ou WebP (máx. 2 MB). Redimensionado e comprimido automaticamente."
                    altPlaceholder="Ex: Campanha de Oferta Especial em Equipamentos ARKNET"
                  />

                  {nlOfferBannerImage && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Link de Destino do Banner ao Clicar:
                      </label>
                      <input
                        type="url"
                        value={nlOfferBannerLink}
                        onChange={(e) => setNlOfferBannerLink(e.target.value)}
                        placeholder="https://arknet.co.ao/loja"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Pré-visualização Responsiva Completa */
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3.5 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-700">Simulador:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg transition ${
                        previewDevice === 'desktop'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      Computador (600px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg transition ${
                        previewDevice === 'mobile'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Telemóvel (375px)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-700">Formato:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('visual')}
                      className={`px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg transition ${
                        previewMode === 'visual'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      HTML Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('plain')}
                      className={`px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg transition ${
                        previewMode === 'plain'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Texto Simples
                    </button>
                  </div>
                </div>

                {/* Simulador da Mensagem */}
                <div className="bg-slate-900/90 rounded-2xl p-8 flex justify-center items-center min-h-[500px] border border-slate-800 shadow-inner">
                  {previewMode === 'visual' ? (
                    <div
                      className={`transition-all duration-300 shadow-2xl bg-white ${
                        previewDevice === 'mobile'
                          ? 'w-[375px] border-[10px] border-slate-800 rounded-[36px] overflow-hidden'
                          : 'w-full max-w-[620px] rounded-2xl overflow-hidden border border-slate-300'
                      }`}
                    >
                      {previewDevice === 'mobile' && (
                        <div className="bg-slate-800 text-white text-[10px] py-1.5 px-4 text-center font-bold tracking-wider uppercase">
                          Simulação Mobile (Gmail / iOS Mail)
                        </div>
                      )}
                      <div className="max-h-[660px] overflow-y-auto">
                        <iframe
                          srcDoc={previewHtml}
                          title="Pré-visualização da Newsletter"
                          className="w-full min-h-[600px] border-none"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-[600px] bg-white p-6 rounded-xl border border-slate-300 shadow-xl font-mono text-xs whitespace-pre-wrap text-slate-800 max-h-[520px] overflow-y-auto leading-relaxed">
                      {previewPlainText}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ações e Envio de Teste */}
            <div className="pt-2 space-y-4">
              {/* Card de Teste */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Enviar E-mail de Teste Visual
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receba uma cópia de teste no seu correio (Gmail, Outlook) para validar imagens e formatação antes do envio aos clientes.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="o.seu.email@exemplo.com"
                    className="flex-1 md:w-64 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSendingTest || !testEmail.trim() || !nlSubject.trim() || !nlBody.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 shadow-xs"
                  >
                    {isSendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Enviar Teste
                  </button>
                </div>
              </div>

              {/* Botão Enviar para Todos */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  Total de destinatários ativos na base: <strong className="text-slate-900 font-bold">{activeCount}</strong>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                  >
                    {showPreview ? 'Editar Código' : 'Pré-visualizar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendConfirmOpen(true)}
                    disabled={isSending || !nlSubject.trim() || !nlBody.trim() || activeCount === 0}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        A enviar para {activeCount} subscritores...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Disparar Newsletter Oficial ({activeCount} destinatários)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ============================================ */}
        {/* TAB: HISTÓRICO */}
        {/* ============================================ */}
        {activeTab === 'historico' && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Últimas newsletters enviadas pelo painel de administração da ARKNET.</p>
              <button
                type="button"
                onClick={loadCampaigns}
                disabled={isLoadingCampaigns}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCampaigns ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {isLoadingCampaigns ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                A carregar histórico...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">Nenhuma newsletter enviada ainda</p>
                <p className="text-xs mt-1">Comece por compor e enviar a primeira newsletter na aba &quot;Compor Newsletter&quot;.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const badge = getStatusBadge(c.status)
                  const isExpanded = expandedCampaign === c.id
                  return (
                    <div key={c.id} className="border border-slate-200/80 rounded-xl bg-white overflow-hidden transition shadow-2xs hover:border-slate-300">
                      {/* Campaign Row */}
                      <button
                        type="button"
                        onClick={() => setExpandedCampaign(isExpanded ? null : c.id)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/70 transition"
                      >
                        {c.coverImage ? (
                          <div className="h-12 w-16 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.coverImage} alt={c.subject} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                            <Mail className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{c.subject}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.sentAt ? new Date(c.sentAt).toLocaleString('pt-PT') : new Date(c.createdAt).toLocaleString('pt-PT')}
                            {c.sentBy && ` · por ${c.sentBy}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800">
                              {c.successCount}/{c.recipientCount}
                            </p>
                            <p className="text-[10px] text-slate-400">entregues</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 p-5 bg-slate-50/60">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                              <p className="text-xl font-black text-slate-900">{c.recipientCount}</p>
                              <p className="text-[10px] uppercase text-slate-400 font-bold">Destinatários</p>
                            </div>
                            <div className="text-center p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                              <p className="text-xl font-black text-emerald-600">{c.successCount}</p>
                              <p className="text-[10px] uppercase text-slate-400 font-bold">Entregues</p>
                            </div>
                            <div className="text-center p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                              <p className="text-xl font-black text-rose-600">{c.failCount}</p>
                              <p className="text-[10px] uppercase text-slate-400 font-bold">Falhados</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Pré-visualização do conteúdo:</p>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-700 max-h-72 overflow-auto">
                              <div dangerouslySetInnerHTML={{ __html: c.body }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: INSERIR FOTO NO CORPO DA NEWSLETTER */}
      {/* ======================================================== */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Inserir Foto no Conteúdo</h3>
                  <p className="text-[11px] text-slate-500">Adicione uma imagem entre os parágrafos da newsletter.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInsertImageModalSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <ImageUpload
                value={bodyImageUrl}
                onChange={(url) => setBodyImageUrl(url)}
                label="Ficheiro da Imagem *"
                helperText="JPG, PNG ou WebP (máx. 2MB). Redimensionada para encaixe perfeito no email."
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Texto Alternativo (Alt Text) *
                </label>
                <input
                  type="text"
                  required
                  value={bodyImageAlt}
                  onChange={(e) => setBodyImageAlt(e.target.value)}
                  placeholder="Ex: Servidores de alta performance ARKNET no datacenter"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Fundamental para acessibilidade e leitores com imagens bloqueadas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Legenda Abaixo da Foto (opcional)
                  </label>
                  <input
                    type="text"
                    value={bodyImageCaption}
                    onChange={(e) => setBodyImageCaption(e.target.value)}
                    placeholder="Ex: Infraestrutura de fibra ótica Luanda"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:border-primary focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Link ao Clicar na Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={bodyImageLink}
                    onChange={(e) => setBodyImageLink(e.target.value)}
                    placeholder="https://arknet.co.ao/servicos"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:border-primary focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!bodyImageUrl.trim()}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 uppercase rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Inserir no Conteúdo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INSERIR BLOCO DE PRODUTO DA LOJA */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Inserir Bloco de Produto no E-mail</h3>
                  <p className="text-[11px] text-slate-500">
                    Gera um cartão com foto, nome, preço, botão &quot;Ver produto&quot; (/loja) e &quot;Comprar pelo WhatsApp&quot;.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alternador Catálogo ou Personalizado */}
            <div className="flex border-b border-slate-200 px-6 pt-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setProductMode('catalog')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 mr-5 transition ${
                  productMode === 'catalog'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Produtos da Loja ARKNET ({productsList.length})
              </button>
              <button
                type="button"
                onClick={() => setProductMode('custom')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                  productMode === 'custom'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Criar Produto Personalizado
              </button>
            </div>

            <form onSubmit={handleInsertProductModalSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {productMode === 'catalog' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Pesquisar produto pelo nome ou categoria..."
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {loadingProducts ? (
                    <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      A carregar produtos da loja...
                    </div>
                  ) : filteredCatalog.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Nenhum produto encontrado. Pode utilizar a opção &quot;Criar Produto Personalizado&quot; acima.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                      {filteredCatalog.map((prod) => {
                        const isSelected = selectedProduct?.id === prod.id
                        return (
                          <div
                            key={prod.id}
                            onClick={() => setSelectedProduct(prod)}
                            className={`p-3 border rounded-xl cursor-pointer transition flex items-center gap-3 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                            }`}
                          >
                            <div className="h-14 w-14 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={prod.image} alt={prod.name} className="h-full w-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                              <p className="text-[11px] font-extrabold text-emerald-600 mt-0.5">
                                {formatCurrencyAOA(prod.price)}
                              </p>
                              {prod.category && (
                                <p className="text-[10px] text-slate-400 truncate">{prod.category}</p>
                              )}
                            </div>
                            {isSelected && (
                              <div className="p-1 bg-emerald-600 text-white rounded-full shrink-0">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Nome do Produto *
                      </label>
                      <input
                        type="text"
                        required
                        value={customProdName}
                        onChange={(e) => setCustomProdName(e.target.value)}
                        placeholder="Ex: Router Wi-Fi 6 Gigabit Pro"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Preço em Kwanzas (Kz)
                      </label>
                      <input
                        type="text"
                        value={customProdPrice}
                        onChange={(e) => setCustomProdPrice(e.target.value)}
                        placeholder="Ex: 85000 (ou deixar em branco para 'Sob consulta')"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none bg-white font-medium"
                      />
                    </div>
                  </div>

                  <ImageUpload
                    value={customProdImage}
                    onChange={(url) => setCustomProdImage(url)}
                    label="Foto do Produto *"
                    helperText="Formato quadrado ou retangular (PNG ou JPG)."
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Pequena Descrição / Destaque (opcional)
                    </label>
                    <input
                      type="text"
                      value={customProdDesc}
                      onChange={(e) => setCustomProdDesc(e.target.value)}
                      placeholder="Ex: Ideal para pequenas e médias empresas com alta taxa de transferência"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={productMode === 'catalog' ? !selectedProduct : (!customProdName.trim() || !customProdImage.trim())}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 uppercase rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Inserir Cartão do Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Subscritor Manualmente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Novo Subscritor</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubscriber} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereço de Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cliente@empresa.ao"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 uppercase rounded-lg shadow-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remover Subscritor"
        message="Tem a certeza que deseja remover este email da lista de subscritores da newsletter?"
        confirmText="Sim, Remover"
        cancelText="Cancelar"
      />

      {/* Send Confirm Modal */}
      <ConfirmModal
        isOpen={sendConfirmOpen}
        onClose={() => setSendConfirmOpen(false)}
        onConfirm={handleSendNewsletter}
        title="Confirmar Envio de Newsletter"
        message={`Tem a certeza que deseja enviar esta newsletter com imagens para ${activeCount} subscritor${activeCount !== 1 ? 'es' : ''} ativo${activeCount !== 1 ? 's' : ''}? Esta ação não pode ser revertida.`}
        confirmText="Sim, Enviar Agora"
        cancelText="Cancelar"
      />
    </div>
  )
}
