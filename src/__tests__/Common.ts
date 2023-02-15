import { inject } from '@aesop-fables/containr';
import { AxiosInstance, AxiosResponse } from 'axios';
import { AxiosServices } from '../AxiosServices';
import express from 'express';
import http from 'http';

export interface TodoItem {
  id: string;
  summary: string;
}

export interface ITodoApi {
  show(id: string): Promise<AxiosResponse<TodoItem>>;
  listAll(): Promise<AxiosResponse<TodoItem[]>>;
}

export class TodoApi implements ITodoApi {
  constructor(@inject(AxiosServices.AxiosInstance) private readonly axios: AxiosInstance) {}

  show(id: string): Promise<AxiosResponse<TodoItem>> {
    return this.axios.get<TodoItem>(`/todos/${id}`);
  }

  async listAll(): Promise<AxiosResponse<TodoItem[]>> {
    return this.axios.get<TodoItem[]>('/todos');
  }
}

export function createTodoServer(port: number) {
  const app = express();
  app.use(express.json());

  app.get('/todos', (req, res) => {
    res.status(200);
    res.send([{ id: '123', summary: 'Hello!' }]);
  });

  const server = http.createServer(app);
  server.listen(port);

  return server;
}
