import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgregarEmpleadoComponent } from './components/agregar-empleado/agregar-empleado.component';
import { SalariosComponent } from './components/salarios/salarios.component';
import { ListaEmpleadosComponent } from './components/lista-empleados/lista-empleados.component';
import { DepartamentoComponent } from './components/departamento/departamento.component';
import { TipoplanillaComponent } from './components/tipoplanilla/tipoplanilla.component';
import { NominaComponent } from './components/nomina/nomina.component';
import { EventosComponent } from './components/eventos/eventos.component';
import { DarBajaComponent } from './components/dar-baja/dar-baja.component';
import { ListaEmpleadoInactivoComponent } from './components/lista-empleado-inactivo/lista-empleado-inactivo.component';
import { HomeComponent } from './components/home/home.component';
import { InformacionComponent } from './components/informacion/informacion.component';
import { LoginComponent } from 'src/app/account/login.component';
import { HistorialComponent } from './components/historial/historial.component';
import { CanDeactivateGuard } from './can-deactivate.guard';
import { AuthGuard } from './_helpers';
import { Role } from 'src/app/_models/role';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { CargaMasivaComponent } from './components/carga-masiva/carga-masiva.component';

const accountModule = () => import('./account/account.module').then((x) => x.AccountModule);
const usersModule = () => import('./users/users.module').then((x) => x.UsersModule);
const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'users',
    loadChildren: usersModule,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  {
    path: 'account',
    loadChildren: accountModule,
    data: { roles: [Role.Admin] },
  },
  {
    path: 'salarios',
    component: SalariosComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.User] },
  },
  {
    path: 'calculo',
    component: NominaComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.User] },
  },
  // {
  //   path: 'rolesagregar',
  //   component: AgregarRolesComponent,
  //   canActivate: [AuthGuard],
  //   data: { roles: [Role.Admin] },
  // },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  {
    path: 'info',
    component: InformacionComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.User, Role.Digitador] },
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.User, Role.Digitador] },
  },
  {
    path: 'agregar',
    component: AgregarEmpleadoComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'entrada',
    component: CargaMasivaComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'historial',
    component: HistorialComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.User] },
  },
  {
    path: 'rebajar',
    component: DarBajaComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'editar/:id',
    component: AgregarEmpleadoComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'editarbaja/:id',
    component: DarBajaComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'tplanilla',
    component: TipoplanillaComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'departamento',
    component: DepartamentoComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'eventos',
    component: EventosComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.User] },
  },
  {
    path: 'listado',
    component: ListaEmpleadosComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  {
    path: 'inactivos',
    component: ListaEmpleadoInactivoComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Digitador] },
  },
  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
