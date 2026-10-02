import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const dbFilePath = path.join(process.cwd(), 'data', 'arknet-db.json')

const seedProductsWithVariants = [
  {
    id: 'prod-portatil-hp-15',
    name: 'Portátil HP 15 — Core i5 / i7 High Performance',
    slug: 'portatil-hp-15-core-i5-i7',
    brand: 'HP',
    category: 'Computadores e Portáteis',
    description: 'Portátil corporativo e profissional de elevado desempenho, equipado com processadores Intel Core de última geração, teclado ergonómico com teclado numérico, ecrã Full HD IPS antirreflexo de 15.6" e autonomia de bateria para todo o dia.',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    quantity: 53,
    featured: true,
    sku: 'ARK-HP15-GEN',
    options: [
      {
        id: 'opt-cor-hp',
        name: 'Cor',
        order: 0,
        values: [
          { id: 'val-hp-prata', value: 'Prata', hex: '#D1D5DB', order: 0 },
          { id: 'val-hp-preto', value: 'Preto', hex: '#111827', order: 1 }
        ]
      },
      {
        id: 'opt-ram-hp',
        name: 'RAM',
        order: 1,
        values: [
          { id: 'val-hp-8gb', value: '8GB DDR4', hex: null, order: 0 },
          { id: 'val-hp-16gb', value: '16GB DDR4', hex: null, order: 1 }
        ]
      },
      {
        id: 'opt-ssd-hp',
        name: 'Armazenamento',
        order: 2,
        values: [
          { id: 'val-hp-256gb', value: '256GB SSD NVMe', hex: null, order: 0 },
          { id: 'val-hp-512gb', value: '512GB SSD NVMe', hex: null, order: 1 }
        ]
      }
    ],
    variants: [
      {
        id: 'var-hp-slv-8-256',
        sku: 'ARK-HP15-SLV-8-256',
        price: 320000,
        stock: 8,
        active: true,
        order: 0,
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Prata', hex: '#D1D5DB' },
          { optionName: 'RAM', value: '8GB DDR4' },
          { optionName: 'Armazenamento', value: '256GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-slv-8-512',
        sku: 'ARK-HP15-SLV-8-512',
        price: 380000,
        stock: 6,
        active: true,
        order: 1,
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Prata', hex: '#D1D5DB' },
          { optionName: 'RAM', value: '8GB DDR4' },
          { optionName: 'Armazenamento', value: '512GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-slv-16-256',
        sku: 'ARK-HP15-SLV-16-256',
        price: 440000,
        stock: 5,
        active: true,
        order: 2,
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Prata', hex: '#D1D5DB' },
          { optionName: 'RAM', value: '16GB DDR4' },
          { optionName: 'Armazenamento', value: '256GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-slv-16-512',
        sku: 'ARK-HP15-SLV-16-512',
        price: 510000,
        stock: 10,
        active: true,
        order: 3,
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Prata', hex: '#D1D5DB' },
          { optionName: 'RAM', value: '16GB DDR4' },
          { optionName: 'Armazenamento', value: '512GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-blk-8-256',
        sku: 'ARK-HP15-BLK-8-256',
        price: 320000,
        stock: 7,
        active: true,
        order: 4,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Preto', hex: '#111827' },
          { optionName: 'RAM', value: '8GB DDR4' },
          { optionName: 'Armazenamento', value: '256GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-blk-8-512',
        sku: 'ARK-HP15-BLK-8-512',
        price: 380000,
        stock: 5,
        active: true,
        order: 5,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Preto', hex: '#111827' },
          { optionName: 'RAM', value: '8GB DDR4' },
          { optionName: 'Armazenamento', value: '512GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-blk-16-256',
        sku: 'ARK-HP15-BLK-16-256',
        price: 440000,
        stock: 4,
        active: true,
        order: 6,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Preto', hex: '#111827' },
          { optionName: 'RAM', value: '16GB DDR4' },
          { optionName: 'Armazenamento', value: '256GB SSD NVMe' }
        ]
      },
      {
        id: 'var-hp-blk-16-512',
        sku: 'ARK-HP15-BLK-16-512',
        price: 510000,
        stock: 8,
        active: true,
        order: 7,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Cor', value: 'Preto', hex: '#111827' },
          { optionName: 'RAM', value: '16GB DDR4' },
          { optionName: 'Armazenamento', value: '512GB SSD NVMe' }
        ]
      }
    ]
  },
  {
    id: 'prod-impressora-epson-l3250',
    name: 'Impressora Multifunções Epson EcoTank L3250',
    slug: 'impressora-epson-ecotank-l3250',
    brand: 'Epson',
    category: 'Impressoras e Consumíveis',
    description: 'Impressora multifunções 3 em 1 (Impressão, Cópia e Digitalização) com sistema de tanques de tinta recarregáveis EcoTank de altíssimo rendimento. Economia de até 90% em custos de impressão com conectividade sem fios Wi-Fi Direct e USB.',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    quantity: 30,
    featured: true,
    sku: 'ARK-EPSON-L3250',
    options: [
      {
        id: 'opt-conect-epson',
        name: 'Conectividade',
        order: 0,
        values: [
          { id: 'val-epson-wifi', value: 'Wi-Fi + USB', hex: null, order: 0 },
          { id: 'val-epson-usb', value: 'Apenas USB', hex: null, order: 1 }
        ]
      },
      {
        id: 'opt-cor-epson',
        name: 'Cor',
        order: 1,
        values: [
          { id: 'val-epson-preto', value: 'Preto', hex: '#111827', order: 0 },
          { id: 'val-epson-branco', value: 'Branco', hex: '#FFFFFF', order: 1 }
        ]
      }
    ],
    variants: [
      {
        id: 'var-epson-blk-wifi',
        sku: 'ARK-EPSON-L3250-BLK-WIFI',
        price: 230000,
        stock: 12,
        active: true,
        order: 0,
        images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Conectividade', value: 'Wi-Fi + USB' },
          { optionName: 'Cor', value: 'Preto', hex: '#111827' }
        ]
      },
      {
        id: 'var-epson-blk-usb',
        sku: 'ARK-EPSON-L3250-BLK-USB',
        price: 185000,
        stock: 6,
        active: true,
        order: 1,
        images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Conectividade', value: 'Apenas USB' },
          { optionName: 'Cor', value: 'Preto', hex: '#111827' }
        ]
      },
      {
        id: 'var-epson-wht-wifi',
        sku: 'ARK-EPSON-L3250-WHT-WIFI',
        price: 235000,
        stock: 8,
        active: true,
        order: 2,
        images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Conectividade', value: 'Wi-Fi + USB' },
          { optionName: 'Cor', value: 'Branco', hex: '#FFFFFF' }
        ]
      },
      {
        id: 'var-epson-wht-usb',
        sku: 'ARK-EPSON-L3250-WHT-USB',
        price: 190000,
        stock: 4,
        active: true,
        order: 3,
        images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Conectividade', value: 'Apenas USB' },
          { optionName: 'Cor', value: 'Branco', hex: '#FFFFFF' }
        ]
      }
    ]
  },
  {
    id: 'prod-router-tplink-archer',
    name: 'Router Wi-Fi 6 TP-Link Archer / 4G LTE Gigabit',
    slug: 'router-wi-fi-6-tp-link-archer-gigabit',
    brand: 'TP-Link',
    category: 'Redes e Internet',
    description: 'Roteador gigabit de alto alcance com tecnologia Wi-Fi 6 (802.11ax), suporte a dezenas de dispositivos simultâneos com MU-MIMO, beamforming de alto ganho e proteção de rede avançada WPA3.',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    quantity: 38,
    featured: true,
    sku: 'ARK-TPLINK-AX',
    options: [
      {
        id: 'opt-versao-router',
        name: 'Versão',
        order: 0,
        values: [
          { id: 'val-rt-fibra', value: 'Fibra Gigabit Wi-Fi 6', hex: null, order: 0 },
          { id: 'val-rt-4g', value: '4G LTE / SIM Card', hex: null, order: 1 }
        ]
      },
      {
        id: 'opt-cor-router',
        name: 'Cor',
        order: 1,
        values: [
          { id: 'val-rt-preto', value: 'Preto', hex: '#111827', order: 0 },
          { id: 'val-rt-branco', value: 'Branco', hex: '#FFFFFF', order: 1 }
        ]
      }
    ],
    variants: [
      {
        id: 'var-tplink-fibra-blk',
        sku: 'ARK-TPLINK-AX-FIBRA-BLK',
        price: 65000,
        stock: 15,
        active: true,
        order: 0,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Versão', value: 'Fibra Gigabit Wi-Fi 6' },
          { optionName: 'Cor', value: 'Preto', hex: '#111827' }
        ]
      },
      {
        id: 'var-tplink-fibra-wht',
        sku: 'ARK-TPLINK-AX-FIBRA-WHT',
        price: 65000,
        stock: 10,
        active: true,
        order: 1,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Versão', value: 'Fibra Gigabit Wi-Fi 6' },
          { optionName: 'Cor', value: 'Branco', hex: '#FFFFFF' }
        ]
      },
      {
        id: 'var-tplink-4g-blk',
        sku: 'ARK-TPLINK-AX-4G-BLK',
        price: 110000,
        stock: 8,
        active: true,
        order: 2,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Versão', value: '4G LTE / SIM Card' },
          { optionName: 'Cor', value: 'Preto', hex: '#111827' }
        ]
      },
      {
        id: 'var-tplink-4g-wht',
        sku: 'ARK-TPLINK-AX-4G-WHT',
        price: 115000,
        stock: 5,
        active: true,
        order: 3,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'],
        options: [
          { optionName: 'Versão', value: '4G LTE / SIM Card' },
          { optionName: 'Cor', value: 'Branco', hex: '#FFFFFF' }
        ]
      }
    ]
  },
  {
    id: 'prod-mochila-executiva-antifurto',
    name: 'Mochila Executiva Impermeável Antifurto c/ USB',
    slug: 'mochila-executiva-impermeavel-antifurto',
    brand: 'ARKNET Tech & Travel',
    category: 'Acessórios de Computador',
    description: 'Mochila executiva para portáteis até 16 polegadas, confeccionada em tecido Oxford balístico impermeável e resistente a rasgões. Inclui fechos antifurto ocultos, porta USB externa para carregamento e compartimentos acolchoados para proteção máxima.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    quantity: 50,
    featured: true,
    sku: 'ARK-BAG-EXEC',
    options: [
      {
        id: 'opt-cor-mochila',
        name: 'Cor',
        order: 0,
        values: [
          { id: 'val-bag-azul', value: 'Azul Marinho', hex: '#1E3A8A', order: 0 },
          { id: 'val-bag-cinza', value: 'Cinzento Chumbo', hex: '#374151', order: 1 },
          { id: 'val-bag-preto', value: 'Preto', hex: '#111827', order: 2 },
          { id: 'val-bag-verde', value: 'Verde Tropa', hex: '#3F6212', order: 3 }
        ]
      }
    ],
    variants: [
      {
        id: 'var-bag-navy-blu',
        sku: 'ARK-BAG-NAVY-BLU',
        price: 35000,
        stock: 14,
        active: true,
        order: 0,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'],
        options: [{ optionName: 'Cor', value: 'Azul Marinho', hex: '#1E3A8A' }]
      },
      {
        id: 'var-bag-steel-gry',
        sku: 'ARK-BAG-STEEL-GRY',
        price: 35000,
        stock: 10,
        active: true,
        order: 1,
        images: ['https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'],
        options: [{ optionName: 'Cor', value: 'Cinzento Chumbo', hex: '#374151' }]
      },
      {
        id: 'var-bag-midnight-blk',
        sku: 'ARK-BAG-MIDNIGHT-BLK',
        price: 35000,
        stock: 20,
        active: true,
        order: 2,
        images: ['https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80'],
        options: [{ optionName: 'Cor', value: 'Preto', hex: '#111827' }]
      },
      {
        id: 'var-bag-army-grn',
        sku: 'ARK-BAG-ARMY-GRN',
        price: 35000,
        stock: 6,
        active: true,
        order: 3,
        images: ['https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&auto=format&fit=crop&q=80'],
        options: [{ optionName: 'Cor', value: 'Verde Tropa', hex: '#3F6212' }]
      }
    ]
  }
]

