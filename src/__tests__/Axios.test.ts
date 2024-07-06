/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Scopes, createContainer, createServiceModule, inject } from '@aesop-fables/containr';
import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AxiosServices } from '../AxiosServices';
import { useAxios } from '../useAxios';
import { RequestInterceptor, ResponseInterceptor } from '../Interceptor';
import { createTodoServer, TodoApi } from './Common';

describe('useAxios', () => {
  test('Creates the axios instance via the factory', async () => {
    const axios = useAxios({
      baseURL: 'http://localhost/test',
      logging: { enabled: true },
    });
    const container = createContainer([axios]);
    const instance = container.get<AxiosInstance>(AxiosServices.AxiosInstance);
    expect(instance.defaults.baseURL).toBe('http://localhost/test');
  });

  test('Activates request interceptors > onFulfilled', async () => {
    const context: InterceptorRecordingContext = { invoked: false };
    const testModule = createServiceModule('testModule', (services) => {
      services.singleton(recordingContextKey, context);
      services.autoResolve<CommandDispatcher>(dispatcherKey, CommandDispatcher, Scopes.Transient);
      services.arrayAutoResolve<RequestInterceptor>(AxiosServices.RequestInterceptors, StubRequestInterceptor);
    });

    const port = 3001;
    const server = createTodoServer(port);
    const axios = useAxios({
      baseURL: `http://localhost:${port}`,
      logging: { enabled: true },
    });
    const container = createContainer([axios, testModule]);
    const todoApi = container.resolve(TodoApi);

    await todoApi.listAll();
    server.close();
    expect(context.invoked).toBeTruthy();
  });

  test('Activates response interceptors > onRejected', async () => {
    const context: InterceptorRecordingContext = { invoked: false };
    const testModule = createServiceModule('testModule', (services) => {
      services.singleton(recordingContextKey, context);
      services.autoResolve<CommandDispatcher>(dispatcherKey, CommandDispatcher, Scopes.Transient);
      services.arrayAutoResolve<ResponseInterceptor>(AxiosServices.ResponseInterceptors, StubResponseInterceptor);
    });

    const port = 3001;
    const container = createContainer([useAxios({ baseURL: `http://localhost:${port}` }), testModule]);
    const todoApi = container.resolve(TodoApi);

    await todoApi.show('blah');
    expect(context.invoked).toBeTruthy();
  });
});

type InterceptorRecordingContext = {
  invoked: boolean;
};

const recordingContextKey = 'interceptorRecordingContext';
const dispatcherKey = 'dispatcher';

class CommandDispatcher {
  constructor(@inject(recordingContextKey) private readonly context: InterceptorRecordingContext) {}

  dispatchInvoke() {
    this.context.invoked = true;
  }

  dispatchReject() {
    this.context.invoked = true;
  }
}

class StubRequestInterceptor implements RequestInterceptor {
  constructor(@inject(dispatcherKey) private readonly dispatcher: CommandDispatcher) {}

  async onFulfilled(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    this.dispatcher.dispatchInvoke();
    return config;
  }
}

class StubResponseInterceptor implements ResponseInterceptor {
  constructor(@inject(dispatcherKey) private readonly dispatcher: CommandDispatcher) {}

  onRejected(error: any): any {
    this.dispatcher.dispatchReject();
    return error;
  }
}
