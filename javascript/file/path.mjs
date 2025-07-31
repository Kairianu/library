export const currentDirectoryIndicator = '.';
export const driveDelimiter = ':';
export const parentDirectoryIndicator = '..';
export const pathDelimiter = '/';
export const protocolDelimiter = '://';

export const basenameDriveLetterRegExp = /^\s*([a-zA-Z]:[/\\])$/;
export const basenameRegExp = /([^/\\]+)[/\\]*$/;
export const driveLetterRegExp = /^\s*[/\\]*([a-zA-Z]):[/\\]/;
export const extensionRegExp = /[^/\\]\.([^/\\.]+)$/;
export const parentDirectoryRegExp = /^(\.\.[/\\])+$/;
export const pathDelimiterRegExp = /[/\\]+/g;
export const protocolRegExp = /^\s*([a-zA-Z][a-zA-Z0-9.-]*):[/\\]{2}/;


export function getBasename(path) {
	const basenameDriveLetterMatch = basenameDriveLetterRegExp.exec(path);

	if ( basenameDriveLetterMatch ) {
		return basenameDriveLetterMatch[1];
	}

	const basenameMatch = basenameRegExp.exec(path);

	if ( basenameMatch ) {
		return basenameMatch[1];
	}

	return path;
}

export function getExtension(path) {
	const basename = getBasename(path);

	const extensionMatch = extensionRegExp.exec(basename);

	if ( extensionMatch ) {
		return extensionMatch[1];
	}
}

export function getParentDirectory(path, navigateCount=1) {
	const protocol = getProtocol(path);

	path = normalizePath(path, '*');

	if ( path != pathDelimiter ) {
		for ( let navigateIndex = 0; navigateIndex < navigateCount; navigateIndex++ ) {
			const parentDirectoryMatch = parentDirectoryRegExp.exec(path);

			if ( parentDirectoryMatch ) {
				path = parentDirectoryIndicator + pathDelimiter + path;
			}
			else {
				for (
					let characterIndex = path.length - 1;
					characterIndex >= 0;
					characterIndex--
				) {
					const character = path[characterIndex];

					if ( character == pathDelimiter ) {
						if ( characterIndex == path.length - 1 ) {
							continue;
						}

						path = path.slice(0, characterIndex + 1);

						break;
					}

					if ( characterIndex == 0 ) {
						const driveLetterMatch = driveLetterRegExp.exec(path);

						if ( ! driveLetterMatch ) {
							path = currentDirectoryIndicator + pathDelimiter;
						}
					}
				}
			}
		}
	}

	path = prependProtocol(protocol, path);

	return path;
}

export function getProtocol(path) {
	const protocolMatch = protocolRegExp.exec(path);

	if ( protocolMatch ) {
		return protocolMatch[1];
	}
}

export function joinPaths(...pathParts) {
	let fullPath = '';

	for ( const [pathPartIndex, pathPart] of pathParts.entries() ) {
		if ( pathPartIndex > 0 ) {
			fullPath += pathDelimiter;
		}

		fullPath += pathPart;
	}

	return normalizePath(fullPath);
}

export function normalizeDelimiters(path) {
	return String(path).replace(pathDelimiterRegExp, pathDelimiter);
}

export function normalizeDriveLetter(path) {
	return String(path).replace(driveLetterRegExp, '$1' + driveDelimiter + pathDelimiter);
}

export function normalizePath(path, removedProtocols) {
	let protocol = getProtocol(path);

	if ( protocol ) {
		if ( shouldRemoveProtocol(protocol, removedProtocols) ) {
			protocol = undefined;
		}

		path = removeProtocol(path);
	}

	path = normalizeDelimiters(path);

	path = prependProtocol(protocol, path);

	return path;
}

export function prependProtocol(protocol, path) {
	if ( protocol == undefined ) {
		return path;
	}

	path = removeProtocol(path);
	protocol = String(protocol);

	let pathProtocolDelimiter = protocolDelimiter;

	if ( protocol.toLowerCase() == 'file' ) {
		if ( ! path.startsWith(pathDelimiter) ) {
			pathProtocolDelimiter += pathDelimiter;
		}
	}

	return protocol + pathProtocolDelimiter + path;
}

export function removeProtocol(path) {
	path = String(path);

	path = path.replace(protocolRegExp, '');

	path = normalizeDriveLetter(path);

	return path;
}

export function shouldRemoveProtocol(protocol, removedProtocols) {
	if ( removedProtocols == '*' ) {
		return true;
	}

	const removedProtocolsType = typeof(removedProtocols);

	if ( removedProtocolsType == 'object' ) {
		if ( Array.isArray(removedProtocols) ) {
			if ( removedProtocols.includes(protocol) ) {
				return true;
			}
		}
		else if ( removedProtocols[protocol] ) {
			return true;
		}
	}
	else if ( removedProtocolsType == 'string' ) {
		if ( protocol == removedProtocols ) {
			return true;
		}
	}

	return false;
}
