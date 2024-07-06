import { CreateAxiosDefaults } from 'axios';
import { RequestLogConfig, ResponseLogConfig } from 'axios-logger/lib/common/types';

export type AxiosOptions = CreateAxiosDefaults & {
  logging?: LoggingOptions;
};

export type LoggingOptions = {
  enabled: boolean;
  request?: RequestLogConfig;
  response?: ResponseLogConfig;
};
