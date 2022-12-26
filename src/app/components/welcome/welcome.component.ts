import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models';
import { AccountService } from 'src/app/_services';
import { first } from 'rxjs/operators';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
  user: User;
  userFromApi: User;
  loading = false;

  constructor(private accountService: AccountService) {
    this.user = this.accountService.userValue;
  }

  ngOnInit(): void {
    this.cargarAcceso();
  }
  cargarAcceso() {
    this.loading = true;
    this.accountService
      .getById(this.user.id)
      .pipe(first())
      .subscribe((user) => {
        this.loading = false;
        this.userFromApi = user;
      });
  }
}
