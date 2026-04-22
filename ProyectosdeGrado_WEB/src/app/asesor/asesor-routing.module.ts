import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { RevisionesComponent } from './revisiones/revisiones.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'plantillas', component: PlantillasComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'revisiones', component: RevisionesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsesorRoutingModule {}
