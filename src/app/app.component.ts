import { Component } from '@angular/core';
import { AccountService } from './_services';
import { User, Role } from 'src/app/_models';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'PlaniFast';
  isCollapsed = false;
  isInlineCollapsed = false;
  isInformacionOpen = true;
  isDashboardOpen = true;
  isEventosOpen = true;
  isNominasOpen = true;
  isColaboradoresOpen = true;
  isSeguridadOpen = true;
  user: User;

  constructor(private accountService: AccountService) {
    this.accountService.user.subscribe((x) => (this.user = x));
  }
  ngOnInit(): void {}

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  get isAdmin() {
    return this.user && this.user.rol === Role.Admin;
  }
  get isAdminDigitador() {
    return (
      (this.user && this.user.rol === Role.Admin) ||
      (this.user && this.user.rol === Role.Digitador)
    );
  }
  get isAdminUser() {
    return (
      (this.user && this.user.rol === Role.Admin) ||
      (this.user && this.user.rol === Role.User)
    );
  }
  get isAdminUserDigitador() {
    return (
      (this.user && this.user.rol === Role.Admin) ||
      (this.user && this.user.rol === Role.User) ||
      (this.user && this.user.rol === Role.Digitador)
    );
  }
  logout() {
    this.accountService.logout();
  }
}
