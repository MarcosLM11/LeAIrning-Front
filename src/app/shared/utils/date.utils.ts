/**
 * Date utilities for formatting and relative time calculations.
 * Centralizes date-related logic used across the application.
 */

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Ahora mismo';
  }
  if (diffMins < 60) {
    return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
