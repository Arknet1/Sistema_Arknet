import axios from 'axios'

async function test() {
  console.log('Testing Products API...')
  const baseURL = 'http://localhost:3000'

  // 1. GET /api/products
  const res1 = await axios.get(`${baseURL}/api/products`)
  console.log('GET /api/products status:', res1.status, 'Total count:', res1.data.products?.length)

  // 2. GET /api/products/recover
  const res2 = await axios.get(`${baseURL}/api/products/recover`)
  console.log('GET /api/products/recover status:', res2.status, 'Unlinked files:', res2.data.unlinkedFiles?.length)

  // 3. POST /api/products (Create a test product)
  const testProd = {
    name: 'Produto de Teste Persistência ' + Date.now(),
    description: 'Teste automático de integridade e persistência de dados',
    category: 'Redes e Internet',
    price: 45000,
    image: '/uploads/photoroom_20260901_112409-1788942301870.jpg',
    inStock: true,
    quantity: 12,
    featured: false,
    sku: 'TEST-001',
  }

  const res3 = await axios.post(`${baseURL}/api/products`, testProd)
  console.log('POST /api/products status:', res3.status, 'Created ID:', res3.data.product?.id)
  const createdId = res3.data.product?.id

  // 4. PUT /api/products/[id] (Update the test product)
  const res4 = await axios.put(`${baseURL}/api/products/${createdId}`, {
    price: 52000,
    quantity: 15,
  })
  console.log('PUT /api/products/[id] status:', res4.status, 'Updated price:', res4.data.product?.price)

  // 5. DELETE /api/products/[id] (Clean up test product)
  const res5 = await axios.delete(`${baseURL}/api/products/${createdId}`)
  console.log('DELETE /api/products/[id] status:', res5.status, 'Message:', res5.data.message)

  console.log('ALL TESTS PASSED SUCCESSFULLY!')
}

test().catch(console.error)
