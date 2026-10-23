import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'])
const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024 // 15 MB

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.ps1', '.js', '.mjs', '.ts', '.html', '.php', '.dll',
])

export function getHrStorageDirectory(): string {
  const customPath = process.env.HR_STORAGE_PATH
  const root = /*turbopackIgnore: true*/ process.cwd()
  const dir = customPath ? path.resolve(root, customPath) : path.join(root, 'storage', 'private', 'hr-documents')
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export interface SaveDocumentResult {
  storagePath: string
  fileName: string
  fileSize: number
  mimeType: string
}

/**
 * Guarda um documento confidencial em armazenamento privado seguro
 */
export async function savePrivateDocument(
  fileBuffer: Buffer,
  originalFilename: string,
  declaredMimeType: string
): Promise<SaveDocumentResult> {
  const ext = path.extname(originalFilename).toLowerCase()

  if (DANGEROUS_EXTENSIONS.has(ext) || !ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Tipo de ficheiro não permitido (${ext}). São permitidos apenas documentos PDF, Word e Imagens.`)
  }

  if (fileBuffer.length > MAX_DOCUMENT_SIZE) {
    throw new Error(`O ficheiro excede o tamanho máximo permitido de 15 MB.`)
  }

  const storageDir = getHrStorageDirectory()
  const safeUniqueName = `${randomUUID()}${ext}`
  const targetPath = path.join(storageDir, safeUniqueName)

  // Prevenção estrita de Path Traversal
  const resolved = path.resolve(targetPath)
  if (!resolved.startsWith(path.resolve(storageDir))) {
    throw new Error('Tentativa de violação de segurança no caminho do ficheiro (Path Traversal).')
  }

  await fs.promises.writeFile(targetPath, fileBuffer)

  return {
    storagePath: safeUniqueName,
    fileName: path.basename(originalFilename),
    fileSize: fileBuffer.length,
    mimeType: declaredMimeType || 'application/octet-stream',
  }
}

/**
 * Obtém o ficheiro privado para transmissão segura ao utilizador autorizado
 */
export function getPrivateDocumentFile(storagePath: string): { absolutePath: string; fileSize: number } {
  // Rejeitar qualquer tentativa de path traversal no identificador
  if (storagePath.includes('..') || storagePath.includes('/') || storagePath.includes('\\')) {
    throw new Error('Identificador de ficheiro inválido.')
  }

  const storageDir = getHrStorageDirectory()
  const fullPath = path.join(storageDir, storagePath)
  const resolved = path.resolve(fullPath)

  if (!resolved.startsWith(path.resolve(storageDir))) {
    throw new Error('Acesso a ficheiro fora da directoria de segurança proibido.')
  }

  if (!fs.existsSync(resolved)) {
    throw new Error('O ficheiro solicitado não foi encontrado no armazenamento seguro.')
  }

  const stats = fs.statSync(resolved)
  return {
    absolutePath: resolved,
    fileSize: stats.size,
  }
}
