import { createServiceModuleWithOptions, IServiceModule, Scopes } from '@aesop-fables/containr';
import { AxiosServices } from './AxiosServices';
import { AxiosFactory, IAxiosFactory } from './AxiosFactory';
import { Interceptor, RequestInterceptor, ResponseInterceptor } from './Interceptor';
import { AxiosInstance, CreateAxiosDefaults } from 'axios';

export { AxiosFactory, AxiosServices, IAxiosFactory, Interceptor, RequestInterceptor, ResponseInterceptor };

export const useAxios: (options?: CreateAxiosDefaults) => IServiceModule = createServiceModuleWithOptions<
  CreateAxiosDefaults | undefined
>('useAxios', (services, options) => {
  services.autoResolve<IAxiosFactory>(AxiosServices.AxiosFactory, AxiosFactory, Scopes.Transient);
  services.factory<AxiosInstance>(
    AxiosServices.AxiosInstance,
    (container) => {
      const factory = container.get<IAxiosFactory>(AxiosServices.AxiosFactory);
      return factory.create(options);
    },
    Scopes.Transient,
  );
});
