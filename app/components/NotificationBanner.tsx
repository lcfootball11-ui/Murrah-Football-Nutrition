'use client'

import { useState, useEffect } from 'react'
import { Bell, X, BookOpen } from 'lucide-react'

type Notification = {
  id: string
  notification_type: string
  subject: string
  message: string
  read_at: string | null
  created_at: string
}

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    loadNotifications()
    // Poll for new notifications every 60 seconds
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const { data } = await res.json()
      setNotifications(data || [])
      setUnreadCount(data?.filter((n: Notification) => !n.read_at).length || 0)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      })
      await loadNotifications()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await loadNotifications()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read_at)

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Handbook Button */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-handbook'))}
        className="relative mb-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(59,130,246,0.4)' }}
        title="Nutrition Handbook"
      >
        <BookOpen size={20} className="text-blue-300" />
      </button>

      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative mb-4 w-12 h-12 rounded-full btn-blue flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute bottom-16 left-0 w-96 max-h-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-700 px-4 py-3 border-b border-slate-600 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bell size={16} className="text-blue-400" />
              Notifications {unreadCount > 0 && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">{unreadCount}</span>}
            </h3>
            <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="p-4 text-center text-slate-400">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
            )}

            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                  !notif.read_at ? 'bg-blue-500/10' : 'bg-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{notif.subject}</p>
                    <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notif.read_at && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-bold"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-slate-500 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-slate-700/50 px-4 py-2 border-t border-slate-600 text-xs text-slate-400 text-center">
              Showing {notifications.length} notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}
