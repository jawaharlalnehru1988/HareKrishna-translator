import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  role: string;
  approved: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagement implements OnInit {
  users: User[] = [];
  apiUrl = `${environment.apiUrl}/v1/admin/users`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Failed to load users', err)
    });
  }

  approveUser(userId: number) {
    this.http.put(`${this.apiUrl}/${userId}/approve`, {}, { responseType: 'text' }).subscribe({
      next: () => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.approved = true;
        }
      },
      error: (err) => console.error('Failed to approve user', err)
    });
  }
}
