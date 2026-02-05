import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../../core/services/auth';
import { DialogService } from '../../services/dialog';

@Component({
  selector: 'app-profile-view-dialog',
  imports: [DialogModule],
  templateUrl: './profile-view-dialog.html',
  styleUrl: './profile-view-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileViewDialog {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  // Visibility from service
  visible = this.dialogService.profileViewDialogVisible;

  // Current user data
  currentUser = this.authService.currentUser;

  closeDialog(): void {
    this.dialogService.closeProfileViewDialog();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return user.name.charAt(0).toUpperCase();
  }

  openEditDialog(): void {
    this.dialogService.closeProfileViewDialog();
    this.dialogService.openProfileDialog();
  }
}
