import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
  AnimationTriggerMetadata,
} from '@angular/animations';

/**
 * Animaciones para transiciones entre rutas
 * Inspiradas en el diseño premium de la aplicación
 */

// Fade transition - Transición suave de opacidad
export const fadeAnimation: AnimationTriggerMetadata = trigger('fadeAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [style({ opacity: 0 })],
      { optional: true }
    ),
    query(
      ':leave',
      [animate('300ms ease-out', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [animate('300ms 150ms ease-out', style({ opacity: 1 }))],
      { optional: true }
    ),
  ]),
]);

// Slide transition - Deslizamiento horizontal
export const slideAnimation: AnimationTriggerMetadata = trigger('slideAnimation', [
  transition('* => *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          width: '100%',
          left: 0,
          top: 0,
        }),
      ],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '400ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateX(-100%)',
              opacity: 0,
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          style({
            transform: 'translateX(100%)',
            opacity: 0,
          }),
          animate(
            '400ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateX(0)',
              opacity: 1,
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

// Scale transition - Escalado elegante
export const scaleAnimation: AnimationTriggerMetadata = trigger('scaleAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({
          opacity: 0,
          transform: 'scale(0.95)',
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        animate(
          '300ms ease-out',
          style({
            opacity: 0,
            transform: 'scale(1.05)',
          })
        ),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        animate(
          '400ms 100ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'scale(1)',
          })
        ),
      ],
      { optional: true }
    ),
  ]),
]);

// Slide up transition - Deslizamiento vertical
export const slideUpAnimation: AnimationTriggerMetadata = trigger('slideUpAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({
          opacity: 0,
          transform: 'translateY(30px)',
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        animate(
          '300ms ease-out',
          style({
            opacity: 0,
            transform: 'translateY(-30px)',
          })
        ),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ],
      { optional: true }
    ),
  ]),
]);

// Fade scale transition - Combinación de fade y scale (recomendada)
export const fadeScaleAnimation: AnimationTriggerMetadata = trigger('fadeScaleAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({
          opacity: 0,
          transform: 'scale(0.96)',
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        animate(
          '250ms ease-out',
          style({
            opacity: 0,
            transform: 'scale(0.96)',
          })
        ),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        animate(
          '400ms 50ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'scale(1)',
          })
        ),
      ],
      { optional: true }
    ),
  ]),
]);

// Helper function para obtener el estado de la ruta
export function getRouteAnimationState(outlet: any): string {
  return outlet?.activatedRouteData?.['animation'] || 'default';
}
