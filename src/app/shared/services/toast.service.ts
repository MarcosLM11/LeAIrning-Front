import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageService = inject(MessageService);

  success(detail: string, summary = 'Éxito'): void {
    this.show('success', summary, detail);
  }

  error(detail: string, summary = 'Error'): void {
    this.show('error', summary, detail);
  }

  warning(detail: string, summary = 'Advertencia'): void {
    this.show('warn', summary, detail);
  }

  info(detail: string, summary = 'Info'): void {
    this.show('info', summary, detail);
  }

  private show(severity: ToastSeverity, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
