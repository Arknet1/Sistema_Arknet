import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function parseDate(val: any): Date {
  if (!val) return new Date()
  const d = new Date(val)
  return isNaN(d.getTime()) ? new Date() : d
}

function parseOptionalDate(val: any): Date | undefined {
  if (!val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
}

async function main() {
  console.log('🚀 Iniciando Seed da Base de Dados ARKNET a partir de data/arknet-db.json...')

  const dbPath = path.join(process.cwd(), 'data', 'arknet-db.json')
  if (!fs.existsSync(dbPath)) {
    console.warn('⚠️ Ficheiro data/arknet-db.json não encontrado. Seed cancelado.')
    return
  }

  const raw = fs.readFileSync(dbPath, 'utf-8')
  const data = JSON.parse(raw)

  // 1. Limpar tabelas existentes (Ordem respeitando chaves estrangeiras)
  console.log('🧹 Limpando dados antigos...')
  await prisma.auditActivity.deleteMany()
  await prisma.jobApplication.deleteMany()
  await prisma.job.deleteMany()
  await prisma.eventRegistration.deleteMany()
  await prisma.event.deleteMany()
  await prisma.storeOrderItem.deleteMany()
  await prisma.storeOrder.deleteMany()
  await prisma.productReservation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.adminUser.deleteMany()
  await prisma.serviceLead.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.course.deleteMany()
  await prisma.project.deleteMany()
  await prisma.dailyActivity.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.companySetting.deleteMany()

  // 2. Utilizadores Administrativos
  console.log('👥 Inserindo Administradores...')
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      await prisma.adminUser.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email.toLowerCase().trim(),
          password: u.password || null,
          passwordHash: u.passwordHash || null,
          role: u.role || 'editor',
          avatar: u.avatar || null,
          status: u.status || 'active',
          createdAt: parseDate(u.createdAt),
          lastLogin: parseOptionalDate(u.lastLogin),
        },
      })
    }
  }

  // 3. Clientes
  console.log('👤 Inserindo Clientes...')
  if (Array.isArray(data.customers)) {
    for (const c of data.customers) {
      await prisma.customer.create({
        data: {
          id: c.id,
          name: c.name,
          email: c.email.toLowerCase().trim(),
          password: c.password || null,
          passwordHash: c.passwordHash || null,
          phone: c.phone || '',
          company: c.company || null,
          nif: c.nif || null,
          address: c.address || null,
          city: c.city || 'Luanda',
          avatar: c.avatar || null,
          status: c.status || 'active',
          notes: c.notes || null,
          createdAt: parseDate(c.createdAt),
          lastLogin: parseOptionalDate(c.lastLogin),
        },
      })
    }
  }

  // 4. Categorias de Produtos
  console.log('🏷️ Inserindo Categorias...')
  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      await prisma.productCategory.create({
        data: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || 'Package',
          description: cat.description || null,
          order: typeof cat.order === 'number' ? cat.order : 0,
          hideWhenEmpty: !!cat.hideWhenEmpty,
        },
      })
    }
  }

  // 5. Produtos
  console.log('📦 Inserindo Produtos...')
  if (Array.isArray(data.products)) {
    for (const p of data.products) {
      // Tentar associar à categoria existente se coincidir o nome
      const categoryRecord = await prisma.productCategory.findFirst({
        where: { name: p.category },
      })

      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category || 'Geral',
          categoryId: categoryRecord?.id || null,
          price: typeof p.price === 'number' ? p.price : null,
          image: p.image || '/uploads/placeholder.jpg',
          images: p.images ? JSON.stringify(p.images) : null,
          inStock: p.inStock !== undefined ? !!p.inStock : true,
          quantity: typeof p.quantity === 'number' ? p.quantity : 0,
          featured: !!p.featured,
          sku: p.sku || null,
          createdAt: parseDate(p.createdAt),
          updatedAt: parseDate(p.updatedAt),
        },
      })
    }
  }

  // 6. Encomendas & Itens
  console.log('🛒 Inserindo Encomendas...')
  if (Array.isArray(data.orders)) {
    for (const o of data.orders) {
      const createdOrder = await prisma.storeOrder.create({
        data: {
          id: o.id,
          orderNumber: o.orderNumber || `ORD-${Date.now()}`,
          customerName: o.customerName || 'Cliente',
          customerEmail: o.customerEmail || '',
          customerPhone: o.customerPhone || '',
          customerCompany: o.customerCompany || null,
          customerNif: o.customerNif || null,
          customerCity: o.customerCity || 'Luanda',
          customerAddress: o.customerAddress || null,
          deliveryMethod: o.deliveryMethod || 'entrega_luanda',
          paymentMethod: o.paymentMethod || 'transferencia',
          total: typeof o.total === 'number' ? o.total : null,
          status: o.status || 'novo',
          notes: o.notes || null,
          whatsappPhone: o.whatsappPhone || null,
          botStatus: o.botStatus || 'bot_active',
          receiptUrl: o.receiptUrl || null,
          receiptFilename: o.receiptFilename || null,
          receiptReceivedAt: parseOptionalDate(o.receiptReceivedAt),
          conversationHistory: o.conversationHistory ? JSON.stringify(o.conversationHistory) : null,
          confirmedAt: parseOptionalDate(o.confirmedAt),
          createdAt: parseDate(o.createdAt),
          updatedAt: parseDate(o.updatedAt),
        },
      })

      if (Array.isArray(o.items)) {
        for (let i = 0; i < o.items.length; i++) {
          const it = o.items[i]
          // Verificar se o produto referenciado existe na BD
          let validProductId: string | null = null
          if (it.productId) {
            const prodExists = await prisma.product.findUnique({ where: { id: it.productId } })
            if (prodExists) validProductId = it.productId
          }
          await prisma.storeOrderItem.create({
            data: {
              id: `item-${o.id}-${i}-${Date.now()}`,
              orderId: createdOrder.id,
              productId: validProductId,
              productName: it.productName || 'Item de Encomenda',
              price: typeof it.price === 'number' ? it.price : null,
              quantity: typeof it.quantity === 'number' ? it.quantity : 1,
              image: it.image || null,
            },
          })
        }
      }
    }
  }

  // 7. Reservas
  console.log('📌 Inserindo Reservas...')
  if (Array.isArray(data.reservations)) {
    for (const r of data.reservations) {
      // Verificar se o produto referenciado existe
      let validResProdId: string | null = null
      if (r.productId) {
        const prodExists = await prisma.product.findUnique({ where: { id: r.productId } })
        if (prodExists) validResProdId = r.productId
      }
      await prisma.productReservation.create({
        data: {
          id: r.id,
          reservationNumber: r.reservationNumber || `RES-${Date.now()}`,
          productId: validResProdId,
          productName: r.productName || 'Produto',
          productImage: r.productImage || null,
          productPrice: typeof r.productPrice === 'number' ? r.productPrice : null,
          customerName: r.customerName || '',
          customerEmail: r.customerEmail || '',
          customerPhone: r.customerPhone || '',
          customerCompany: r.customerCompany || null,
          quantity: typeof r.quantity === 'number' ? r.quantity : 1,
          notes: r.notes || null,
          status: r.status || 'pendente',
          createdAt: parseDate(r.createdAt),
          updatedAt: parseDate(r.updatedAt),
        },
      })
    }
  }

  // 8. Leads Comerciais
  console.log('💼 Inserindo Leads...')
  if (Array.isArray(data.leads)) {
    for (const l of data.leads) {
      await prisma.serviceLead.create({
        data: {
          id: l.id,
          name: l.name,
          email: l.email,
          phone: l.phone || '',
          service: l.service || 'Geral',
          message: l.message || '',
          status: l.status || 'novo',
          notes: l.notes || null,
          source: l.source || 'site_quote',
          createdAt: parseDate(l.createdAt),
          updatedAt: parseDate(l.updatedAt),
        },
      })
    }
  }

  // 9. Subscritores da Newsletter
  console.log('✉️ Inserindo Newsletter...')
  if (Array.isArray(data.subscribers)) {
    for (const s of data.subscribers) {
      await prisma.newsletterSubscriber.create({
        data: {
          id: s.id,
          email: s.email.toLowerCase().trim(),
          status: s.status || 'active',
          subscribedAt: parseDate(s.subscribedAt),
        },
      })
    }
  }

  // 10. Eventos & Inscrições
  console.log('📅 Inserindo Eventos & Inscrições...')
  if (Array.isArray(data.events)) {
    for (const ev of data.events) {
      await prisma.event.create({
        data: {
          id: ev.id,
          title: ev.title,
          slug: ev.slug || `evento-${ev.id}`,
          date: ev.date || '',
          time: ev.time || null,
          location: ev.location || 'Luanda, Angola',
          format: ev.format || 'Presencial',
          description: ev.description || '',
          fullDescription: ev.fullDescription || null,
          image: ev.image || null,
          capacity: typeof ev.capacity === 'number' ? ev.capacity : null,
          status: ev.status || 'agendado',
          speakers: ev.speakers ? JSON.stringify(ev.speakers) : null,
          schedule: ev.schedule ? JSON.stringify(ev.schedule) : null,
          createdAt: parseDate(ev.createdAt),
          updatedAt: parseDate(ev.updatedAt),
        },
      })
    }
  }

  if (Array.isArray(data.eventRegistrations)) {
    for (const reg of data.eventRegistrations) {
      // Verificar se o evento referenciado existe
      const eventExists = await prisma.event.findUnique({ where: { id: reg.eventId } })
      if (!eventExists) {
        console.warn(`  ⚠️ Inscrição ${reg.id} ignorada: evento ${reg.eventId} não encontrado`)
        continue
      }
      await prisma.eventRegistration.create({
        data: {
          id: reg.id,
          eventId: reg.eventId,
          name: reg.name,
          email: reg.email,
          phone: reg.phone || null,
          company: reg.company || null,
          position: reg.position || null,
          status: reg.status || 'pendente',
          ticketCode: reg.ticketCode || null,
          registeredAt: parseDate(reg.registeredAt),
        },
      })
    }
  }

  // 11. Cursos
  console.log('🎓 Inserindo Cursos...')
  if (Array.isArray(data.courses)) {
    for (const c of data.courses) {
      await prisma.course.create({
        data: {
          id: c.id,
          title: c.title,
          category: c.category || 'Tecnologia',
          duration: c.duration || '30 Horas',
          level: c.level || 'Intermédio',
          format: c.format || 'Presencial / Prático',
          description: c.description || '',
          price: typeof c.price === 'number' ? c.price : null,
          icon: c.icon || null,
          skills: c.skills ? JSON.stringify(c.skills) : null,
          isPopular: !!c.isPopular,
          createdAt: parseDate(c.createdAt),
        },
      })
    }
  }

  // 12. Projetos & Atividades Diárias
  console.log('🚀 Inserindo Projetos e Blog...')
  if (Array.isArray(data.projects)) {
    for (const p of data.projects) {
      await prisma.project.create({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug || `projeto-${p.id}`,
          client: p.client || 'Cliente ARKNET',
          category: p.category || 'Telecomunicações',
          sector: p.sector || null,
          year: typeof p.year === 'number' ? p.year : null,
          description: p.description || '',
          fullDescription: p.fullDescription || null,
          metrics: p.metrics ? JSON.stringify(p.metrics) : null,
          challenge: p.challenge || null,
          solution: p.solution || null,
          results: p.results ? JSON.stringify(p.results) : null,
          testimonial: p.testimonial ? JSON.stringify(p.testimonial) : null,
          image: p.image || null,
          gallery: p.gallery ? JSON.stringify(p.gallery) : null,
          featured: !!p.featured,
          order: typeof p.order === 'number' ? p.order : 0,
          createdAt: parseDate(p.createdAt),
        },
      })
    }
  }

  if (Array.isArray(data.dailyActivities)) {
    for (const d of data.dailyActivities) {
      await prisma.dailyActivity.create({
        data: {
          id: d.id,
          title: d.title,
          slug: d.slug || `atividade-${d.id}`,
          date: d.date || '',
          category: d.category || 'Engenharia',
          summary: d.summary || '',
          content: d.content || '',
          author: d.author || 'Equipa de Engenharia ARKNET',
          image: d.image || null,
          readTime: d.readTime || '3 min',
          tags: d.tags ? JSON.stringify(d.tags) : null,
          featured: !!d.featured,
          views: typeof d.views === 'number' ? d.views : 0,
          createdAt: parseDate(d.createdAt),
        },
      })
    }
  }

  // 13. Parceiros & Testemunhos
  console.log('🤝 Inserindo Parceiros & Testemunhos...')
  if (Array.isArray(data.partners)) {
    for (const pa of data.partners) {
      await prisma.partner.create({
        data: {
          id: pa.id,
          name: pa.name,
          logo: pa.logo,
          website: pa.website || null,
          category: pa.category || null,
          order: typeof pa.order === 'number' ? pa.order : 0,
          active: pa.active !== undefined ? !!pa.active : true,
        },
      })
    }
  }

  if (Array.isArray(data.testimonials)) {
    for (const t of data.testimonials) {
      await prisma.testimonial.create({
        data: {
          id: t.id,
          name: t.name || t.clientName || t.company || 'Cliente ARKNET',
          role: t.role || '',
          company: t.company || '',
          avatar: t.avatar || t.logo || null,
          text: t.text || t.testimonial || '',
          rating: typeof t.rating === 'number' ? t.rating : 5,
          active: t.active !== undefined ? !!t.active : true,
          order: typeof t.order === 'number' ? t.order : 0,
        },
      })
    }
  }

  // 14. Vagas de Emprego & Candidaturas
  console.log('💼 Inserindo Vagas...')
  if (Array.isArray(data.jobs)) {
    for (const j of data.jobs) {
      await prisma.job.create({
        data: {
          id: j.id,
          title: j.title,
          department: j.department || 'Engenharia',
          location: j.location || 'Luanda, Angola',
          type: j.type || 'Tempo Inteiro',
          description: j.description || '',
          requirements: j.requirements ? JSON.stringify(j.requirements) : null,
          responsibilities: j.responsibilities ? JSON.stringify(j.responsibilities) : null,
          active: j.active !== undefined ? !!j.active : true,
          createdAt: parseDate(j.createdAt),
        },
      })
    }
  }

  if (Array.isArray(data.applications)) {
    for (const app of data.applications) {
      // Verificar se a vaga existe (se jobId for fornecido)
      let validJobId: string | null = null
      if (app.jobId) {
        const jobExists = await prisma.job.findUnique({ where: { id: app.jobId } })
        if (jobExists) {
          validJobId = app.jobId
        } else {
          console.warn(`  ⚠️ Candidatura ${app.id}: vaga ${app.jobId} não encontrada, FK será null`)
        }
      }
      await prisma.jobApplication.create({
        data: {
          id: app.id,
          jobId: validJobId,
          jobTitle: app.jobTitle || null,
          name: app.name || app.candidateName || 'Candidato',
          email: app.email || app.candidateEmail || '',
          phone: app.phone || app.candidatePhone || '',
          resumeUrl: app.resumeUrl || app.cvFileName || null,
          message: app.message || app.coverLetter || null,
          status: app.status || 'recebida',
          appliedAt: parseDate(app.appliedAt || app.createdAt),
        },
      })
    }
  }

  // 15. Configurações Globais
  console.log('⚙️ Inserindo Configurações Institucionais...')
  if (data.settings) {
    const s = data.settings
    await prisma.companySetting.create({
      data: {
        id: 'global',
        companyName: s.companyName || 'ARKNET',
        tagline: s.tagline || null,
        phones: s.phones ? JSON.stringify(s.phones) : null,
        emails: s.emails ? JSON.stringify(s.emails) : null,
        address: s.address || null,
        city: s.city || 'Luanda',
        country: s.country || 'Angola',
        whatsappChannelUrl: s.whatsappChannelUrl || null,
        whatsappNumber: s.whatsappNumber || null,
        socialLinks: s.socialLinks ? JSON.stringify(s.socialLinks) : null,
        institutionalText: s.institutionalText || null,
        presentationLetter: s.presentationLetter || null,
        updatedAt: parseDate(s.updatedAt),
      },
    })
  }

  // 16. Atividades de Auditoria
  console.log('📝 Inserindo Atividades de Auditoria...')
  if (Array.isArray(data.activities)) {
    for (const a of data.activities) {
      await prisma.auditActivity.create({
        data: {
          id: a.id,
          userId: a.userId || null,
          userName: a.userName || 'Sistema',
          action: a.action || '',
          target: a.target || '',
          targetId: a.targetId || null,
          timestamp: parseDate(a.timestamp),
          details: a.details || null,
        },
      })
    }
  }

  console.log('✅ Seed da Base de Dados ARKNET concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed do Prisma:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
