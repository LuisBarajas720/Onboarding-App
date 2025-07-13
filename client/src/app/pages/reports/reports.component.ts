import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { AlertService, AlertResponse } from '../../services/alert.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  
  alertsResult: AlertResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private alertService: AlertService) {}

  checkAlerts(): void {
    this.loading = true;
    this.error = null;

    this.alertService.checkAndSendAlerts().subscribe({
      next: (response) => {
        this.alertsResult = response;
        this.loading = false;
        console.log('Alertas verificadas:', response);
      },
      error: (error) => {
        this.error = 'Error al verificar alertas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }
}