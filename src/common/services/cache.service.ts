import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getValue(key: string) {
    return this.cacheManager.get(key);
  }

  setValue<T>(key: string, value: T, options?: CachingConfig) {
    this.cacheManager.set(key, value, options);
  }
}
