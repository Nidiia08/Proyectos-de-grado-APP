import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsesorRoutingModule } from './asesor-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { RevisionesComponent } from './revisiones/revisiones.component';

@NgModule({
  imports: [
    CommonModule,
    AsesorRoutingModule,
    DashboardComponent,
    PlantillasComponent,
    NotificacionesComponent,
    ProyectosComponent,
    RevisionesComponent,
  ],
})
export class AsesorModule {}
