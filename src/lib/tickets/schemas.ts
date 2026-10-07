import { z } from 'zod'

export const publicTicketSubmissionSchema = z.object({
  type: z.enum(['RECLAMACAO', 'INFORMACAO'], {
    message: 'Selecione o tipo de submissão (Reclamação ou Pedido de Informação).',
  }),
  category: z.enum(
    ['PRODUTO', 'ENTREGA', 'PAGAMENTO', 'ATENDIMENTO', 'SERVICO_TECNICO', 'OUTRO'],
    {
      message: 'Selecione uma categoria válida.',
    }
  ),
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve conter pelo menos 3 caracteres.')
    .max(120, 'O nome não pode exceder 120 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Introduza um endereço de e-mail válido (ex: nome@empresa.ao).')
    .max(150, 'O e-mail não pode exceder 150 caracteres.'),
  phone: z
    .string()
    .trim()
    .max(30, 'O número de telefone é demasiado longo.')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(5, 'O assunto deve conter no mínimo 5 caracteres.')
    .max(180, 'O assunto não pode exceder 180 caracteres.'),
  message: z
    .string()
    .trim()
    .min(20, 'A mensagem deve conter pelo menos 20 caracteres para podermos analisar o seu pedido.')
    .max(2000, 'A mensagem não pode exceder 2000 caracteres.'),
  orderNumber: z
    .string()
    .trim()
    .max(50, 'O número de encomenda não pode exceder 50 caracteres.')
    .optional()
    .or(z.literal('')),
  consentAccepted: z
    .boolean()
    .refine((val) => val === true, 'Deve aceitar os termos de tratamento de dados e política de privacidade.'),
  // Honeypot anti-spam field (must be empty!)
  website_url_hp: z.string().optional().or(z.literal('')),
  // Timestamp when the form was rendered on client (anti-bot instant fill check)
  renderedAt: z.number().optional(),
})

export type PublicTicketSubmissionInput = z.infer<typeof publicTicketSubmissionSchema>

export const updateTicketStatusSchema = z.object({
  status: z.enum(['NOVO', 'EM_ANALISE', 'RESPONDIDO', 'RESOLVIDO', 'ARQUIVADO']).optional(),
  priority: z.enum(['BAIXA', 'NORMAL', 'ALTA']).optional(),
})

export const createTicketNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(3, 'A nota interna deve conter pelo menos 3 caracteres.')
    .max(3000, 'A nota interna não pode exceder 3000 caracteres.'),
})

export const createTicketReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, 'A resposta ao cliente deve conter pelo menos 5 caracteres.')
    .max(5000, 'A resposta não pode exceder 5000 caracteres.'),
  channel: z.enum(['EMAIL', 'WHATSAPP']).default('EMAIL'),
  sendWhatsAppCopy: z.boolean().optional(),
})
