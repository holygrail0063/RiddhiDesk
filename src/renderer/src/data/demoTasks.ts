import type { PlannerTask } from '@/types/planner'

const today = new Date()
const toYmd = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (base: Date, n: number) => {
  const x = new Date(base)
  x.setDate(x.getDate() + n)
  return x
}

export const demoTasks: PlannerTask[] = [
  {
    id: 't1',
    title: 'Exam FM revision — annuities',
    description:
      'Review level/ increasing annuities; do 20 mixed problems; write 3 common pitfalls in notes.',
    assignedDate: toYmd(today),
    originalDueDate: toYmd(addDays(today, 1)),
    currentDueDate: toYmd(addDays(today, 1)),
    plannerType: 'weekly',
    category: 'Revision',
    priority: 'high',
    status: 'todo',
    timeLabel: '7:30 PM'
  },
  {
    id: 't2',
    title: 'Probability problem set (Exam P)',
    description:
      'Timed set: conditional probability + Bayes + expectation. Flag any weak subtopics.',
    assignedDate: toYmd(addDays(today, 2)),
    originalDueDate: toYmd(addDays(today, 3)),
    currentDueDate: toYmd(addDays(today, 3)),
    plannerType: 'weekly',
    category: 'Study Goal',
    priority: 'medium',
    status: 'todo'
  },
  {
    id: 't3',
    title: 'Bill payment deadline',
    description: 'Pay the exam/ membership fee and save receipt PDF in a safe folder.',
    assignedDate: toYmd(addDays(today, -3)),
    originalDueDate: toYmd(addDays(today, -1)),
    currentDueDate: toYmd(addDays(today, -1)),
    plannerType: 'monthly',
    category: 'Bill Payment',
    priority: 'high',
    status: 'todo'
  },
  {
    id: 't4',
    title: 'Internship application prep',
    description:
      'Update resume bullets; draft a short cover note template; list 5 target firms.',
    assignedDate: toYmd(addDays(today, 6)),
    originalDueDate: toYmd(addDays(today, 9)),
    currentDueDate: toYmd(addDays(today, 9)),
    plannerType: 'monthly',
    category: 'Internship',
    priority: 'medium',
    status: 'todo'
  },
  {
    id: 't5',
    title: 'Weekly formula review',
    description:
      'Write formulas for duration/convexity; quiz yourself without notes; update flashcards.',
    assignedDate: toYmd(addDays(today, -1)),
    originalDueDate: toYmd(addDays(today, 0)),
    currentDueDate: toYmd(addDays(today, 0)),
    plannerType: 'weekly',
    category: 'Study Goal',
    priority: 'low',
    status: 'completed'
  },
  {
    id: 't6',
    title: 'Monthly mock exam target',
    description:
      'Complete one full mock exam; review every mistake; record score trend.',
    assignedDate: toYmd(addDays(today, 10)),
    originalDueDate: toYmd(addDays(today, 18)),
    currentDueDate: toYmd(addDays(today, 23)),
    plannerType: 'monthly',
    category: 'Mock Exam',
    priority: 'high',
    status: 'needs_replan'
  }
]

