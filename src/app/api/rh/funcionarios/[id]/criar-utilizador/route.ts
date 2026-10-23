import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { recordHrAudit } from '@/lib/hr/audit'
import { hashPassword } from '@/lib/server-auth'
import { randomBytes } from 'crypto'
import { createTransporter } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'CRIAR_UTILIZADOR_FUNCIONARIO', 'UTILIZADOR')

    const { id } = await params
    const employee = await prisma.hrEmployee.findUnique({
      where: { id },
      include: { userRef: true },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Colaborador não encontrado.' }, { status: 404 })
    }

    // Funcionário DESLIGADO não pode ter utilizador criado
    if (employee.status === 'DESLIGADO') {
      return NextResponse.json({ error: 'Não é possível criar conta para um colaborador desligado.' }, { status: 400 })
    }

    if (employee.userId && employee.userRef) {
      return NextResponse.json({
        error: `Este colaborador já possui um utilizador ativo (${employee.userRef.email}).`,
      }, { status: 400 })
    }

    // Verificar se já existe algum AdminUser com este e-mail
    const existingUser = await prisma.adminUser.findUnique({ where: { email: employee.email } })
    if (existingUser) {
      return NextResponse.json({
        error: `Já existe um utilizador no sistema com o e-mail "${employee.email}".`,
      }, { status: 400 })
    }

    // Gerar senha temporária aleatória segura
    const temporaryPassword = `Arknet${randomBytes(4).toString('hex')}!2026`
    const passwordHash = hashPassword(temporaryPassword)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar utilizador com role FUNCIONARIO e troca de senha obrigatória
      const user = await tx.adminUser.create({
        data: {
          name: employee.fullName,
          email: employee.email,
          passwordHash,
          role: 'FUNCIONARIO',
          status: 'active',
          mustChangePassword: true, // REGRA 4: Troca obrigatória no primeiro acesso
        },
      })

      // 2. Ligar ao funcionário
      await tx.hrEmployee.update({
        where: { id },
        data: { userId: user.id },
      })

      // 3. Registar auditoria
      await recordHrAudit(tx, {
        user: session,
        action: 'CRIAR',
        resource: 'UTILIZADOR',
        resourceId: user.id,
        details: `Criou utilizador de acesso ao portal para o colaborador ${employee.fullName} (${user.email}) com troca de senha obrigatória.`,
        newValue: { userId: user.id, email: user.email, role: user.role, mustChangePassword: true },
      })

      return user
    })

    // 4. Enviar convite por e-mail (se SMTP configurado)
    const { transporter, from } = await createTransporter().catch(() => ({ transporter: null, from: null }))
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arknet.co.ao'
    const loginUrl = `${siteUrl}/login`

    if (transporter && employee.email) {
      try {
        await transporter.sendMail({
          from: from || 'ARKNET Recursos Humanos <rh@arknet.co.ao>',
          to: employee.email,
          subject: 'ARKNET - As suas credenciais de acesso ao Portal do Colaborador',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
              <h2 style="color: #0f172a;">Bem-vindo(a) ao Portal do Colaborador ARKNET</h2>
              <p>Olá <strong>${employee.fullName}</strong>,</p>
              <p>A sua conta de acesso ao portal de Recursos Humanos foi criada com sucesso pelo departamento de RH.</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>E-mail de acesso:</strong> ${employee.email}</p>
                <p style="margin: 0 0 8px 0;"><strong>Palavra-passe temporária:</strong> <code>${temporaryPassword}</code></p>
                <p style="margin: 0; font-size: 12px; color: #b91c1c;"><em>Por motivos de segurança, ser-lhe-á solicitado que altere a sua palavra-passe no primeiro acesso.</em></p>
              </div>
              <p><a href="${loginUrl}" style="background-color: #0284c7; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceder ao Portal</a></p>
              <p style="font-size: 11px; color: #64748b; margin-top: 24px;">ARKNET Angola · Luanda</p>
            </div>
          `,
        })
      } catch (mailErr) {
        console.warn('[Criar Utilizador] Erro ao enviar email de convite:', mailErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Conta criada com sucesso para ${employee.fullName}.`,
      temporaryPassword,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        mustChangePassword: result.mustChangePassword,
      },
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar utilizador para colaborador.' }, { status: 400 })
  }
}
