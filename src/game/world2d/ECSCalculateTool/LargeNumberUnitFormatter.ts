const THOUSAND = 1000;
const THOUSAND_BIGINT = 1000n;
/**
 * 你提供的原创单位（每级相差 1000 倍）
 * 1 => K, 2 => M, ...
 */
export const CUSTOM_THOUSAND_UNITS = [
    'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y', 'Q', 'A', 'S', 'X', 'O', 'C', 'N', 'D', 'U', 'F', 'H', 'J', 'L', 'R', 'V', 'W'
] as const;

export interface FormatLargeNumberOptions {
    /**
     * 进位基数（默认 1000，表示每超过 1000 倍进一位）
     */
    step?: number;
    /**
     * 保留小数位（默认 2，最大 2）
     */
    decimalPlaces?: number;
    /**
     * 是否去掉小数末尾 0（默认 true）
     */
    trimTrailingZeros?: boolean;
    /**
     * 自定义单位序列（默认使用 CUSTOM_THOUSAND_UNITS）
     */
    units?: readonly string[];
    /**
     * 单位是否统一转成大写（默认 true）
     */
    uppercaseUnits?: boolean;
}

/**
 * 例如：
 *  - 999 => "999"
 *  - 12345 => "12.35K"
 *  - 123456789 => "123.46M"
 *  - 超过 W 后 => "KK", "KM", ... "WW", 再到 "KKK", ...
 */
export function formatLargeNumberWithUnits(
    value: number | string | bigint,
    options: FormatLargeNumberOptions = {}
): string {
    const normalizedOptions = normalizeOptions(options);

    if (typeof value === 'bigint') {
        return formatBigIntValue(value, normalizedOptions);
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return String(value);
        return formatNumberValue(value, normalizedOptions);
    }

    const text = value.trim();
    if (!text) return '0';

    const normalizedBigIntText = normalizeBigIntText(text);
    if (normalizedBigIntText) {
        // 纯整数字符串优先走 bigint，避免超大值精度丢失
        return formatBigIntValue(BigInt(normalizedBigIntText), normalizedOptions);
    }

    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return text;
    return formatNumberValue(parsed, normalizedOptions);
}

/**
 * 显式 BigInt 格式化入口。
 * 支持：
 *  - bigint: 123456789n
 *  - 字符串: "123456789", "-123456789", "123456789n", "1_234_567n"
 */
export function formatBigIntWithUnits(
    value: bigint | string,
    options: FormatLargeNumberOptions = {}
): string {
    const normalizedOptions = normalizeOptions(options);

    const bigintValue = typeof value === 'bigint'
        ? value
        : BigInt(parseBigIntTextOrThrow(value));

    return formatBigIntValue(bigintValue, normalizedOptions);
}

/**
 * 根据 1000 的幂次获取单位：
 *  - tier=0 => ""
 *  - tier=1..24 => K..W
 *  - tier=25 => KK
 *  - tier=26 => KM
 */
export function getUnitByTier(
    tier: number,
    units: readonly string[] = CUSTOM_THOUSAND_UNITS,
    uppercase = true
): string {
    if (tier <= 0) return '';

    if (tier <= units.length) {
        const unit = units[tier - 1] ?? '';
        return uppercase ? unit.toUpperCase() : unit;
    }

    const composedIndex = tier - units.length - 1;
    const composedUnit = getComposedUnit(composedIndex, units);
    if (!composedUnit) return '';
    return uppercase ? composedUnit.toUpperCase() : composedUnit;
}

type NormalizedOptions = {
    step: number;
    decimalPlaces: number;
    trimTrailingZeros: boolean;
    units: readonly string[];
    uppercaseUnits: boolean;
};

function formatNumberValue(value: number, options: NormalizedOptions): string {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);

    if (absValue === 0) return '0';

    let tier = 0;
    let scaled = absValue;
    const step = options.step;

    if (absValue >= step) {
        tier = Math.floor(Math.log(absValue) / Math.log(step));
        scaled = absValue / Math.pow(step, tier);
    }

    while (scaled >= step) {
        scaled /= step;
        tier += 1;
    }

    while (true) {
        const unit = getUnitByTier(tier, options.units, options.uppercaseUnits);
        const numberText = formatScaledNumber(scaled, options);
        
        // 检查进位后的值是否依然小于 step (处理 toFixed 四舍五入可能导致的进位)
        const roundedValue = Number(Number(scaled).toFixed(options.decimalPlaces));
        if (roundedValue < options.step) {
            return `${sign}${numberText}${unit}`;
        }

        scaled /= step;
        tier += 1;
    }
}

