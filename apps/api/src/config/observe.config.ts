import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../utils/validate-config';

export type ObserveConfig = {
  appKey?: string;
  appSecret?: string;
  serviceId: string;
};

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  OBSERVE_APP_KEY?: string;

  @IsString()
  @IsOptional()
  OBSERVE_APP_SECRET?: string;

  @IsString()
  @IsOptional()
  OBSERVE_SERVICE_ID?: string;
}

const sanitizeEnv = (val?: string) => {
  if (!val) return undefined;
  return val.replace(/^['"](.*)['"]$/, '$1').trim();
};

export default registerAs<ObserveConfig>('observe', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    appKey: sanitizeEnv(process.env.OBSERVE_APP_KEY),
    appSecret: sanitizeEnv(process.env.OBSERVE_APP_SECRET),
    serviceId: sanitizeEnv(process.env.OBSERVE_SERVICE_ID) || 'kosume-local',
  };
});
