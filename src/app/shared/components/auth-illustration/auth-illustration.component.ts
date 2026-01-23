import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-illustration',
  standalone: true,
  template: `
    <div class="illustration-container">
      @if (type === 'login') {
        <svg class="auth-illustration" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Background circles -->
          <circle cx="200" cy="150" r="120" fill="url(#gradient1)" opacity="0.1"/>
          <circle cx="280" cy="100" r="60" fill="url(#gradient2)" opacity="0.15"/>
          
          <!-- Brain with AI circuits -->
          <g class="brain-group">
            <path d="M150 120 Q 180 90, 220 90 Q 260 90, 280 120 Q 290 140, 290 160 Q 290 180, 280 200 Q 260 230, 220 230 Q 180 230, 150 200 Q 140 180, 140 160 Q 140 140, 150 120 Z" 
                  fill="url(#gradient3)" opacity="0.8"/>
            
            <!-- AI circuit lines -->
            <line x1="170" y1="140" x2="200" y2="150" stroke="#4f46e5" stroke-width="2" opacity="0.6" class="circuit-line"/>
            <line x1="200" y1="150" x2="230" y2="140" stroke="#4f46e5" stroke-width="2" opacity="0.6" class="circuit-line"/>
            <line x1="180" y1="170" x2="215" y2="180" stroke="#6366f1" stroke-width="2" opacity="0.6" class="circuit-line"/>
            
            <!-- Nodes -->
            <circle cx="170" cy="140" r="4" fill="#4f46e5" class="node"/>
            <circle cx="200" cy="150" r="5" fill="#4f46e5" class="node"/>
            <circle cx="230" cy="140" r="4" fill="#4f46e5" class="node"/>
            <circle cx="180" cy="170" r="4" fill="#6366f1" class="node"/>
            <circle cx="215" cy="180" r="4" fill="#6366f1" class="node"/>
          </g>
          
          <!-- Graduation cap -->
          <g class="cap-group">
            <polygon points="200,100 240,115 200,130 160,115" fill="#4f46e5" opacity="0.9"/>
            <rect x="195" y="130" width="10" height="20" fill="#4f46e5" opacity="0.8"/>
            <circle cx="200" cy="150" r="5" fill="#4f46e5"/>
          </g>
          
          <!-- Sparkles -->
          <g class="sparkles">
            <path d="M100,80 L102,85 L107,87 L102,89 L100,94 L98,89 L93,87 L98,85 Z" fill="#fbbf24" opacity="0.8"/>
            <path d="M300,180 L302,185 L307,187 L302,189 L300,194 L298,189 L293,187 L298,185 Z" fill="#fbbf24" opacity="0.8"/>
            <path d="M120,200 L122,203 L125,205 L122,207 L120,210 L118,207 L115,205 L118,203 Z" fill="#f59e0b" opacity="0.6"/>
          </g>
          
          <!-- Gradients -->
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#818cf8;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#a5b4fc;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#818cf8;stop-opacity:0.3" />
            </linearGradient>
          </defs>
        </svg>
      } @else {
        <svg class="auth-illustration" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Background shapes -->
          <circle cx="200" cy="150" r="100" fill="url(#regGradient1)" opacity="0.1"/>
          <circle cx="120" cy="100" r="50" fill="url(#regGradient2)" opacity="0.15"/>
          
          <!-- Book with AI element -->
          <g class="book-group">
            <rect x="140" y="130" width="120" height="90" rx="5" fill="#4f46e5" opacity="0.2"/>
            <rect x="145" y="135" width="110" height="80" rx="3" fill="white" opacity="0.9"/>
            
            <!-- Pages -->
            <line x1="200" y1="145" x2="200" y2="205" stroke="#e5e7eb" stroke-width="2"/>
            <line x1="160" y1="160" x2="190" y2="160" stroke="#d1d5db" stroke-width="1.5"/>
            <line x1="160" y1="175" x2="190" y2="175" stroke="#d1d5db" stroke-width="1.5"/>
            <line x1="160" y1="190" x2="190" y2="190" stroke="#d1d5db" stroke-width="1.5"/>
            
            <!-- AI symbol on right page -->
            <circle cx="225" cy="170" r="20" fill="url(#regGradient3)" opacity="0.8"/>
            <text x="218" y="178" font-family="Arial" font-size="20" font-weight="bold" fill="white">AI</text>
          </g>
          
          <!-- Floating elements -->
          <g class="floating-elements">
            <circle cx="290" cy="120" r="15" fill="#4f46e5" opacity="0.3" class="float-1"/>
            <rect x="100" y="200" width="25" height="25" rx="5" fill="#6366f1" opacity="0.3" class="float-2"/>
            <polygon points="320,190 330,210 310,210" fill="#818cf8" opacity="0.3" class="float-3"/>
          </g>
          
          <!-- Stars -->
          <g class="stars">
            <path d="M80,100 L82,105 L87,107 L82,109 L80,114 L78,109 L73,107 L78,105 Z" fill="#fbbf24" opacity="0.8"/>
            <path d="M310,220 L312,223 L315,225 L312,227 L310,230 L308,227 L305,225 L308,223 Z" fill="#f59e0b" opacity="0.6"/>
          </g>
          
          <!-- Gradients -->
          <defs>
            <linearGradient id="regGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#a5b4fc;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="regGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4338ca;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="regGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#818cf8;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      }
    </div>
  `,
  styles: [`
    .illustration-container {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .auth-illustration {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 10px 30px rgba(79, 70, 229, 0.2));
    }

    .node {
      animation: pulse 2s ease-in-out infinite;
    }

    .circuit-line {
      stroke-dasharray: 5, 5;
      animation: dash 1s linear infinite;
    }

    .sparkles path:nth-child(1) {
      animation: twinkle 3s ease-in-out infinite;
    }

    .sparkles path:nth-child(2) {
      animation: twinkle 3s ease-in-out infinite 1s;
    }

    .sparkles path:nth-child(3) {
      animation: twinkle 3s ease-in-out infinite 2s;
    }

    .brain-group {
      animation: float 6s ease-in-out infinite;
    }

    .cap-group {
      animation: float 5s ease-in-out infinite 0.5s;
    }

    .book-group {
      animation: float 6s ease-in-out infinite;
    }

    .float-1 {
      animation: float 4s ease-in-out infinite;
    }

    .float-2 {
      animation: float 5s ease-in-out infinite 1s;
    }

    .float-3 {
      animation: float 4.5s ease-in-out infinite 2s;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        r: 4;
      }
      50% {
        opacity: 0.6;
        r: 6;
      }
    }

    @keyframes dash {
      to {
        stroke-dashoffset: -10;
      }
    }

    @keyframes twinkle {
      0%, 100% {
        opacity: 0.8;
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(0.8);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-15px);
      }
    }
  `]
})
export class AuthIllustrationComponent {
  @Input() type: 'login' | 'register' = 'login';
}
