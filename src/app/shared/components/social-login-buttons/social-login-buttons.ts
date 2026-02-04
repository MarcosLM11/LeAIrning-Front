import {
  Component,
  input,
  output,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-social-login-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-login-buttons.html',
  styleUrl: './social-login-buttons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLoginButtons {
  // Inputs
  isDisabled = input(false);
  googleText = input('Continuar con Google');
  githubText = input('Continuar con GitHub');

  // Outputs
  googleClick = output<void>();
  githubClick = output<void>();

  onGoogleClick(): void {
    if (!this.isDisabled()) {
      window.location.href = environment.oauth.google;
    }
  }

  onGithubClick(): void {
    if (!this.isDisabled()) {
      window.location.href = environment.oauth.github;
    }
  }
}
