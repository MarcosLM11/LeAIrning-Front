import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DialogService } from './dialog';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(DialogService);
  });

  it('should start with dialogs closed', () => {
    expect(service.profileDialogVisible()).toBe(false);
    expect(service.profileViewDialogVisible()).toBe(false);
  });

  it('should open and close profile dialog', () => {
    service.openProfileDialog();
    expect(service.profileDialogVisible()).toBe(true);
    service.closeProfileDialog();
    expect(service.profileDialogVisible()).toBe(false);
  });

  it('should open and close profile view dialog', () => {
    service.openProfileViewDialog();
    expect(service.profileViewDialogVisible()).toBe(true);
    service.closeProfileViewDialog();
    expect(service.profileViewDialogVisible()).toBe(false);
  });
});
