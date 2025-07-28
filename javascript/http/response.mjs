import * as mediaType from '../file/mediaType.mjs';


export function getResponse(options) {
	let responseBody;
	let responseOptions;

	if ( options != undefined ) {
		responseOptions = {};

		for ( const [optionKey, optionValue] of Object.entries(options) ) {
			if ( optionKey == 'body' ) {
				responseBody = optionValue;
			}
			else {
				responseOptions[optionKey] = optionValue;
			}
		}
	}

	return new Response(responseBody, responseOptions);
}

export function validateResponseOptions(options) {
	if ( ! Object.isExtensible(options) ) {
		options = {};
	}

	if ( ! Object.isExtensible(options.headers) ) {
		options.headers = {};
	}

	return options;
}


export function getAuthenticateResponse(responseOptions) {
	responseOptions = validateResponseOptions(responseOptions);

	responseOptions.status = 401;

	if ( ! responseOptions.headers['www-authenticate'] ) {
		responseOptions.headers['www-authenticate'] = 'Basic';
	}

	return getResponse(responseOptions);
}

export async function getFileResponse(filePath, responseOptions, notFoundResponseOptions) {
	responseOptions = validateResponseOptions(responseOptions);

	let fileData;

	try {
		fileData = await Deno.readFile(filePath);
	}
	catch {
		return getNotFoundResponse(notFoundResponseOptions);
	}

	responseOptions.body = fileData;

	if ( ! responseOptions.headers['content-type'] ) {
		responseOptions.headers['content-type'] = mediaType.getMediaTypeFromFilePath(filePath);
	}

	return getResponse(responseOptions);
}

export function getJSONResponse(jsonData, responseOptions) {
	responseOptions = validateResponseOptions(responseOptions);

	responseOptions.body = JSON.stringify(jsonData);

	if ( ! responseOptions.headers['content-type'] ) {
		responseOptions.headers['content-type'] = mediaType.getMediaTypeFromExtension('json');
	}

	return getResponse(responseOptions);
}

export function getNotFoundResponse(responseOptions) {
	responseOptions = validateResponseOptions(responseOptions);

	responseOptions.status = 404;

	return getResponse(responseOptions);
}
