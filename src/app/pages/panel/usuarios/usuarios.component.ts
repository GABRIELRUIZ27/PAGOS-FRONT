import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { RolsService } from 'src/app/core/services/rols.service';
import { UsuariosService } from 'src/app/core/services/usuarios.service';
import { LoadingStates } from 'src/app/global/global';
import { Rol } from 'src/app/models/rol';
import { Usuario } from 'src/app/models/usuario';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  usuario!: Usuario;
  usuarioForm!: FormGroup;
  usuarios: Usuario[] = [];
  usuariosFilter: Usuario[] = [];
  isLoading = LoadingStates.neutro;
  rols: Rol[] = [];
  isModalAdd = true;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private usuarioService: UsuariosService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private rolsService: RolsService,
  ) {
    this.usuarioService.refreshListUsuarios.subscribe(() => this.getUsuarios());
    this.getUsuarios();
    this.getRols();
    this.creteForm();
    this.isModalAdd = false;
  }

  getRols() {
    this.rolsService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.rols = dataFromAPI) });
  }

  creteForm() {
    this.usuarioForm = this.formBuilder.group({
      id: [null],
      nombreCompleto: [
        '',
        [
          Validators.required,
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      estatus: [true],
      rolId: ['', Validators.required],
    });
  }

  getUsuarios() {
    this.isLoading = LoadingStates.trueLoading;
    this.usuarioService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.usuarios = dataFromAPI;
        this.usuariosFilter = this.usuarios;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.usuariosFilter = this.usuarios.filter(
      (usuario) =>
        usuario.nombreCompleto.toLowerCase().includes(valueSearch) ||
        usuario.rol.nombreRol.toLowerCase().includes(valueSearch) ||
        usuario.correo.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Usuario) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.usuarioForm.patchValue({
      id: dto.id,
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      password: dto.password,
      estatus: dto.estatus,
      rolId: dto.rol.id,
    });
  }

  editarUsuario() {
    this.usuario = this.usuarioForm.value as Usuario;

    const rolId = this.usuarioForm.get('rolId')?.value;

    this.usuario.rol = { id: rolId } as Rol;

    this.spinnerService.show();
    this.usuarioService.put(this.idUpdate, this.usuario).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Usuario actualizado correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el usuario: ${nameItem}?`,
      () => {
        this.usuarioService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Usuario borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.usuario = this.usuarioForm.value as Usuario;
    const rolId = this.usuarioForm.get('rolId')?.value;

    this.usuario.rol = { id: rolId } as Rol;
    this.spinnerService.show();
    this.usuarioService.post(this.usuario).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Usuario guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.usuarioForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarUsuario();
    } else {
      this.agregar();
    }
  }

  handleChangeAdd() {
    if (this.usuarioForm) {
      this.usuarioForm.reset();
      const estatusControl = this.usuarioForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.usuarios.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.usuarios.map((usuario) => {
      const estatus = usuario.estatus ? 'Activo' : 'Inactivo';
      return {
        Nombre: usuario.nombreComleto,
        Correo: usuario.correo,
        Rol: usuario.rol.nombreRol,
        Estatus: estatus,
      };
    });

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarArchivoExcel(excelBuffer, 'usuarios.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
