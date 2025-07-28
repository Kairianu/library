const javascriptMediaType = 'text/javascript';

export const extensionMediaTypes = {
	css: 'text/css',
	html: 'text/html',
	js: javascriptMediaType,
	json: 'application/json',
	mjs: javascriptMediaType,
	plain: 'text/plain',
};

export const filePathExtensionRegExp = /[\\/]?.*\.(.+?)$/;



export function getMediaTypeFromExtension(extension) {
	return extensionMediaTypes[extension] || extensionMediaTypes.plain;
}

export function getMediaTypeFromFilePath(filePath) {
	const extensionMatch = filePathExtensionRegExp.exec(filePath);

	if ( extensionMatch ) {
		return getMediaTypeFromExtension(extensionMatch[1]);
	}
}
