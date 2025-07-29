import { Injectable } from '@nestjs/common';

@Injectable()
export class ColorValidationService {
  // CSS 기본 색상명 목록
  private readonly cssColorNames = [
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
  ];

  // Tailwind CSS 색상 클래스 패턴
  private readonly tailwindColorPattern =
    /^(bg-|text-|border-|ring-)?((slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950))$/;

  /**
   * 색상 값이 유효한지 검증
   */
  validateColor(color: string): boolean {
    if (!color || typeof color !== 'string') {
      return false;
    }

    const trimmedColor = color.trim().toLowerCase();

    // HEX 색상 검증 (#RGB 또는 #RRGGBB)
    if (this.isValidHexColor(trimmedColor)) {
      return true;
    }

    // CSS 색상명 검증
    if (this.isValidCssColorName(trimmedColor)) {
      return true;
    }

    // Tailwind CSS 클래스 검증
    if (this.isValidTailwindColor(color.trim())) {
      return true;
    }

    return false;
  }

  /**
   * HEX 색상 코드 검증
   */
  private isValidHexColor(color: string): boolean {
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    return hexPattern.test(color);
  }

  /**
   * CSS 색상명 검증
   */
  private isValidCssColorName(color: string): boolean {
    return this.cssColorNames.includes(color);
  }

  /**
   * Tailwind CSS 색상 클래스 검증
   */
  private isValidTailwindColor(color: string): boolean {
    return this.tailwindColorPattern.test(color);
  }

  /**
   * 색상을 표준화된 형태로 변환
   */
  normalizeColor(color: string): string {
    if (!color) return '';

    const trimmedColor = color.trim();

    // HEX 색상은 대문자로 변환
    if (this.isValidHexColor(trimmedColor.toLowerCase())) {
      return trimmedColor.toUpperCase();
    }

    // CSS 색상명은 소문자로 변환
    if (this.isValidCssColorName(trimmedColor.toLowerCase())) {
      return trimmedColor.toLowerCase();
    }

    // Tailwind CSS 클래스는 그대로 반환
    if (this.isValidTailwindColor(trimmedColor)) {
      return trimmedColor;
    }

    return trimmedColor;
  }

  /**
   * 색상 타입 감지
   */
  getColorType(color: string): 'hex' | 'css' | 'tailwind' | 'unknown' {
    if (!color) return 'unknown';

    const trimmedColor = color.trim();

    if (this.isValidHexColor(trimmedColor.toLowerCase())) {
      return 'hex';
    }

    if (this.isValidCssColorName(trimmedColor.toLowerCase())) {
      return 'css';
    }

    if (this.isValidTailwindColor(trimmedColor)) {
      return 'tailwind';
    }

    return 'unknown';
  }

  /**
   * 프론트엔드에서 사용할 수 있는 색상 정보 생성
   */
  generateColorInfo(color: string): {
    value: string;
    type: string;
    displayValue: string;
    cssValue?: string;
  } {
    if (!color) {
      return {
        value: '',
        type: 'unknown',
        displayValue: '',
      };
    }

    const normalizedColor = this.normalizeColor(color);
    const colorType = this.getColorType(normalizedColor);

    let cssValue: string | undefined;
    let displayValue = normalizedColor;

    switch (colorType) {
      case 'hex':
        cssValue = normalizedColor;
        displayValue = normalizedColor;
        break;
      case 'css':
        cssValue = normalizedColor;
        displayValue = normalizedColor;
        break;
      case 'tailwind':
        // Tailwind 클래스에서 실제 색상값 추출 (간단한 매핑)
        cssValue = this.extractCssFromTailwind(normalizedColor);
        displayValue = normalizedColor;
        break;
      default:
        displayValue = normalizedColor;
    }

    return {
      value: normalizedColor,
      type: colorType,
      displayValue,
      cssValue,
    };
  }

  /**
   * Tailwind 클래스에서 CSS 색상값 추출 (기본적인 매핑)
   */
  private extractCssFromTailwind(tailwindClass: string): string {
    // 간단한 Tailwind -> CSS 색상 매핑
    const colorMappings: Record<string, string> = {
      'bg-red-500': '#ef4444',
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981',
      'bg-yellow-500': '#f59e0b',
      'bg-purple-500': '#8b5cf6',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
      'bg-gray-500': '#6b7280',
      'text-red-500': '#ef4444',
      'text-blue-500': '#3b82f6',
      'text-green-500': '#10b981',
      'text-yellow-500': '#f59e0b',
      'text-purple-500': '#8b5cf6',
      'text-pink-500': '#ec4899',
      'text-indigo-500': '#6366f1',
      'text-gray-500': '#6b7280',
    };

    return colorMappings[tailwindClass] || tailwindClass;
  }
}
