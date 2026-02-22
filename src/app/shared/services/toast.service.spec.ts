import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let messageService: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    messageService = { add: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MessageService, useValue: messageService },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should show success toast', () => {
    service.success('Done');
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'success', summary: 'Éxito', detail: 'Done' });
  });

  it('should show error toast', () => {
    service.error('Failed');
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'error', summary: 'Error', detail: 'Failed' });
  });

  it('should show warning toast', () => {
    service.warning('Careful');
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'warn', summary: 'Advertencia', detail: 'Careful' });
  });

  it('should show info toast', () => {
    service.info('FYI');
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'info', summary: 'Info', detail: 'FYI' });
  });

  it('should use custom summary', () => {
    service.success('Done', 'Custom');
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'success', summary: 'Custom', detail: 'Done' });
  });
});
