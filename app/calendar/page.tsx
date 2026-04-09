'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Todo {
  id: number
  title: string
  completed: number
  due_date: string | null
  priority: 'high' | 'medium' | 'low'
  tags: { id: number; name: string; color: string }[]
}

interface Holiday {
  id: number
  name: string
  date: string
  year: number
}

interface DayCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  todos: Todo[]
  holidays: Holiday[]
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6'
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCalendar(year: number, month: number, todos: Todo[], holidays: Holiday[]): DayCell[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()

  const holidayMap = new Map<string, Holiday[]>()
  for (const h of holidays) {
    const key = h.date.slice(0, 10)
    if (!holidayMap.has(key)) holidayMap.set(key, [])
    holidayMap.get(key)!.push(h)
  }

  const todoMap = new Map<string, Todo[]>()
  for (const t of todos) {
    if (!t.due_date) continue
    const key = new Date(t.due_date).toLocaleDateString('sv-SE', { timeZone: 'Asia/Singapore' })
    if (!todoMap.has(key)) todoMap.set(key, [])
    todoMap.get(key)!.push(t)
  }

  const weeks: DayCell[][] = []
  let week: DayCell[] = []

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -(startDow - i - 1))
    const key = d.toLocaleDateString('sv-SE')
    week.push({
      date: d,
      isCurrentMonth: false,
      isToday: d.getTime() === today.getTime(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      todos: todoMap.get(key) ?? [],
      holidays: holidayMap.get(key) ?? []
    })
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, month, day)
    const key = d.toLocaleDateString('sv-SE')
    week.push({
      date: d,
      isCurrentMonth: true,
      isToday: d.getTime() === today.getTime(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      todos: todoMap.get(key) ?? [],
      holidays: holidayMap.get(key) ?? []
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    let nextDay = 1
    while (week.length < 7) {
      const d = new Date(year, month + 1, nextDay++)
      const key = d.toLocaleDateString('sv-SE')
      week.push({
        date: d,
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        todos: todoMap.get(key) ?? [],
        holidays: holidayMap.get(key) ?? []
      })
    }
    weeks.push(week)
  }

  return weeks
}

function CalendarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const now = new Date()
  const initialMonth = searchParams.get('month')
  const [currentYear, setCurrentYear] = useState(() => initialMonth ? parseInt(initialMonth.slice(0, 4)) : now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => initialMonth ? parseInt(initialMonth.slice(5, 7)) - 1 : now.getMonth())

  const [todos, setTodos] = useState<Todo[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayCell | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [todosRes, holidaysRes] = await Promise.all([
        fetch('/api/todos'),
        fetch(`/api/holidays?year=${currentYear}`)
      ])
      if (!todosRes.ok) { router.push('/login'); return }
      setTodos(await todosRes.json())
      if (holidaysRes.ok) setHolidays(await holidaysRes.json())
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [currentYear, router])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    router.replace(`/calendar?month=${monthStr}`, { scroll: false })
  }, [currentYear, currentMonth, router])

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  const calendar = buildCalendar(currentYear, currentMonth, todos, holidays)

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-blue-500 hover:text-blue-700 text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📅 Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg">‹</button>
          <span className="text-base font-semibold text-gray-800 dark:text-white w-44 text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg">›</button>
          <button
            onClick={() => { setCurrentYear(now.getFullYear()); setCurrentMonth(now.getMonth()) }}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {DAY_NAMES.map((day, i) => (
              <div
                key={day}
                className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wide ${
                  i === 0 || i === 6 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {calendar.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              {week.map((cell, di) => {
                const hasContent = cell.todos.length > 0 || cell.holidays.length > 0
                return (
                  <div
                    key={di}
                    onClick={() => hasContent && setSelectedDay(cell)}
                    className={`min-h-24 p-1.5 border-r border-gray-100 dark:border-gray-700 last:border-r-0 transition-colors ${
                      !cell.isCurrentMonth ? 'opacity-35' : ''
                    } ${cell.isToday ? 'bg-blue-50 dark:bg-blue-950' : cell.isWeekend ? 'bg-gray-50/50 dark:bg-gray-750' : ''} ${
                      hasContent ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      cell.isToday ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {cell.date.getDate()}
                    </div>

                    {cell.holidays.slice(0, 1).map((h) => (
                      <div key={h.id} className="text-xs px-1 py-0.5 rounded mb-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 truncate" title={h.name}>
                        🎉 {h.name}
                      </div>
                    ))}

                    {cell.todos.slice(0, 2).map((todo) => (
                      <div
                        key={todo.id}
                        className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${todo.completed ? 'opacity-40 line-through' : ''}`}
                        style={{ backgroundColor: PRIORITY_COLORS[todo.priority] + '22', color: PRIORITY_COLORS[todo.priority] }}
                        title={todo.title}
                      >
                        {todo.title}
                      </div>
                    ))}

                    {cell.todos.length > 2 && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 px-1">+{cell.todos.length - 2} more</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />High priority</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />Medium priority</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Low priority</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />Public holiday</span>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {selectedDay.date.toLocaleDateString('en-SG', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Singapore'
                })}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">✕</button>
            </div>

            {selectedDay.holidays.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Public Holidays</h4>
                <div className="space-y-1">
                  {selectedDay.holidays.map((h) => (
                    <div key={h.id} className="text-sm text-green-700 dark:text-green-300 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                      🎉 {h.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDay.todos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Todos ({selectedDay.todos.length})
                </h4>
                <div className="space-y-2">
                  {selectedDay.todos.map((todo) => (
                    <div key={todo.id} className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className={`text-sm font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {todo.title}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded capitalize"
                          style={{ backgroundColor: PRIORITY_COLORS[todo.priority] + '22', color: PRIORITY_COLORS[todo.priority] }}
                        >
                          {todo.priority}
                        </span>
                        {todo.completed === 1 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            Completed
                          </span>
                        )}
                        {todo.tags?.map((tag) => (
                          <span key={tag.id} style={{ backgroundColor: tag.color + '33', color: tag.color }} className="text-xs px-1.5 py-0.5 rounded">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading calendar...</p>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  )
}
