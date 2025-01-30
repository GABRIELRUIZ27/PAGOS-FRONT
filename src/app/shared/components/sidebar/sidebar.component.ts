import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements AfterViewInit {
  menuColapsado: boolean = true;
  
  @ViewChild('rlDashboard') rlDashboard!: RouterLinkActive;
  @ViewChild('rlDashboardFinanciero') rlDashboardFinanciero!: RouterLinkActive;
  @ViewChild('rlDashboardIncidencias') rlDashboardIncidencias!: RouterLinkActive;
  @ViewChild('rlControlAgua') rlControlAgua!: RouterLinkActive;
  @ViewChild('rlPagoAgua') rlPagoAgua!: RouterLinkActive;

  @ViewChild('rlTiposIncidencias') rlTiposIncidencias!: RouterLinkActive;
  @ViewChild('rlUsuarios') rlUsuarios: RouterLinkActive | undefined;
  @ViewChild('rlProgramasSociales') rlProgramasSociales:
    | RouterLinkActive
    | undefined;
  @ViewChild('rlAreas') rlAreas:
    | RouterLinkActive
    | undefined;
  @ViewChild('rlIncidencias') rlIncidencias: RouterLinkActive | undefined;
  @ViewChild('rlApoyos') rlApoyos: RouterLinkActive | undefined;
  @ViewChild('rlSolicitudesApoyos') rlSolicitudesApoyos: RouterLinkActive | undefined;
  @ViewChild('rlFondos') rlFondos: RouterLinkActive | undefined;
  @ViewChild('rlPersonal') rlPersonal: RouterLinkActive | undefined;
  @ViewChild('rlAdquisiciones')rlAdquisiciones: RouterLinkActive | undefined;
  @ViewChild('rlAgua')rlAgua: RouterLinkActive | undefined;
  dataObject!: AppUserAuth | null;
  @ViewChild('rlMapaApoyos') rlMapaApoyos: RouterLinkActive | undefined;
  @ViewChild('rlMapaIncidencias') rlMapaIncidencias: RouterLinkActive | undefined;

  constructor(
    private securityService: SecurityService,
    private cdr: ChangeDetectorRef
  ) {
    localStorage.getItem('dataObject') && this.setDataUser();
  }

  setDataUser() {
    this.dataObject = this.securityService.getDataUser();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges(); // forzar un ciclo de detección de cambios después de la vista inicial
  }

  cerrarMenu(): void {
    const sidebarMenu = document.querySelector('#sidebar-menu');

    if (sidebarMenu) {
      sidebarMenu.classList.remove('show');
    }
  }
}
