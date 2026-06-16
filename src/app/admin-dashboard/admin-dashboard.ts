import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard {
  uploadType = 'SENTENCE';
  selectedFile: File | null = null;
  isUploading = false;
  uploadMessage = '';
  uploadStatus = '';

  feedbackType = 'WORD';
  feedbackEnglish = '';
  feedbackTamil = '';
  isSubmittingFeedback = false;
  feedbackMessage = '';
  feedbackStatus = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
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
    this.uploadMessage = '';
    
    this.adminService.uploadExcel(this.selectedFile, this.uploadType).subscribe({
      next: (res) => {
        this.uploadStatus = 'Success';
        this.uploadMessage = res || 'Successfully ingested data into the AI model!';
        this.isUploading = false;
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
        }
        this.uploadMessage = errMsg;
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitFeedback() {
    if (!this.feedbackEnglish || !this.feedbackTamil) return;
    this.isSubmittingFeedback = true;
    this.feedbackMessage = '';

    this.adminService.submitFeedback(this.feedbackEnglish, this.feedbackTamil, this.feedbackType).subscribe({
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
      }
    });
  }
}
