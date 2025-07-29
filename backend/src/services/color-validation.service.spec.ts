import { ColorValidationService } from './color-validation.service';

describe('ColorValidationService', () => {
  let service: ColorValidationService;

  beforeEach(() => {
    service = new ColorValidationService();
  });

  describe('validateColor', () => {
    it('should validate HEX colors correctly', () => {
      expect(service.validateColor('#FF0000')).toBe(true);
      expect(service.validateColor('#f00')).toBe(true);
      expect(service.validateColor('#123456')).toBe(true);
      expect(service.validateColor('#GGG')).toBe(false);
      expect(service.validateColor('#12345')).toBe(false);
    });

    it('should validate CSS color names correctly', () => {
      expect(service.validateColor('red')).toBe(true);
      expect(service.validateColor('blue')).toBe(true);
      expect(service.validateColor('transparent')).toBe(false); // not in our list
      expect(service.validateColor('invalidcolor')).toBe(false);
    });

    it('should validate Tailwind CSS classes correctly', () => {
      expect(service.validateColor('bg-red-500')).toBe(true);
      expect(service.validateColor('text-blue-600')).toBe(true);
      expect(service.validateColor('border-green-400')).toBe(true);
      expect(service.validateColor('bg-invalid-500')).toBe(false);
      expect(service.validateColor('bg-red-1000')).toBe(false);
    });

    it('should handle empty or null values', () => {
      expect(service.validateColor('')).toBe(false);
      expect(service.validateColor(null as any)).toBe(false);
      expect(service.validateColor(undefined as any)).toBe(false);
    });
  });

  describe('normalizeColor', () => {
    it('should normalize HEX colors to uppercase', () => {
      expect(service.normalizeColor('#ff0000')).toBe('#FF0000');
      expect(service.normalizeColor('#abc')).toBe('#ABC');
    });

    it('should normalize CSS color names to lowercase', () => {
      expect(service.normalizeColor('RED')).toBe('red');
      expect(service.normalizeColor('Blue')).toBe('blue');
    });

    it('should keep Tailwind classes as-is', () => {
      expect(service.normalizeColor('bg-red-500')).toBe('bg-red-500');
      expect(service.normalizeColor('text-blue-600')).toBe('text-blue-600');
    });
  });

  describe('getColorType', () => {
    it('should identify color types correctly', () => {
      expect(service.getColorType('#FF0000')).toBe('hex');
      expect(service.getColorType('red')).toBe('css');
      expect(service.getColorType('bg-red-500')).toBe('tailwind');
      expect(service.getColorType('invalid')).toBe('unknown');
    });
  });

  describe('generateColorInfo', () => {
    it('should generate complete color info for HEX colors', () => {
      const colorInfo = service.generateColorInfo('#ff0000');
      expect(colorInfo.value).toBe('#FF0000');
      expect(colorInfo.type).toBe('hex');
      expect(colorInfo.displayValue).toBe('#FF0000');
      expect(colorInfo.cssValue).toBe('#FF0000');
    });

    it('should generate complete color info for CSS colors', () => {
      const colorInfo = service.generateColorInfo('red');
      expect(colorInfo.value).toBe('red');
      expect(colorInfo.type).toBe('css');
      expect(colorInfo.displayValue).toBe('red');
      expect(colorInfo.cssValue).toBe('red');
    });

    it('should generate complete color info for Tailwind colors', () => {
      const colorInfo = service.generateColorInfo('bg-red-500');
      expect(colorInfo.value).toBe('bg-red-500');
      expect(colorInfo.type).toBe('tailwind');
      expect(colorInfo.displayValue).toBe('bg-red-500');
      expect(colorInfo.cssValue).toBe('#ef4444'); // mapped value
    });

    it('should handle empty colors', () => {
      const colorInfo = service.generateColorInfo('');
      expect(colorInfo.value).toBe('');
      expect(colorInfo.type).toBe('unknown');
      expect(colorInfo.displayValue).toBe('');
    });
  });
});
