import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { admitCandidateAsEmployee } from '@/lib/hr/services/recruitment-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'ADMITIR_CANDIDATO')

    const { id } = await params
    const body = await request.json()
    const {
      departmentId,
      positionId,
      employeeNumber,
      biNumber,
      birthDate,
      admissionDate,
      baseSalary,
      contractType,
      contractEndDate,
      address,
      bankName,
      bankIban,
      bankAccountNumber,
    } = body

    if (
      !departmentId ||
      !positionId ||
      !employeeNumber ||
      !biNumber ||
      !birthDate ||
      !admissionDate ||
      !baseSalary ||
      !contractType ||
      !address
    ) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos obrigatórios para admissão devem ser preenchidos.' },
        { status: 400 }
      )
    }

    const result = await admitCandidateAsEmployee(
      id,
      {
        departmentId,
        positionId,
        employeeNumber,
        biNumber,
        birthDate: new Date(birthDate),
        admissionDate: new Date(admissionDate),
        baseSalary: Number(baseSalary),
        contractType,
        contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined,
        address,
        bankName,
        bankIban,
        bankAccountNumber,
      },
      session
    )

    return NextResponse.json({ success: true, ...result }, { status: 201 })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
