import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  // Signal para controlar la visibilidad del dialog de editar perfil
  profileDialogVisible = signal(false);

  // Signal para controlar la visibilidad del dialog de ver perfil
  profileViewDialogVisible = signal(false);

  openProfileDialog(): void {
    this.profileDialogVisible.set(true);
  }

  closeProfileDialog(): void {
    this.profileDialogVisible.set(false);
  }

  openProfileViewDialog(): void {
    this.profileViewDialogVisible.set(true);
  }

  closeProfileViewDialog(): void {
    this.profileViewDialogVisible.set(false);
  }
}
