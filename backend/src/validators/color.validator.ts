import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ColorValidationService } from '../services/color-validation.service';

@ValidatorConstraint({ name: 'isValidColor', async: false })
@Injectable()
export class IsValidColorConstraint implements ValidatorConstraintInterface {
  private colorValidationService = new ColorValidationService();

  validate(color: any): boolean {
    if (!color) return true; // Optional field
    return this.colorValidationService.validateColor(color);
  }

  defaultMessage(): string {
    return '색상은 HEX 코드(#FF0000), CSS 색상명(red), 또는 Tailwind CSS 클래스(bg-red-500) 형식이어야 합니다';
  }
}

export function IsValidColor(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidColorConstraint,
    });
  };
}