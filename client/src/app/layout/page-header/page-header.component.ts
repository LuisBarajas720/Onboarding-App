import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../services/auth.service';

@Component({
 selector: 'app-page-header',
 standalone: true,
 imports: [CommonModule, BreadcrumbComponent],
 templateUrl: './page-header.component.html',
 styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit {
 @Input() title: string = 'Dashboard';
 currentUser: string = '';

 constructor(private authService: AuthService) {}

 ngOnInit() {
   // Suscribirse al usuario actual
   this.authService.currentUser$.subscribe(username => {
     this.currentUser = username || 'Usuario';
   });
 }
}