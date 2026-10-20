import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}
  get<T>(u: string) {
    return this.http.get<T>("/api" + u);
  }
  post<T>(u: string, b: any) {
    return this.http.post<T>("/api" + u, b);
  }
  put<T>(u: string, b: any) {
    return this.http.put<T>("/api" + u, b);
  }
  patch<T>(u: string, b: any) {
    return this.http.patch<T>("/api" + u, b);
  }
  delete<T>(u: string) {
    return this.http.delete<T>("/api" + u);
  }
  upload<T>(u: string, form: FormData) {
    return this.http.post<T>("/api" + u, form);
  }
}
