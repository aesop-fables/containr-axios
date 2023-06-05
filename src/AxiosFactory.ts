import { AxiosServices } from './AxiosServices';
import { injectArray } from '@aesop-fables/containr';
import { Interceptor, RequestInterceptor, ResponseInterceptor } from './Interceptor';
import axios, { AxiosInstance, CreateAxiosDefaults, AxiosResponse } from 'axios';

export interface IAxiosFactory {
  create(settings?: CreateAxiosDefaults): AxiosInstance;
}

declare type InterceptorProxy<T> = (value: T) => Promise<T>;

const onFulfilled = <T>(interceptor: Interceptor<T>): InterceptorProxy<T> => {
  return (val) => {
    if (interceptor.onFulfilled) {
      return interceptor.onFulfilled(val);
    }

    return Promise.resolve(val);
  };
};

const onRejected = <T>(interceptor: Interceptor<T>): InterceptorProxy<AxiosResponse> => {
  return (val) => {
    if (interceptor.onRejected) {
      return interceptor.onRejected(val);
    }

    return Promise.reject(val);
  };
};

export class AxiosFactory implements IAxiosFactory {
  constructor(
    @injectArray(AxiosServices.RequestInterceptors) private readonly requestInterceptors: RequestInterceptor[],
    @injectArray(AxiosServices.ResponseInterceptors) private readonly responseInterceptors: ResponseInterceptor[],
  ) {}

  create(settings?: CreateAxiosDefaults): AxiosInstance {
    const instance = axios.create(settings);

    this.runRequestInterceptors(instance);
    this.runResponseInterceptors(instance);

    return instance;
  }

  private runRequestInterceptors(instance: AxiosInstance): void {
    this.requestInterceptors.forEach((interceptor) => {
      instance.interceptors.request.use(onFulfilled(interceptor), onRejected(interceptor), interceptor.options);
    });
  }

  private runResponseInterceptors(instance: AxiosInstance): void {
    this.responseInterceptors.forEach((interceptor) => {
      instance.interceptors.response.use(onFulfilled(interceptor), onRejected(interceptor), interceptor.options);
    });
  }
}
