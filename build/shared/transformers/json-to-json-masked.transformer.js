"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mask = require("json-mask");
class JsonToJsonMaskedTransformer {
    constructor(maskInput, maskConverter) {
        this.maskInput = maskInput;
        this.maskConverter = maskConverter;
        this.supportedType = 'json';
    }
    supports(type) {
        return type.toLowerCase() === this.supportedType;
    }
    transform(source, langCode, mergeLanguages, filters) {
        if (filters && filters.length > 0) {
            const { tags, ...translations } = source;
            const maskInput = this.maskInput.convert(filters);
            const filtersMask = this.maskConverter.convert(maskInput, tags);
            const maskedTranslations = mask(translations, filtersMask);
            return maskedTranslations;
        }
        return source;
    }
}
exports.default = JsonToJsonMaskedTransformer;