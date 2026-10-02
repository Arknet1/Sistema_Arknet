async function testEndpoints() {
  console.log('Testing /api/products...')
  const res = await fetch('http://localhost:3000/api/products')
  const data = await res.json()
  console.log('Status:', res.status, 'Success:', data.success)
  console.log('Total products:', data.products?.length)

  const hp = data.products.find(p => p.id === 'prod-portatil-hp-15')
  console.log('\n--- Portátil HP 15 ---')
  console.log('Name:', hp?.name)
  console.log('Options count:', hp?.options?.length)
  console.log('Variants count:', hp?.variants?.length)
  console.log('Options:', hp?.options?.map(o => `${o.name}: ${o.values?.map(v => v.value).join(', ')}`))
  console.log('Sample variant:', hp?.variants?.[0])

  const mochila = data.products.find(p => p.id === 'prod-mochila-executiva-antifurto')
  console.log('\n--- Mochila Executiva ---')
  console.log('Name:', mochila?.name)
  console.log('Colors:', mochila?.options?.[0]?.values?.map(v => `${v.value} (${v.hex})`))
  console.log('Variants:', mochila?.variants?.map(v => `${v.sku}: ${v.options?.map(o => o.value).join(' ')} - ${v.price} Kz`))

  console.log('\nTesting /loja page HTML...')
  const lojaRes = await fetch('http://localhost:3000/loja')
  console.log('Status /loja:', lojaRes.status)

  console.log('\nTesting /loja/prod-portatil-hp-15 page HTML...')
  const prodRes = await fetch('http://localhost:3000/loja/prod-portatil-hp-15')
  console.log('Status /loja/prod-portatil-hp-15:', prodRes.status)
}

testEndpoints().catch(console.error)
