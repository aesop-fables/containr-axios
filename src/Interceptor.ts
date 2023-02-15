/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInterceptorOptions, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export interface Interceptor<T> {
  onFulfilled?(value: T): Promise<T>;
  onRejected?(error: any): any;
  options?: AxiosInterceptorOptions;
}

export interface RequestInterceptor extends Interceptor<InternalAxiosRequestConfig> {}
export interface ResponseInterceptor extends Interceptor<AxiosResponse> {}
