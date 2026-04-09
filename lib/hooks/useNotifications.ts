'use client'

import { useState, useEffect, useCallback } from 'react'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-SG', {
    timeZone: 'Asia/Singapore',
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

interface DueTodo {
  id: number
  title: string
  due_date: string
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setPermission(perm)
  }, [])

  const checkNotifications = useCallback(async () => {
    if (permission !== 'granted') return
    try {
      const res = await fetch('/api/notifications/check')
      if (!res.ok) return
      const due: DueTodo[] = await res.json()
      for (const item of due) {
        new Notification('Todo Reminder', {
          body: `"${item.title}" is due at ${formatDate(item.due_date)}`
        })
      }
    } catch {
      // Notifications are best-effort; ignore errors
    }
  }, [permission])

  useEffect(() => {
    if (permission !== 'granted') return
    const interval = setInterval(checkNotifications, 30_000)
    checkNotifications()
    return () => clearInterval(interval)
  }, [permission, checkNotifications])

  return { permission, requestPermission }
}
