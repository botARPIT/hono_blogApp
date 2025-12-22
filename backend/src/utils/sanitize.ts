import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string{
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
    });
}

export function sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, {ALLOWED_TAGS: []})
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any>{
    let sanitized_obj: Record<string, any> = {};
    let sanitizedValue;
    let entry;
    for (entry in obj) {
        sanitizedValue = sanitizeText(obj[entry])
        sanitized_obj = {entry: sanitizedValue}
    }
    return sanitized_obj
} 