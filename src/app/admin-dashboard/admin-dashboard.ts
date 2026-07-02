import { Component, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard {
  uploadType = 'SENTENCE';
  uploadScriptureContext = 'GENERAL';
  selectedFile: File | null = null;
  isUploading = false;
  uploadMessage = '';
  uploadStatus = '';

  feedbackType = 'WORD';
  feedbackScriptureContext = 'GENERAL';
  feedbackEnglish = '';
  feedbackTamil = '';
  isSubmittingFeedback = false;
  feedbackMessage = '';
  feedbackStatus = '';

  pollingInterval: any;
  jobId: string = '';
  totalRows: number = 0;
  processedRows: number = 0;
  isPolling: boolean = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
  ) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadExcel() {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadMessage = 'Uploading file...';
    this.uploadStatus = '';
    this.isPolling = false;
    this.processedRows = 0;
    this.totalRows = 0;

    this.adminService.uploadExcel(this.selectedFile, this.uploadType, this.uploadScriptureContext).subscribe({
      next: (res: any) => {
        this.jobId = res.jobId;
        this.uploadStatus = 'Info';
        this.uploadMessage = 'Ingestion started in the background. Waiting for progress...';
        this.startPolling();
        this.selectedFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadStatus = 'Error';
        let errMsg = 'Failed to upload Excel file.';
        if (typeof err.error === 'string') {
          errMsg = err.error;
        } else if (err.message) {
          errMsg = err.message;
        } else if (err.error && err.error.error) {
          errMsg = err.error.error;
        }
        this.uploadMessage = errMsg;
        this.isUploading = false;
        this.cdr.detectChanges();
      },
    });
  }

  startPolling() {
    this.isPolling = true;
    this.pollingInterval = setInterval(() => {
      this.adminService.getUploadStatus(this.jobId).subscribe({
        next: (status: any) => {
          this.totalRows = status.totalRows;
          this.processedRows = status.processedRows;
          
          if (status.status === 'COMPLETED') {
            this.uploadStatus = 'Success';
            this.uploadMessage = `Successfully ingrained ${this.totalRows} records into the AI model!`;
            this.stopPolling();
          } else if (status.status === 'FAILED') {
            this.uploadStatus = 'Error';
            this.uploadMessage = 'Background ingestion failed: ' + status.errorMessage;
            this.stopPolling();
          } else {
             this.uploadMessage = `Ingesting into Vector DB... Processed ${this.processedRows} / ${this.totalRows} rows.`;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Failed to poll upload status", err);
        }
      });
    }, 1500);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.isPolling = false;
    this.isUploading = false;
  }

  submitFeedback() {
    if (!this.feedbackEnglish || !this.feedbackTamil) return;
    this.isSubmittingFeedback = true;
    this.feedbackMessage = '';

    this.adminService
      .submitFeedback(this.feedbackEnglish, this.feedbackTamil, this.feedbackType, this.feedbackScriptureContext)
      .subscribe({
        next: (res) => {
          this.feedbackStatus = 'Success';
          this.feedbackMessage = res || 'Feedback saved to translation memory.';
          this.isSubmittingFeedback = false;
          this.feedbackEnglish = '';
          this.feedbackTamil = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.feedbackStatus = 'Error';
          let errMsg = 'Failed to submit feedback.';
          if (typeof err.error === 'string') {
            errMsg = err.error;
          } else if (err.message) {
            errMsg = err.message;
          }
          this.feedbackMessage = errMsg;
          this.isSubmittingFeedback = false;
          this.cdr.detectChanges();
        },
      });
  }
}
