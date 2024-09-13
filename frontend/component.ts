// import di bagian atas sendiri

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, WuiService } from '@wajek/wui';
import { debounceTime, Subject, takeUntil } from 'rxjs';


// import di dalama class component
lastPage = false;
isLoading = false;

// ganti dataGruyp sesuai nama
dataGrup:Array<any> = [];

count:number = 0;
limit:number = 30;
selectedIndex = -1;

q = '';
$search:Subject<any> = new Subject();
searchMode = false;

page:any = 1;

get offset() {
  return (this.page -1) * this.limit;
}

get pageCount(){
  return Math.ceil(this.count / this.limit);
}

private $unsub:Subject<any> = new Subject();

constructor(
  private wuiService : WuiService,
  private messsageService : MessageService,
  private activateRoute : ActivatedRoute,
  private router : Router,
  // ganti service sesuai nama
  private grupService : GrupService
){}

toggleSearch(){
  this.searchMode = !this.searchMode;
  if (!this.searchMode) {
    this.router.navigate(['./'], {
      relativeTo: this.activateRoute,
      queryParams : {
        page: 1,
        search : null
      },
      queryParamsHandling : 'merge'
    });
  }
}

first() {
  this.router.navigate(['./'], {
    relativeTo : this.activateRoute,
    queryParams : {
      page: 1
    },
    queryParamsHandling : 'merge'
  });
}

prev(){
  if (this.page > 1) {
    this.router.navigate(['./'], {
      relativeTo : this.activateRoute,
      queryParams : {
        page: this.page - 1
      },
      queryParamsHandling: 'merge'
    });
  }
}

next(){
  if(this.page < this.pageCount) {
    this.router.navigate(['./'], {
      relativeTo: this.activateRoute,
      queryParams : {
        page : this.page + 1
      },
      queryParamsHandling : 'merge'
    })
  }
}

last(){
  this.router.navigate(['./'], {
    relativeTo: this.activateRoute,
    queryParams : {
      page : this.pageCount
    }, queryParamsHandling : 'merge'
  });
}

async hapus(){
  const confirm = await this.wuiService.dialog({
    title: 'Konfirmasi',
    // ganti pesan sesuai nama
    message: 'Anda yakin menghapus Grup terpilih ?',
    buttons : ['Batal', 'Hapus']
  });
  if (confirm == 1) {
    try {
      this.wuiService.openLoading();
      // ganti idGrup sesuai id
      await this.grupService.delete(this.dataGrup[this.selectedIndex]?.idGrup);
      this.wuiService.snackbar({
        // ganti pesan sesuai nama
        label : 'Satuan berhasil dihapus'
      });
      this.wuiService.closeLoading();
      this.dataGrup.splice(this.selectedIndex, 1);
    } catch (e:any) {
      this.wuiService.closeLoading();
      this.wuiService.dialog({
        title: 'Error',
        message: e?.error?.message ?? e?.message ?? 'Terjadi kesalahan hubungi administrator',
        buttons: ['OK']
      })
    }
  }
}

async refresh() {
  try {
    this.dataGrup = [];
    this.isLoading = true;
    let params: any = {
      offset: this.offset,
      limit : this.limit
    };
    if (this.q != null) params.search = this.q;
    const res = await this.grupService.result(params);
    this.dataGrup = res?.data;
    this.count = res?.count;
    this.isLoading = false;
  } catch (e:any) {
    this.isLoading = false;
    this.wuiService.dialog({
      title : 'Error',
      message: e?.error?.message ?? e?.message ?? 'Terjadi kesalahan hubungi administrator',
      buttons: ['OK']
    })
  }
}

ngOnInit() {
  try {
    // gantu grup sesuai nama
    this.messsageService.get('grup:afterUpdate').pipe(takeUntil(this.$unsub)).subscribe(()=>{
      this.refresh();
    });
    
    this.messsageService.get('grup:afterInsert').pipe(takeUntil(this.$unsub)).subscribe(()=>{
      this.refresh();
    });
    
    this.$search.pipe(takeUntil(this.$unsub), debounceTime(500)).subscribe((e:any)=>{
      this.router.navigate(['./'],{
        relativeTo: this.activateRoute,
        queryParams: {
          page : 1,
          search : e.target.value
        },
        queryParamsHandling: 'merge'
      });
    });
    
    this.activateRoute.queryParams.pipe(takeUntil(this.$unsub)).subscribe((queryParams) =>{
      this.page = queryParams['page'] ? parseInt(queryParams['page']) : 1;
      this.q = queryParams['search'] ?? null;
      this.searchMode = this.q !== null;
      this.refresh();
    });
  } catch (e:any) {
    this.wuiService.dialog({
      title : 'Error',
      message: e?.error?.message ?? e?.message ?? 'Terjadi kesalahan hubungi administrator',
      buttons : ['OK']
    });
  }
}

ngOnDestroy() {
  this.$unsub.next(null);
}