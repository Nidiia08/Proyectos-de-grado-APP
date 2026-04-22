import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JuradoRoutingModule } from './jurado-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { RevisionesComponent } from './revisiones/revisiones.component';

@NgModule({
  imports: [
    CommonModule,
    JuradoRoutingModule,
    DashboardComponent,
    ProyectosComponent,
    PlantillasComponent,
    NotificacionesComponent,
    RevisionesComponent,
  ],
})
export class JuradoModule {}
