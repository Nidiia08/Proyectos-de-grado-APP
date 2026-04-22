import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComiteRoutingModule } from './comite-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AdministracionComponent } from './administracion/administracion.component';

@NgModule({
  imports: [CommonModule, ComiteRoutingModule, DashboardComponent, ProyectosComponent, PlantillasComponent, NotificacionesComponent, ReportesComponent, AdministracionComponent],
})
export class ComiteModule {}
