import { NextRequest, NextResponse } from 'next/server'
import { holidayDB } from '@/lib/db'

const SG_HOLIDAYS = [
  // 2024
  { name: "New Year's Day", date: '2024-01-01', year: 2024 },
  { name: 'Chinese New Year', date: '2024-02-10', year: 2024 },
  { name: 'Chinese New Year', date: '2024-02-11', year: 2024 },
  { name: 'Good Friday', date: '2024-03-29', year: 2024 },
  { name: 'Hari Raya Puasa', date: '2024-04-10', year: 2024 },
  { name: 'Labour Day', date: '2024-05-01', year: 2024 },
  { name: 'Vesak Day', date: '2024-05-22', year: 2024 },
  { name: 'Hari Raya Haji', date: '2024-06-17', year: 2024 },
  { name: 'National Day', date: '2024-08-09', year: 2024 },
  { name: 'Deepavali', date: '2024-10-31', year: 2024 },
  { name: 'Christmas Day', date: '2024-12-25', year: 2024 },
  // 2025
  { name: "New Year's Day", date: '2025-01-01', year: 2025 },
  { name: 'Chinese New Year', date: '2025-01-29', year: 2025 },
  { name: 'Chinese New Year', date: '2025-01-30', year: 2025 },
  { name: 'Hari Raya Puasa', date: '2025-03-31', year: 2025 },
  { name: 'Good Friday', date: '2025-04-18', year: 2025 },
  { name: 'Labour Day', date: '2025-05-01', year: 2025 },
  { name: 'Vesak Day', date: '2025-05-12', year: 2025 },
  { name: 'Hari Raya Haji', date: '2025-06-07', year: 2025 },
  { name: 'National Day', date: '2025-08-09', year: 2025 },
  { name: 'Deepavali', date: '2025-10-20', year: 2025 },
  { name: 'Christmas Day', date: '2025-12-25', year: 2025 },
  // 2026
  { name: "New Year's Day", date: '2026-01-01', year: 2026 },
  { name: 'Chinese New Year', date: '2026-02-17', year: 2026 },
  { name: 'Chinese New Year', date: '2026-02-18', year: 2026 },
  { name: 'Hari Raya Puasa', date: '2026-03-20', year: 2026 },
  { name: 'Good Friday', date: '2026-04-03', year: 2026 },
  { name: 'Labour Day', date: '2026-05-01', year: 2026 },
  { name: 'Vesak Day', date: '2026-05-31', year: 2026 },
  { name: 'Hari Raya Haji', date: '2026-05-27', year: 2026 },
  { name: 'National Day', date: '2026-08-10', year: 2026 },
  { name: 'Deepavali', date: '2026-11-08', year: 2026 },
  { name: 'Christmas Day', date: '2026-12-25', year: 2026 },
]

// Seed once
if (holidayDB.count() === 0) {
  holidayDB.seed(SG_HOLIDAYS)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const yearParam = searchParams.get('year')
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

  const holidays = holidayDB.findByYear(year)
  return NextResponse.json(holidays)
}
