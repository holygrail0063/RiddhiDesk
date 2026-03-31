import { createDeadline } from '@/services/deadlinesService'
import { createNote } from '@/services/notesService'
import { createPlan } from '@/services/plansService'

export async function seedDemoData(uid: string): Promise<void> {
  const now = new Date()
  const inDays = (n: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + n)
    return d
  }
  const atTime = (d: Date, h: number, m: number) => {
    const x = new Date(d)
    x.setHours(h, m, 0, 0)
    return x
  }

  await createNote(uid, {
    title: 'IFM — Black–Scholes intuition',
    content:
      'Review put-call parity, volatility smile basics, and practice 5 end-of-chapter problems on option Greeks.',
    category: 'Exams'
  })

  await createNote(uid, {
    title: 'Exam P — conditional probability drills',
    content:
      'Bayes theorem card deck; timed 20-question set; log weak topics in margin for weekend review.',
    category: 'Study Goals'
  })

  await createDeadline(uid, {
    title: 'Exam FM registration deadline',
    description: 'Register before the SOA window closes; double-check ID and payment method.',
    category: 'Exams',
    dueDate: inDays(12),
    reminderAt: atTime(inDays(10), 9, 0),
    priority: 'high',
    completed: false
  })

  await createDeadline(uid, {
    title: 'Exam P study milestone — full practice exam',
    description: 'Complete one full timed practice exam; review all flagged questions.',
    category: 'Study Goals',
    dueDate: inDays(5),
    reminderAt: atTime(inDays(4), 18, 30),
    priority: 'medium',
    completed: false
  })

  await createDeadline(uid, {
    title: 'Annual membership fee payment',
    description: 'SOA/ CAS fee deadline; keep receipt for records.',
    category: 'Fees',
    dueDate: inDays(45),
    reminderAt: atTime(inDays(42), 8, 0),
    priority: 'medium',
    completed: false
  })

  await createPlan(uid, {
    title: 'Internship application plan',
    description:
      'Finalize resume, ask for one reference, apply to three target firms, track responses in a spreadsheet.',
    targetDate: inDays(60),
    status: 'in_progress',
    category: 'Internships'
  })

  await createPlan(uid, {
    title: 'ASA exam roadmap',
    description:
      'Sequence: P → FM → IFM → LTAM → … map sittings to semester breaks with buffer weeks.',
    targetDate: null,
    status: 'planned',
    category: 'Exam roadmap'
  })

  await createPlan(uid, {
    title: 'Fee payment reminder (seed)',
    description: 'Placeholder plan entry tied to fee awareness; adjust dates as needed.',
    targetDate: inDays(40),
    status: 'planned',
    category: 'Certifications'
  })
}
