import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ProfileViewDialog } from './profile-view-dialog';
import { AuthService } from '../../../core/services/auth';
import { DialogService } from '../../services/dialog';

describe('ProfileViewDialog', () => {
  let mockAuthService: { currentUser: ReturnType<typeof signal> };
  let mockDialogService: {
    profileViewDialogVisible: ReturnType<typeof signal<boolean>>;
    closeProfileViewDialog: ReturnType<typeof vi.fn>;
    openProfileDialog: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAuthService = {
      currentUser: signal({ id: '1', name: 'Test User', email: 'test@test.com' }),
    };
    mockDialogService = {
      profileViewDialogVisible: signal(false),
      closeProfileViewDialog: vi.fn(),
      openProfileDialog: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: DialogService, useValue: mockDialogService },
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(ProfileViewDialog);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should get user initials', () => {
    expect(create().componentInstance.getUserInitials()).toBe('T');
  });

  it('should return ? when no user', () => {
    mockAuthService.currentUser.set(null);
    expect(create().componentInstance.getUserInitials()).toBe('?');
  });

  it('should close dialog', () => {
    create().componentInstance.closeDialog();
    expect(mockDialogService.closeProfileViewDialog).toHaveBeenCalled();
  });

  it('should open edit dialog and close view dialog', () => {
    create().componentInstance.openEditDialog();
    expect(mockDialogService.closeProfileViewDialog).toHaveBeenCalled();
    expect(mockDialogService.openProfileDialog).toHaveBeenCalled();
  });
});
