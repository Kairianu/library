export const plainMediaType = 'text/plain';


const jpegMediaType = 'image/jpeg';

export const imageMediaTypes = {
	gif: 'image/gif',
	jpeg: jpegMediaType,
	jpg: jpegMediaType,
	png: 'image/png',
	svg: 'image/svg+xml',
};


const htmlMediaType = 'text/html';
const javascriptMediaType = 'text/javascript';

export const textMediaTypes = {
	css: 'text/css',
	htm: htmlMediaType,
	html: htmlMediaType,
	js: javascriptMediaType,
	json: 'application/json',
	md: 'text/markdown',
	mjs: javascriptMediaType,
	txt: plainMediaType,
};


export const extensionMediaTypes = {
	...imageMediaTypes,
	...textMediaTypes,
};


export const filePathExtensionRegExp = /[\\/]?.*\.(.+?)$/;



export function getMediaTypeFromExtension(extension) {
	return extensionMediaTypes[extension] || plainMediaType;
}

export function getMediaTypeFromFilePath(filePath) {
	const extensionMatch = filePathExtensionRegExp.exec(filePath);

	if ( extensionMatch ) {
		return getMediaTypeFromExtension(extensionMatch[1]);
	}
}
