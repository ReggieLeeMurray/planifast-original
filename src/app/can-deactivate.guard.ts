import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanDeactivate,
} from '@angular/router';
import { Observable } from 'rxjs';

export interface PuedeDesactivar {
  permitirSalidaDeRuta: () => Observable<boolean> | Promise<boolean> | boolean;
}
@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<PuedeDesactivar> {
  canDeactivate(component: PuedeDesactivar) {
    return component.permitirSalidaDeRuta
      ? component.permitirSalidaDeRuta()
      : true;
  }
}