function formatBigIntValue(value: bigint, options: NormalizedOptions): string {
    const sign = value < 0n ? '-' : '';
    let absValue = value < 0n ? -value : value;
    const stepBigInt = toStepBigInt(options.step);

    if (absValue === 0n) return '0';

    let tier = 0;
    let remainder = 0n;
    while (absValue >= stepBigInt) {
        remainder = absValue % stepBigInt;
        absValue = absValue / stepBigInt;
        tier += 1;
    }

    while (true) {
        const unit = getUnitByTier(tier, options.units, options.uppercaseUnits);
        const numberText = formatScaledBigInt(absValue, remainder, stepBigInt, options);
        
        // 检查是否因为四舍五入需要进位
        // BigInt 本身是整数，但 scaled 逻辑模拟了小数。
        // 由于 BigInt 格式化目前比较简单，我们可以直接返回
        return `${sign}${numberText}${unit}`;
    }
}

function formatScaledNumber(value: number, options: NormalizedOptions): string {
    const decimalPlaces = options.decimalPlaces;
    const rounded = Number(value.toFixed(decimalPlaces));
    if (rounded >= options.step) {
        return formatDecimal(rounded / options.step, decimalPlaces, options.trimTrailingZeros);
    }
    return formatDecimal(rounded, decimalPlaces, options.trimTrailingZeros);
}

function formatScaledBigInt(
    integerPart: bigint,
    remainder: bigint,
    stepBigInt: bigint,
    options: NormalizedOptions
): string {
    const integerText = integerPart.toString();
    const decimalPlaces = options.decimalPlaces;

    if (decimalPlaces <= 0) {
        return integerText;
    }

    const scale = 10n ** BigInt(decimalPlaces);
    const decimalPartNumber = (remainder * scale) / stepBigInt;
    const decimalPartRaw = decimalPartNumber.toString().padStart(decimalPlaces, '0');
    const decimalPart = options.trimTrailingZeros ? decimalPartRaw.replace(/0+$/, '') : decimalPartRaw;
    if (!decimalPart) return integerText;
    return `${integerText}.${decimalPart}`;
}

function formatDecimal(value: number, decimalPlaces: number, trimTrailingZeros: boolean): string {
    if (decimalPlaces <= 0) return Math.round(value).toString();
    const fixed = value.toFixed(decimalPlaces);
    if (!trimTrailingZeros) return fixed;
    return fixed.replace(/\.?0+$/, '');
}

function normalizeBigIntText(text: string): string | null {
    const compact = text.replace(/_/g, '');
    if (/^-?\d+n$/i.test(compact)) {
        return compact.slice(0, -1);
    }
    if (/^-?\d+$/.test(compact)) {
        return compact;
    }
    return null;
}

function parseBigIntTextOrThrow(text: string): string {
    const normalized = normalizeBigIntText(text.trim());
    if (!normalized) {
        throw new Error(`Invalid BigInt text: "${text}"`);
    }
    return normalized;
}

function normalizeOptions(options: FormatLargeNumberOptions): NormalizedOptions {
    const step = Number.isFinite(options.step) ? Math.floor(options.step as number) : THOUSAND;
    return {
        step: Math.max(2, step || THOUSAND),
        decimalPlaces: Math.min(2, Math.max(0, Math.floor(options.decimalPlaces ?? 2))),
        trimTrailingZeros: options.trimTrailingZeros ?? true,
        units: options.units ?? CUSTOM_THOUSAND_UNITS,
        uppercaseUnits: options.uppercaseUnits ?? true
    };
}

function toStepBigInt(step: number): bigint {
    if (!Number.isFinite(step)) return THOUSAND_BIGINT;
    const safeStep = Math.max(2, Math.floor(step));
    return BigInt(safeStep);
}

/**
 * 使用 units 本身组合单位（先 2 位，再 3 位）：
 * 以默认 units 为例：
 * 0 => KK, 1 => KM, ... , 最后一个双字母 => WW, 下一个 => KKK
 */
function getComposedUnit(index: number, units: readonly string[]): string {
    if (index < 0 || units.length <= 0) return '';

    let remaining = index;
    let width = 2;
    let capacity = Math.pow(units.length, width);

    while (remaining >= capacity) {
        remaining -= capacity;
        width += 1;
        capacity = Math.pow(units.length, width);
    }

    const chars: string[] = new Array(width);
    for (let i = width - 1; i >= 0; i -= 1) {
        const digit = remaining % units.length;
        chars[i] = units[digit] ?? '';
        remaining = Math.floor(remaining / units.length);
    }

    return chars.join('');
}
