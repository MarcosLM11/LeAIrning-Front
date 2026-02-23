import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-language-toggle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './language-toggle.html',
    styleUrl: './language-toggle.scss'
})
export class LanguageToggleComponent {
    translate = inject(TranslateService);

    isSpanish = signal<boolean>(true);

    constructor() {
        // Initialise based on current/default language
        const currentLang = this.translate.currentLang || this.translate.defaultLang || 'es';
        this.isSpanish.set(currentLang === 'es');

        // Make sure we listen for any external language changes if they exist
        this.translate.onLangChange.subscribe((event) => {
            this.isSpanish.set(event.lang === 'es');
        });
    }

    toggleLanguage(): void {
        const newLang = this.isSpanish() ? 'en' : 'es';
        this.translate.use(newLang);
    }
}
