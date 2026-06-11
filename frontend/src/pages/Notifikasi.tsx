import React, { useState, useEffect } from 'react'
import api from '../utils/api'

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const Notifikasi = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <div className="w-10 h-10 rounded-full bg-[#fef7e0] text-[#f29900] flex items-center justify-center shrink-0"><span className="material-symbols-outlined">schedule</span></div>;
      case 'error':
        return <div className="w-10 h-10 rounded-full bg-[#fce8e6] text-[#d93025] flex items-center justify-center shrink-0"><span className="material-symbols-outlined">wifi_off</span></div>;
      case 'info':
        return <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0"><span className="material-symbols-outlined">task</span></div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#031634]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e4e2e5] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#031634]">Pusat Notifikasi</h1>
            {unreadCount > 0 && (
              <span className="bg-[#ba1a1a] text-white px-2.5 py-0.5 rounded-full text-sm font-bold shadow-sm">
                {unreadCount} Baru
              </span>
            )}
          </div>
          <p className="text-sm lg:text-base text-[#44474e] mt-1">
            Pemberitahuan sistem, peringatan keterlambatan, dan status perangkat.
          </p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-[#2d5ea2] font-bold text-sm hover:bg-[#e8f0fe] px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">done_all</span>
          Tandai Semua Dibaca
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e4e2e5] overflow-hidden flex flex-col">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-[#c5c6cf] mb-4">notifications_off</span>
            <h3 className="text-lg font-bold text-[#031634]">Tidak Ada Notifikasi</h3>
            <p className="text-[#75777e] mt-1">Semua notifikasi telah dihapus atau Anda sudah membaca semuanya.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e4e2e5]">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:items-start transition-colors group ${notif.isRead ? 'bg-white opacity-70' : 'bg-[#fbf8fc]'}`}
              >
                {renderIcon(notif.type)}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-base font-bold ${notif.isRead ? 'text-[#44474e]' : 'text-[#031634]'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-[#75777e] whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-sm text-[#44474e] mt-1 pr-8 leading-relaxed">
                    {notif.message}
                  </p>
                  
                  {!notif.isRead && (
                    <div className="mt-3 flex gap-3">
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-bold text-[#2d5ea2] hover:text-[#031634] transition-colors"
                      >
                        Tandai sudah dibaca
                      </button>
                      <span className="text-[#c5c6cf]">•</span>
                      <button 
                        className="text-xs font-bold text-[#44474e] hover:text-[#031634] transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Button - Appears on hover on desktop, always visible on mobile */}
                <button 
                  onClick={() => deleteNotification(notif.id)}
                  className="sm:opacity-0 group-hover:opacity-100 p-2 text-[#75777e] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-full transition-all self-end sm:self-center focus:opacity-100"
                  aria-label="Hapus notifikasi"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifikasi