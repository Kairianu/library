export function getBasicAuthorization(request) {
	let password;
	let username;

	let authorizationString = request.headers.get('authorization');

	if ( authorizationString ) {
		authorizationString = authorizationString.replace(/^Basic\s/, '').trim();

		authorizationString = atob(authorizationString);

		const authorizationArray = authorizationString.split(':');

		username = authorizationArray[0];
		password = authorizationArray[1];
	}

	return {
		password,
		username,
	};
}

export function isBasicAuthorized(request, username, password) {
	const authorization = getBasicAuthorization(request);

	if ( authorization.username != username ) {
		return false;
	}

	if ( authorization.password != password ) {
		return false;
	}

	return true;
}
