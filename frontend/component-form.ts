// import di bagian atas
import { Component, Input, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ModalComponent, WuiService } from '@wajek/wui';
import { Subject } from 'rxjs';


@ViewChild('modal', { static : true}) modal?: ModalComponent;

  aksi:string = 'insert';
  // ganti idGrup sesuai dengan nama (bisa auto)
  idGrup:number = 0;

  private $result: Subject<any> = new Subject();
  @Input('embed') embed = false;

  // sesuaikan formgrup (bisa auto)
  formGrup = new UntypedFormGroup({
    // seuaikan isi form (manual)
    nmGrup : new UntypedFormControl(null, Validators.required),
  });

  constructor(
    private wuiService : WuiService,
    private messageService : MessageService,
    private activateRoute : ActivatedRoute,
    private router : Router,
    // seusikan service (bisa auto)
    private grupService : GrupService
  ){}

  close(){
    this.$result.next('close');
  }

  insert(){
    return new Promise(async (resolve)=>{
      this.aksi = 'insert';
      // sesuaikan isi form (manual)
      this.formGrup.controls['nmGrup'].setValue(null);
      await this.modal?.open();

      let sub = this.$result.subscribe(async (result : any)=>{
        await this.modal?.close();
        resolve(result);
        sub.unsubscribe();
      })
    })
  }

  edit(idGrup: any){
    return new Promise(async (resolve)=>{
      try {
        this.wuiService.openLoading();
        this.aksi = 'edit';
        this.idGrup = idGrup

        // sesuaikan variabel

        const satuan = await this.grupService.row(this.idGrup);
        // sesuaikan isi form (manual)
        this.formGrup.controls['nmGrup'].setValue(satuan?.nmGrup);
        await this.modal?.open();
        
        const sub = this.$result.subscribe(async (result)=>{
          await this.modal?.close();
          resolve(result);
          sub.unsubscribe();
        });
        this.wuiService.closeLoading();
      } catch (e: any) {
        this.wuiService.closeLoading();
        this.wuiService.dialog({
          title: 'Error',
          message : e?.error?.message ?? e?.message ?? 'Terjadi kesalahan hubungi administrtor',
          buttons : ['OK']
        })
      }
    })
  }

  async submit(){
    if (this.formGrup.invalid) return;
    try {
      this.wuiService.openLoading();
      let data = this.formGrup.value;
      if (this.aksi == 'insert') {
          const res = await this.grupService.insert(data);
          data.idGrup = res?.idGrup;
          // sesuaikan isi pesan
          this.wuiService.snackbar({
            label: 'Grup berhasil ditambahkan'
          });
      } else {
        await this.grupService.update(this.idGrup, data);
        data.idGrup = this.idGrup;
        // sesuaikan isi pesan
        this.wuiService.snackbar({
          label : 'Grup berhasil diupdate'
        });
      }
      this.$result.next(data);
      this.wuiService.closeLoading();
    } catch (e:any) {
      // sesuaikan nama
      if (e?.error?.code == 'grup/invalid-input') {
        for (const [key,reason] of Object.entries(e?.error?.data)) {
          this.formGrup.controls[key].setErrors({
            invalid : true,
            invalidReason : reason
          });
        }
      } else {
        this.wuiService.closeLoading();
        this.wuiService.dialog({
          title: 'Error',
          message: e?.error?.message ?? e?.message ?? 'Terjadi kesalahan, hubungi administrator',
          buttons: ['OK']
        });
      }
    }
  }
  async ngOnInit() {

    if (this.embed) return;
    try {
      const idGrup = this.activateRoute.snapshot.params['idGrup'] ?? null;
      if (idGrup) {
        const res = await this.edit(idGrup);
        if (res !== 'close' && res !== null) {
          // sesuaikan nama
          this.messageService.set('grup:afterUpdate', res);
        }
      } else{
        const res = await this.insert();
        if (res !== 'close' && res !== null) {
           // sesuaikan nama
          this.messageService.set('grup:afterInsert', res);
        }
      }

      this.router.navigate([idGrup !== null ? '../../' : '../'],{
        relativeTo : this.activateRoute,
        queryParamsHandling: 'merge'
      });
    } catch (e:any) {
      this.wuiService.dialog({
        title : 'Error',
        message : e?.error?.message ?? e?.message ?? 'Terjadi kesalahan hubingi administrtor',
        buttons : ['OK']
      })
    }
  }