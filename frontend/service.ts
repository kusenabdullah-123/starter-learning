// import di paling atas
import { Inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';


// import di dalam class service
constructor(
  private httpService : HttpService,
  @Inject('apiUrl') private apiUrl: string
) { }

async result(params:any = null) {
  // ganti nama grup
  return await this.httpService.get(this.apiUrl + 'grup', {
    params
  });
}

// ganti nama idGrup
async row(idGrup:any, params:any = null) {
  return await this.httpService.get(this.apiUrl + `grup/${idGrup}`, {
    params
  });
}

async insert(data:any) {
  return this.httpService.post(this.apiUrl + 'grup', data);
}

async update(idGrup: any, data: any) {
  return this.httpService.patch(this.apiUrl + `grup/${idGrup}`, data);
}

async delete(idGrup:any) {
  return this.httpService.delete(this.apiUrl + `grup/${idGrup}`);
}