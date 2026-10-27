import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAccessToken, googleSignIn } from '../firebase';

interface CalendarEventItem {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
}

interface CalendarSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModuleTitle: string;
  nextReviewTopic?: string;
  nextReviewDays?: number;
}

export const CalendarSchedulerModal: React.FC<CalendarSchedulerModalProps> = ({
  isOpen,
  onClose,
  currentModuleTitle,
  nextReviewTopic,
  nextReviewDays = 1,
}) => {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form state for scheduling 2-hour block
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [studyDate, setStudyDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState('18:00');
  const [sessionType, setSessionType] = useState<'daily-2h' | 'spaced-review'>('daily-2h');

  // Confirmation modal state for mutating operations (mandatory per workspace-integration)
  const [pendingAction, setPendingAction] = useState<{
    type: 'create' | 'delete';
    description: string;
    execute: () => Promise<void>;
  } | null>(null);

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const timeMin = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
          timeMin
        )}&maxResults=8&singleEvents=true&orderBy=startTime&q=CS50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEvents(data.items || []);
      setNeedsAuth(false);
    } catch (err) {
      console.error('Error loading calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUpcomingEvents();
    }
  }, [isOpen]);

  const handleConnectGoogleCalendar = async () => {
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setNeedsAuth(false);
        fetchUpcomingEvents();
      }
    } catch (err) {
      console.error('Calendar login failed:', err);
    }
  };

  const requestCreateStudyEvent = () => {
    const startIso = new Date(`${studyDate}T${startTime}:00`);
    const durationMinutes = sessionType === 'daily-2h' ? 120 : 45;
    const endIso = new Date(startIso.getTime() + durationMinutes * 60000);

    const summary =
      sessionType === 'daily-2h'
        ? `CS50 Maestro Tutor — Rutina 2h: ${currentModuleTitle}`
        : `CS50 Repaso Espaciado (${nextReviewDays}d): ${nextReviewTopic || currentModuleTitle}`;

    const description =
      sessionType === 'daily-2h'
        ? `Rutina diaria CS50 de 2 horas:\n• 10 min: Recuperación activa sin apuntes\n• 20 min: Concepto nuevo y vídeo oficial\n• 40 min: Práctica guiada\n• 35 min: Reto práctico de código\n• 15 min: Explicación Feynman y registro Markdown`
        : `Sesión de Repetición Espaciada (Intervalo: ${nextReviewDays} días) para consolidar dominio (Nivel 4) sin depender de la IA.`;

    setPendingAction({
      type: 'create',
      description: `¿Confirmas crear el evento "${summary}" en tu Google Calendar para el ${studyDate} a las ${startTime} (${durationMinutes} min)?`,
      execute: async () => {
        const token = await getAccessToken();
        if (!token) {
          setNeedsAuth(true);
          return;
        }
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              summary,
              description,
              start: { dateTime: startIso.toISOString() },
              end: { dateTime: endIso.toISOString() },
            }),
          }
        );
        if (res.ok) {
          setStatusMessage('Sesión agendada correctamente en tu Google Calendar.');
          fetchUpcomingEvents();
        } else {
          setStatusMessage('No se pudo crear el evento. Verifica tus permisos de Google Calendar.');
        }
      },
    });
  };

  const requestDeleteEvent = (ev: CalendarEventItem) => {
    setPendingAction({
      type: 'delete',
      description: `¿Estás seguro de eliminar el evento "${ev.summary}" de tu Google Calendar? Esta acción no se puede deshacer.`,
      execute: async () => {
        const token = await getAccessToken();
        if (!token) {
          setNeedsAuth(true);
          return;
        }
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
            ev.id
          )}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok || res.status === 204) {
          setStatusMessage('Evento eliminado de tu Google Calendar.');
          fetchUpcomingEvents();
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Planificador Google Calendar · Rutina 2h y Repasos Espaciados
              </h3>
              <p className="text-xs text-slate-400">
                Sincroniza tus sesiones diarias de 120 minutos y tus intervalos de memoria (1d, 3d, 7d, 14d)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mandatory Confirmation Dialog for Mutating Calendar Actions */}
        {pendingAction && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-950/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-200">
                  Confirmación requerida para modificar Google Calendar
                </h4>
                <p className="mt-1 text-xs text-slate-200">{pendingAction.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const act = pendingAction;
                      setPendingAction(null);
                      await act.execute();
                    }}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setPendingAction(null)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {needsAuth ? (
          <div className="my-6 rounded-lg border border-slate-800 bg-slate-950/60 p-6 text-center">
            <p className="text-sm text-slate-200 mb-4">
              Inicia sesión con tu cuenta de Google para ver y agendar tus bloques de estudio de CS50 en Google Calendar.
            </p>
            <button
              onClick={handleConnectGoogleCalendar}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">
                Programar Nuevo Bloque de Estudio
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tipo de sesión</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as 'daily-2h' | 'spaced-review')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="daily-2h">Rutina Diaria CS50 (120 min: 10+20+40+35+15)</option>
                    <option value="spaced-review">Repaso Espaciado SRS (45 min · Intervalo {nextReviewDays}d)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={studyDate}
                      onChange={(e) => setStudyDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hora de inicio</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
                <button
                  onClick={requestCreateStudyEvent}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agendar en Google Calendar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200">
                  Próximas Sesiones CS50
                </h4>
                <button
                  onClick={fetchUpcomingEvents}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Actualizar
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400 py-4">Consultando Google Calendar...</p>
              ) : events.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 border border-slate-800 rounded-lg p-3 bg-slate-950/40">
                  No hay sesiones de CS50 agendadas próximamente. Programa tu bloque diario de 2 horas a la izquierda.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 truncate">{ev.summary}</p>
                        <p className="text-slate-400 font-mono text-[11px] tabular-nums">
                          {ev.start?.dateTime
                            ? new Date(ev.start.dateTime).toLocaleString('es-ES', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : ev.start?.date}
                        </p>
                      </div>
                      <button
                        onClick={() => requestDeleteEvent(ev)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors shrink-0"
                        title="Eliminar evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
