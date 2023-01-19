import { Component, OnInit } from '@angular/core';
import { Evento } from 'src/app/models/evento';
import { EventosService } from 'src/app/services/eventos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { getISOWeek } from 'date-fns';
import { EmpleadoinactivoService } from 'src/app/services/empleadoinactivo.service';
import {
  EventClickArg,
  DateSelectArg,
  EventApi,
  CalendarApi,
  Calendar,
} from '@fullcalendar/angular';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css'],
})
export class EventosComponent implements OnInit {
  EventoForm: FormGroup;
  idEvento = 0;
  accion = 'Agregar';
  isVisible = false;
  loading = false;
  listEmpleados = null;
  listEventos = null;
  listTemporal = null;
  eventos: string;
  pageSize = 5;
  date1: string;
  date2: string;
  calendarApi: CalendarApi;
  selectedColor = null;
  currentEvents: EventApi[] = [];
  //propiedades de calendario
  calendarVisible = true;
  themeSystem: 'materia';
  DEBUG = false;

  constructor(
    private modal: NzModalService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private EventosService: EventosService,
    private EmpleadoinactivoService: EmpleadoinactivoService
  ) {
    this.EventoForm = this.fb.group({
      comentario: ['', Validators.required],
      tipo: ['', Validators.required],
      // fecha: ['', Validators.required],
      colaborador: ['', Validators.required],
    });
    if (+this.route.snapshot.paramMap.get('id') > 0) {
      this.idEvento = +this.route.snapshot.paramMap.get('id');
    }
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarEmpleado();
    this.cargarEventos();
  }
  cargarEmpleado() {
    this.loading = true;
    this.EmpleadoinactivoService.getListEmpleadosActivos().subscribe((data) => {
      this.loading = false;
      this.listEmpleados = data;
    });
  }
  cargarEventos() {
    this.loading = true;
    this.EventosService.getEventos().subscribe((data) => {
      this.loading = false;
      this.listEventos = data;
      console.log(this.listEventos);
      this.draw(
        this.listEventos.map((obj) => {
          return {
            id: obj.id,
            title: obj.nombres,
            start: obj.fechaInicio,
            end: obj.fechaFinal,
            color: obj.color,
            allDay: true,
            textColor: 'black',
            displayEventTime: true,
          };
        })
      );
    });
  }
  guardar() {
    var strToDate1 = new Date(this.date1);
    var strToDate2 = new Date(this.date2);
    var strToDate3 = this.EventoForm.get('tipo').value;
    console.log(strToDate1, strToDate2, strToDate3);
    if (this.accion == 'Agregar') {
      if (strToDate3 == 'Vacacion') {
        const evento: Evento = {
          nombres: null,
          apellidos: null,
          tipo: this.EventoForm.get('tipo').value,
          fechaInicio: strToDate1,
          fechaFinal: strToDate2,
          color: '#52c41a',
          comentario: this.EventoForm.get('comentario').value,
          empleadosID: parseInt(this.EventoForm.get('colaborador').value),
        };
        this.EventosService.guardarEventos(evento).subscribe((data) => {
          this.cargarEventos();
        });
      } else if (strToDate3 == 'Incapacidad') {
        const evento: Evento = {
          nombres: null,
          apellidos: null,
          tipo: this.EventoForm.get('tipo').value,
          fechaInicio: strToDate1,
          fechaFinal: strToDate2,
          color: '#FFF100',
          comentario: this.EventoForm.get('comentario').value,
          empleadosID: parseInt(this.EventoForm.get('colaborador').value),
        };
        this.EventosService.guardarEventos(evento).subscribe((data) => {
          this.cargarEventos();
        });
      } else if (strToDate3 == 'Falta') {
        const evento: Evento = {
          nombres: null,
          apellidos: null,
          tipo: this.EventoForm.get('tipo').value,
          fechaInicio: strToDate1,
          fechaFinal: strToDate2,
          color: '#EE1224',
          comentario: this.EventoForm.get('comentario').value,
          empleadosID: parseInt(this.EventoForm.get('colaborador').value),
        };
        this.EventosService.guardarEventos(evento).subscribe((data) => {
          this.cargarEventos();
        });
      }
    }
    this.handleOk();
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listEventos;
    }
    if (value != '' && value != undefined && value != null) {
      this.listEventos = this.listTemporal.filter((res) => {
        return (
          res.nombres.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.apellidos.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.tipo.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
      this.draw(
        this.listEventos.map((obj) => {
          return {
            id: obj.id,
            title: obj.nombres,
            start: obj.fechaInicio,
            end: obj.fechaFinal,
            color: obj.color,
            textColor: 'black',
            allDay: true,
            displayEventTime: true,
          };
        })
      );
    } else {
      this.listEventos = this.listTemporal;
      this.listTemporal = null;
      return this.listEventos;
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: '¿Está que desea eliminar este evento?',
      nzContent: '<b style="color: red;">Esta acción es permanente.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.delete(id);
        window.location.reload();
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }
  delete(id: number) {
    this.loading = true;
    this.EventosService.deleteEventos(id).subscribe((data) => {
      this.cargarEventos();
      this.loading = false;
    });
  }
  clear() {
    this.EventoForm.reset();
    for (const key in this.EventoForm.controls) {
      this.EventoForm.controls[key].markAsPristine();
      this.EventoForm.controls[key].updateValueAndValidity();
    }
  }
  //datepicker range
  dateFormat = 'dd/MM/yyyy';
  monthFormat = 'MM/yyyy';

  onChange(result: Date[]): void {
    console.log('onChange: ', result);
  }
  getWeek(result: Date[]): void {
    console.log('week: ', result.map(getISOWeek));
  }
  log(value: { label: string; value: string; age: number }): void {
    console.log(value);
  }
  //modal
  showModal() {
    this.clear();
    this.isVisible = true;
  }
  handleOk() {
    this.isVisible = false;
    this.clear();
  }
  handleCancel() {
    this.isVisible = false;
    this.clear();
  }
  draw(data) {
    var calendarEl = document.getElementById('calendar');
    var calendar = new Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      displayEventEnd: true,
      eventTimeFormat: {
        // formato '14:30'
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: true,
        meridiem: 'narrow',
      },
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      events: data,
    });
    calendar.render();
  }
  handleDateSelect(selectInfo: DateSelectArg) {
    this.calendarApi = selectInfo.view.calendar;
    this.calendarApi.unselect(); // clear date selection
    this.showModal();
    this.date1 = selectInfo.startStr;
    this.date2 = selectInfo.endStr;
  }
  handleEventClick(clickInfo: EventClickArg) {
    this.showDeleteConfirm(clickInfo.event.id);
  }
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
}
