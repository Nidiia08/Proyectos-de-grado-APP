import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ComiteService, ParametrosGenerales, PlazosDefecto } from '../comite.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';

@Component({
  selector: 'app-comite-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss',
})
export class AdministracionComponent {
  readonly comite = inject(ComiteService);
  private readonly dialog = inject(MatDialog);
  readonly searchUser = signal('');
  readonly roleFilter = signal('todos');
  readonly statusFilter = signal('todos');
  readonly users = computed(() => {
    const term = this.searchUser().trim().toLowerCase();
    return this.comite.usuarios().filter((user) => {
      const role = this.roleFilter() === 'todos' || user.rol === this.roleFilter();
      const status = this.statusFilter() === 'todos' || user.estado === this.statusFilter();
      const search = !term || user.nombre.toLowerCase().includes(term) || user.correo.toLowerCase().includes(term);
      return role && status && search;
    });
  });
  deadlines: PlazosDefecto = structuredClone(this.comite.plazosDefecto());
  params: ParametrosGenerales = structuredClone(this.comite.parametrosGenerales());
  newUser = { nombre: '', correo: '', rol: 'Estudiante', contrasena: '' };
  newPeriod = { nombre: '', inicio: '', fin: '' };

  generateRandomPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newUser.contrasena = password;
  }
  createUser(): void {
    if (!this.newUser.nombre || !this.newUser.correo || !this.newUser.contrasena) return;
    this.comite.createUser(this.newUser);
    this.newUser = { nombre: '', correo: '', rol: 'Estudiante', contrasena: '' };
  }
  toggleUser(id: number): void { this.comite.toggleUserStatus(id); }
  saveDeadlines(): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Guardar plazos por defecto', message: 'Se actualizarán los plazos estándar del reglamento.', confirmText: 'Guardar' } }).afterClosed().subscribe((r) => {
      if (r?.confirmed) this.comite.saveDefaultDeadlines(this.deadlines);
    });
  }
  saveParams(): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Guardar parámetros generales', message: 'Se guardarán los parámetros institucionales del sistema.', confirmText: 'Guardar' } }).afterClosed().subscribe((r) => {
      if (r?.confirmed) this.comite.saveGeneralParameters(this.params);
    });
  }
  createPeriod(): void { if (this.newPeriod.nombre && this.newPeriod.inicio && this.newPeriod.fin) this.comite.createPeriod(this.newPeriod); }
  closePeriod(id: number): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Cerrar periodo académico', message: 'Esta acción archivará el periodo seleccionado.', confirmText: 'Cerrar' } }).afterClosed().subscribe((r) => {
      if (r?.confirmed) this.comite.closePeriod(id);
    });
  }
}
