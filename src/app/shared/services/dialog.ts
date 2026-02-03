import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  // Signal para controlar la visibilidad del dialog de perfil
  profileDialogVisible = signal(false);

  openProfileDialog(): void {
    this.profileDialogVisible.set(true);
  }

  closeProfileDialog(): void {
    this.profileDialogVisible.set(false);
  }
}
