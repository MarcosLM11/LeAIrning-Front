import {
  trigger,
  transition,
  style,
  animate,
  AnimationTriggerMetadata,
} from '@angular/animations';

export const errorPageAnimations: AnimationTriggerMetadata[] = [
  trigger('cardEntrance', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(40px) scale(0.95)' }),
      animate('600ms cubic-bezier(0.4, 0, 0.2, 1)',
        style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    ])
  ]),

  trigger('illustrationEntrance', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.5)' }),
      animate('700ms 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        style({ opacity: 1, transform: 'scale(1)' }))
    ])
  ]),

  trigger('staggerItem', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms cubic-bezier(0.4, 0, 0.2, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];
