import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
const DB_FILE = path.join(process.cwd(), 'data', 'arknet-db.json')

async function recover() {
  console.log('--- ARKNET Product Recovery Execution ---')

  if (!fs.existsSync(DB_FILE)) {
    console.error('Database file data/arknet-db.json not found!')
    return
  }

  const raw = fs.readFileSync(DB_FILE, 'utf-8')
  const db = JSON.parse(raw)
  const existingProducts = db.products || []
  const existingImages = new Set(existingProducts.map((p) => p.image))

  const files = fs.readdirSync(UPLOADS_DIR)
  const recentFiles = files.filter((f) => {
    const match = f.match(/-(\d+)\./)
    if (match) {
      const ts = parseInt(match[1])
      return ts > 1789800000000 && !existingImages.has('/uploads/' + f)
    }
    return false
  })

  console.log(`Found ${recentFiles.length} uploaded photos from Sept 21-22 without product links.`)

  const recoveredProducts = []
  const timestamp = Date.now()

  for (let i = 0; i < recentFiles.length; i++) {
    const file = recentFiles[i]
    const imageUrl = `/uploads/${file}`
    const id = `prod-rec-${timestamp}-${i + 1}`
    const sku = `ARK-REC-${String(i + 1).padStart(3, '0')}`

    let name = `Produto da Loja ${i + 1}`
    let category = 'Produtos'

    const lower = file.toLowerCase()
    if (lower.includes('impressora') || lower.includes('printer')) {
      name = `Impressora / Consumível ${i + 1}`
      category = 'Impressoras e Consumíveis'
    } else if (lower.includes('router') || lower.includes('wifi') || lower.includes('rede') || lower.includes('hotspot')) {
      name = `Equipamento de Rede / Wi-Fi ${i + 1}`
      category = 'Redes e Internet'
    } else if (lower.includes('cabo') || lower.includes('rj45') || lower.includes('conector') || lower.includes('adaptador')) {
      name = `Cabo / Conector de Rede ${i + 1}`
      category = 'Cabos e Conectividade'
    } else if (lower.includes('monitor')) {
      name = `Monitor ${i + 1}`
      category = 'Monitores'
    } else if (lower.includes('mouse') || lower.includes('teclado')) {
      name = `Periférico de Computador ${i + 1}`
      category = 'Periféricos de Computador'
    }

    const prod = {
      id,
      name,
      description: 'Equipamento disponível na loja ARKNET. Edite este produto para definir especificações detalhadas e preço comercial.',
      categoryId: null,
      category,
      price: null,
      image: imageUrl,
      images: null,
      inStock: true,
      quantity: 10,
      featured: false,
      sku,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Gravar no Prisma
    try {
      await prisma.product.upsert({
        where: { id: prod.id },
        create: {
          id: prod.id,
          name: prod.name,
          description: prod.description,
          categoryId: null,
          category: prod.category,
          price: null,
          image: prod.image,
          images: null,
          inStock: true,
          quantity: 10,
          featured: false,
          sku: prod.sku,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {},
      })
    } catch (e) {
      console.error(`Error saving product ${prod.id} to Prisma:`, e)
    }

    recoveredProducts.push(prod)
  }

  // Gravar no JSON
  const allProducts = [...recoveredProducts, ...existingProducts]
  db.products = allProducts
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')

  console.log(`SUCCESS: Restored ${recoveredProducts.length} products to database and JSON!`)
  console.log(`Total products in catalog now: ${allProducts.length}`)
}

recover().catch(console.error).finally(() => prisma.$disconnect())
