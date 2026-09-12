export const sanitizeHtml = (htmlContent: string): string => {
  if (!htmlContent) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
    dangerousTags.forEach(tag => {
      const elements = doc.body.getElementsByTagName(tag);
      for (let i = elements.length - 1; i >= 0; i--) {

        if (tag === 'iframe') {
          const src = elements[i].getAttribute('src') || '';
          if (src.includes('youtube.com') || src.includes('vimeo.com')) {
            continue;
          }
        }
        elements[i].parentNode?.removeChild(elements[i]);
      }
    });

    const allElements = doc.body.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const attributes = Array.from(el.attributes);
      for (const attr of attributes) {
        if (attr.name.startsWith('on') || attr.value.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      }
    }

    return doc.body.innerHTML;
  } catch (err) {
    return htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
};

