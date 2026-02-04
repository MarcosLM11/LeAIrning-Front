export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileUpload {
  file: File;
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
}

export const UPLOAD_STATUS_ICONS: Record<UploadStatus, string> = {
  pending: 'pi-clock',
  uploading: 'pi-spin pi-spinner',
  success: 'pi-check-circle',
  error: 'pi-times-circle',
};

export const UPLOAD_STATUS_CLASSES: Record<UploadStatus, string> = {
  pending: 'status-pending',
  uploading: 'status-uploading',
  success: 'status-success',
  error: 'status-error',
};
