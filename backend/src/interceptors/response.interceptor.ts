import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/common-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 ApiResponse 형태라면 그대로 반환
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }
        
        // 일반 데이터를 ApiResponse로 래핑
        return ApiResponse.success(data);
      }),
    );
  }
}