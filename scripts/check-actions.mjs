// Busca os logs do último workflow run falhado
const runsRes = await fetch('https://api.github.com/repos/Arknet1/Sistema_Arknet/actions/runs?per_page=1', {
  headers: { 'Accept': 'application/vnd.github+json' }
})
const { workflow_runs } = await runsRes.json()
const run = workflow_runs[0]
console.log('Run ID:', run.id, '| Status:', run.status, '| Conclusion:', run.conclusion)

// Buscar jobs do run
const jobsRes = await fetch(`https://api.github.com/repos/Arknet1/Sistema_Arknet/actions/runs/${run.id}/jobs`, {
  headers: { 'Accept': 'application/vnd.github+json' }
})
const { jobs } = await jobsRes.json()
for (const job of jobs) {
  console.log(`\nJob: ${job.name} | ${job.conclusion}`)
  const failed = job.steps?.filter(s => s.conclusion === 'failure' || s.conclusion === 'skipped')
  for (const step of (failed ?? [])) {
    console.log(`  ❌ Step: ${step.name} → ${step.conclusion}`)
  }
  // Mostrar todos os steps
  for (const step of (job.steps ?? [])) {
    console.log(`  [${step.conclusion ?? step.status}] ${step.number}. ${step.name}`)
  }
}
