  
  import { Component, ViewChild } from '@angular/core';
  import { GrupService } from '../../../services/grup.service';
  import { ModalComponent, WuiService } from '@wajek/wui';
  import { Subject, takeUntil, debounceTime } from 'rxjs';


  @ViewChild('modal', {static: true}) modal?: ModalComponent;
  // sesuaikan dengan nama
  @ViewChild('formGrup', {static: true}) formGrup?: GrupFormComponent;

  isLoading: boolean = false;
  // sesuaikan data Grup
  dataGrup: Array<any> = [];
  count: number = 0;

  page: number = 1;
  limit: number = 30;

  get offset() {
    return (this.page - 1) * this.limit;
  }

  get pageCount() {
    return Math.ceil(this.count / this.limit);
  }

  search: string = '';

  $search: Subject<any> = new Subject();
  private $result: Subject<any> = new Subject();
  private $unsub: Subject<any> = new Subject();

  constructor(
    // sesuaikan Servide
    private grupService: GrupService,
    private wuiService: WuiService
  ) {}

  select(grup: any) {
    this.$result.next(grup);
  }

  // ganti nama function sesuaikan
  async tambahGrup(){
    // ganti nama variabel seuaikan
    const grup = await this.formGrup?.insert();
    if (grup !== null && grup !== 'close') {
      this.$result.next(grup);
    }
  }

  open() {
    return new Promise(async (resolve) => {
      let sub = this.$result.subscribe(async res => {
        await this.modal?.close();
        resolve(res);
        sub.unsubscribe();
      });

      await this.modal?.open();
      this.refresh();
    });
  }

  close() {
    this.$result.next('close');
  }

  first() {
    this.page = 1;
    this.refresh();
  }

  last() {
    this.page = this.pageCount;
    this.refresh();
  }

  next() {
    if(this.page < this.pageCount) {
      this.page++;
      this.refresh();
    }
  }

  prev() {
    if(this.page > 1) {
      this.page--;
      this.refresh();
    }
  }

  async refresh() {
    try {
      this.isLoading = true;
      let params: any = {
        offset: this.offset,
        limit: this.limit,
      };
      if(this.search.length > 0) {
        params.search = this.search;
      }
      //sesuaikan service
      let res: any = await this.grupService.result(params);
      // sesuaikan data grup
      this.dataGrup = res?.data;
      this.count = res?.count;
      this.isLoading = false;
    } catch(e: any) {
      this.isLoading = false;
      this.wuiService.dialog({
        title: "Error",
        message: e.error?.message ?? e.message ?? 'Terjadi kesalahan, hubungi administrator',
        buttons: ['Ok']
      });
    }
  }

  ngOnInit(): void {
    this.$search.pipe(takeUntil(this.$unsub), debounceTime(500)).subscribe(e => {
      this.search = e.target.value;
      this.page = 1;
      this.refresh();
    });
  }

  ngOnDestroy(): void {
    this.$unsub.next(null);
  }