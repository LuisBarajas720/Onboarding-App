import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  /**
   * Input property para controlar la visibilidad del modal desde un componente padre.
   * @type {boolean}
   */
  @Input() isOpen: boolean = false;

  /**
   * Output property que emite un evento cuando el modal solicita ser cerrado.
   * El componente padre debe escuchar este evento para actualizar su estado.
   */
  @Output() modalClose = new EventEmitter<void>();

  /**
   * Vincula el estilo 'display' del elemento host (<app-modal>) a este getter.
   * Esta es la forma más directa y controlada de mostrar u ocultar el componente.
   * @returns {'flex' | 'none'}
   */
  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.isOpen ? 'flex' : 'none';
  }

  /**
   * Emite el evento para notificar al padre que el modal debe cerrarse.
   */
  close(): void {
    this.modalClose.emit();
  }
}