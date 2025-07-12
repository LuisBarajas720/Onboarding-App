import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent {
  @Input() title: string = 'Dashboard';
}