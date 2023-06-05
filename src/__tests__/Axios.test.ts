/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { createContainer, createServiceModule } from '@aesop-fables/containr';
import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AxiosServices } from '../AxiosServices';
import { useAxios } from '../index';
import { RequestInterceptor, ResponseInterceptor } from '../Interceptor';
import { createTodoServer, TodoApi } from './Common';

describe('useAxios', () => {
  test('Creates the axios instance via the factory', async () => {
    const container = createContainer([useAxios({ baseURL: 'http://localhost/test' })]);
    const instance = container.get<AxiosInstance>(AxiosServices.AxiosInstance);
    expect(instance.defaults.baseURL).toBe('http://localhost/test');
  });

  test('Activates request interceptors > onFulfilled', async () => {
    class StubInterceptor implements RequestInterceptor {
      public wasFulfilled = false;

      async onFulfilled(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
        this.wasFulfilled = true;
        return config;
      }
    }

    const requestInterceptor = new StubInterceptor();
    const testModule = createServiceModule('testModule', (services) =>
      services.array<RequestInterceptor>(AxiosServices.RequestInterceptors, requestInterceptor as RequestInterceptor),
    );

    const port = 3001;
    const server = createTodoServer(port);
    const container = createContainer([useAxios({ baseURL: `http://localhost:${port}` }), testModule]);
    const todoApi = container.resolve(TodoApi);

    await todoApi.listAll();
    server.close();
    expect(requestInterceptor.wasFulfilled).toBeTruthy();
  });

  test('Activates response interceptors > onRejected', async () => {
    class StubInterceptor implements ResponseInterceptor {
      public wasRejected = false;

      onRejected(error: any): any {
        this.wasRejected = true;
        return error;
      }
    }

    const interceptor = new StubInterceptor();
    const testModule = createServiceModule('testModule', (services) =>
      services.array<ResponseInterceptor>(AxiosServices.ResponseInterceptors, interceptor as ResponseInterceptor),
    );

    const port = 3001;
    const container = createContainer([useAxios({ baseURL: `http://localhost:${port}` }), testModule]);
    const todoApi = container.resolve(TodoApi);

    await todoApi.show('blah');
    expect(interceptor.wasRejected).toBeTruthy();
  });
});
