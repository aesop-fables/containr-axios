@aesop-fables/containr-axios

Provides a common bootstrapping configuration for using Axios in your Typescript applications (i.e., `scrinium` apps).

## Sample Usage

```typescript
// Example setup
const container = createContainer([
  useAxios({
    // optionally pass in anything you would to axios.create
    baseURL: 'http://localhost:8080',
  })
  myCustomModule,
]);

// Example usage
class MyApi {
  constructor(@inject(AxiosServices.AxiosInstance) private reaodnly axios: AxiosInstance) {}

  listItems(): AxiosResponse<MyModel[]> {
    return this.axios.get('/list');
  }
}
```