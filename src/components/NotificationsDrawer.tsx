import React from 'react';
import { Bell, X, CheckCheck, ExternalLink, Calendar, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onSelectLink: (linkUrl?: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
  onSelectLink,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-serif">Scheme Alerts</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Mark Read
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">No active alerts.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkRead(n.id);
                  onSelectLink(n.linkUrl);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    {n.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">{n.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