async function runSeed() {
  console.log('--- A INICIAR SEED DE PRODUTOS COM VARIANTES ---')

  // 1. Atualizar base de dados JSON fallback
  let rawDb = {}
  try {
    if (fs.existsSync(dbFilePath)) {
      rawDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'))
    }
  } catch (err) {
    console.error('Erro ao ler fallback JSON:', err)
  }

  const existingProducts = Array.isArray(rawDb.products) ? rawDb.products : []
  const existingIds = new Set(seedProductsWithVariants.map(p => p.id))
  const filteredExisting = existingProducts.filter(p => !existingIds.has(p.id))

  const mergedProducts = [...seedProductsWithVariants, ...filteredExisting]
  rawDb.products = mergedProducts
  fs.writeFileSync(dbFilePath, JSON.stringify(rawDb, null, 2), 'utf8')
  console.log('✓ arknet-db.json atualizado com os 4 produtos de variantes!')

  // 2. Sincronizar com Prisma SQLite
  for (const prod of seedProductsWithVariants) {
    console.log(`-> A processar: ${prod.name}`)

    // Upsert product
    await prisma.product.upsert({
      where: { id: prod.id },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        brand: prod.brand,
        description: prod.description,
        category: prod.category,
        price: prod.price,
        image: prod.image,
        images: JSON.stringify(prod.images),
        inStock: prod.inStock,
        quantity: prod.quantity,
        featured: prod.featured,
        sku: prod.sku,
      },
      update: {
        name: prod.name,
        slug: prod.slug,
        brand: prod.brand,
        description: prod.description,
        category: prod.category,
        price: prod.price,
        image: prod.image,
        images: JSON.stringify(prod.images),
        inStock: prod.inStock,
        quantity: prod.quantity,
        featured: prod.featured,
        sku: prod.sku,
      }
    })

    // Upsert options & values
    const optValIdMap = new Map()

    for (const opt of prod.options) {
      const optRecord = await prisma.productOption.upsert({
        where: { name: opt.name },
        create: {
          id: opt.id,
          name: opt.name,
          order: opt.order || 0
        },
        update: {}
      })

      for (const val of opt.values) {
        const valRecord = await prisma.productOptionValue.upsert({
          where: {
            optionId_value: {
              optionId: optRecord.id,
              value: val.value
            }
          },
          create: {
            id: val.id,
            optionId: optRecord.id,
            value: val.value,
            hex: val.hex || null,
            order: val.order || 0
          },
          update: {
            hex: val.hex || undefined
          }
        })

        optValIdMap.set(`${opt.name}::${val.value}`, valRecord.id)
      }
    }

    // Upsert variants
    for (const v of prod.variants) {
      const variantRecord = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        create: {
          id: v.id,
          productId: prod.id,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          images: JSON.stringify(v.images),
          active: v.active,
          order: v.order,
        },
        update: {
          productId: prod.id,
          price: v.price,
          stock: v.stock,
          images: JSON.stringify(v.images),
          active: v.active,
          order: v.order,
        }
      })

      // Link pivot options
      for (const opt of v.options) {
        const valId = optValIdMap.get(`${opt.optionName}::${opt.value}`)
        if (valId) {
          try {
            await prisma.productVariantOption.upsert({
              where: {
                variantId_optionValueId: {
                  variantId: variantRecord.id,
                  optionValueId: valId
                }
              },
              create: {
                id: `pvo-${variantRecord.id}-${valId}`,
                variantId: variantRecord.id,
                optionValueId: valId
              },
              update: {}
            })
          } catch (e) {
            // Ignora duplicados
          }
        }
      }
    }
  }

  console.log('✓ Seed Prisma concluído com sucesso!')
  await prisma.$disconnect()
}

runSeed().catch((e) => {
  console.error('Erro no seed:', e)
  prisma.$disconnect()
})
