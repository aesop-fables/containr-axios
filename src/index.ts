import { createServiceModuleWithOptions, IServiceModule } from '@aesop-fables/containr';
import { AxiosServices } from './AxiosServices';
import { AxiosFactory, IAxiosFactory } from './AxiosFactory';
import { Interceptor, RequestInterceptor, ResponseInterceptor } from './Interceptor';
import { AxiosInstance, CreateAxiosDefaults } from 'axios';

class NulloRequestInterceptor implements RequestInterceptor {}
class NulloResponseInterceptor implements ResponseInterceptor {}

export { AxiosFactory, AxiosServices, IAxiosFactory, Interceptor, RequestInterceptor, ResponseInterceptor };

export const useAxios: (options?: CreateAxiosDefaults) => IServiceModule = createServiceModuleWithOptions<
  CreateAxiosDefaults | undefined
>('useAxios', (services, options) => {
  // Add defaults until containr handles arrays better
  // https://github.com/aesop-fables/containr/issues/36
  services.add(AxiosServices.RequestInterceptors, NulloRequestInterceptor);
  services.add(AxiosServices.ResponseInterceptors, NulloResponseInterceptor);

  services.use<IAxiosFactory>(AxiosServices.AxiosFactory, AxiosFactory);
  services.register<AxiosInstance>(AxiosServices.AxiosInstance, (container) => {
    const factory = container.get<IAxiosFactory>(AxiosServices.AxiosFactory);
    return factory.create(options);
  });
});
