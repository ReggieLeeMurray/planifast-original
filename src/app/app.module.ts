import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
//componentes
import { AppComponent } from './app.component';
import { AgregarEmpleadoComponent } from './components/agregar-empleado/agregar-empleado.component';
import { AgregarRolesComponent } from './components/agregar-roles/agregar-roles.component';
import { ListaEmpleadosComponent } from './components/lista-empleados/lista-empleados.component';
import { ListaUsuariosComponent } from './components/lista-usuarios/lista-usuarios.component';
import { HistorialComponent } from './components/historial/historial.component';
import { NominaComponent } from './components/nomina/nomina.component';
import { DepartamentoComponent } from './components/departamento/departamento.component';
import { TipoplanillaComponent } from './components/tipoplanilla/tipoplanilla.component';
import { EventosComponent } from './components/eventos/eventos.component';
import { DarBajaComponent } from './components/dar-baja/dar-baja.component';
import { ListaEmpleadoInactivoComponent } from './components/lista-empleado-inactivo/lista-empleado-inactivo.component';
import { HomeComponent } from './components/home/home.component';
import { InformacionComponent } from './components/informacion/informacion.component';
import { CargaMasivaComponent } from './components/carga-masiva/carga-masiva.component';
//ng zorro - boostrap imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { es_ES } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatePipe } from 'src/app/pipes/paginate.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageModule } from 'ng-zorro-antd/message';
//login
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { AlertComponent } from './_components';
//charts
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
//fullcalendar
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
]);
registerLocaleData(es);

@NgModule({
  declarations: [
    AppComponent,
    AgregarEmpleadoComponent,
    ListaEmpleadosComponent,
    ListaUsuariosComponent,
    DepartamentoComponent,
    CargaMasivaComponent,
    NominaComponent,
    PaginatePipe,
    TipoplanillaComponent,
    AgregarRolesComponent,
    EventosComponent,
    DarBajaComponent,
    ListaEmpleadoInactivoComponent,
    HomeComponent,
    InformacionComponent,
    HistorialComponent,
    AlertComponent,
  ],
  imports: [
    BrowserModule,
    NzPopconfirmModule,
    NzUploadModule,
    AppRoutingModule,
    NzCalendarModule,
    ReactiveFormsModule,
    NzResultModule,
    NzSwitchModule,
    HttpClientModule,
    FormsModule,
    NzListModule,
    NzEmptyModule,
    NzRadioModule,
    NzImageModule,
    NzSpinModule,
    FullCalendarModule,
    NzAlertModule,
    NzBackTopModule,
    NzCheckboxModule,
    NzTimePickerModule,
    NzCollapseModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NzDropDownModule,
    NzStepsModule,
    NzDatePickerModule,
    NzLayoutModule,
    NzMenuModule,
    NzPopoverModule,
    NzFormModule,
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzModalModule,
    NzIconModule,
    NzMessageModule,
    MatPaginatorModule,
    NgbModule,
    NzProgressModule,
  ],

  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
export class NzDemoLayoutFixedSiderComponent {}
