import { IServiceModule, createServiceModuleWithOptions, Scopes } from '@aesop-fables/containr';
import { AxiosInstance } from 'axios';
import { IAxiosFactory, AxiosFactory } from './AxiosFactory';
import { AxiosServices } from './AxiosServices';
import { AxiosOptions } from './AxiosOptions';

export const useAxios: (options?: AxiosOptions) => IServiceModule = createServiceModuleWithOptions<
  AxiosOptions | undefined
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
