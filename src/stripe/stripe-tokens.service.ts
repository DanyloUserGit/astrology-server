import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Cache } from 'cache-manager';

@Injectable()
export class StripeTokensService {
  constructor(
    @Inject("CACHE_MANAGER") private cacheManager: Cache
  ) {}

  async generateToken(): Promise<string> {
    const token = uuid();
    await this.cacheManager.set(`free_order`, token);
    return token;
  }

  async createTokenFile(token: string, res:{fileName:string, success:boolean, message:string, pdf:string}): Promise<string> {
    const id = uuid();
    await this.cacheManager.set(`file${token}`, res);
    return id;
  }

  async verifyAndGetFile(token: string): Promise<any> {
    const data = await this.cacheManager.get(`file${token}`);
    if (data) {
      await this.cacheManager.del(`file${token}`);
      return data;
    }
    return null;
  }

  async verifyAndConsumeToken(token: string): Promise<boolean> {
    const key = `free_order`;
    const exists = await this.cacheManager.get(key);
    if (exists) {
      if(exists!==token) return false;
      
      await this.cacheManager.del(key);
      return true;
    }
    return false;
  }
}
