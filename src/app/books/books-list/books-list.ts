import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './books-list.html',
  styleUrls: ['./books-list.scss']
})
export class BooksList {
  books = [
    { title: 'Ramayana', language: 'tamil', titleDisplay: 'Ramayana (Tamil)' },
    { title: 'Ramayana', language: 'english', titleDisplay: 'Ramayana (English)' },
    { title: 'Bhagavad Gita', language: 'tamil', titleDisplay: 'Bhagavad Gita (Tamil)' },
    { title: 'Bhagavad Gita', language: 'english', titleDisplay: 'Bhagavad Gita (English)' }
  ];
}
