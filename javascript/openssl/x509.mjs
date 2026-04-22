import * as path from '../file/path.mjs';


export async function generateSelfSignedCertificate() {
	const generateCommand = new Deno.Command('openssl', {
		args: [
			'req',
			'-x509',
			'-subj', '/',
			'-out', '-',
			'-newkey', 'ec',
			'-pkeyopt', 'ec_paramgen_curve:prime256v1',
			'-nodes',
			'-keyout', '-',
		],
	});

	const generateCommandOutput = await generateCommand.output();

	if ( ! generateCommandOutput.success ) {
		const errorOutputText = new TextDecoder().decode(generateCommandOutput.stderr);

		throw new Error(
			'Unable to generate self signed certificate.\n'
			+ errorOutputText
		);
	}

	const standardOutputText = new TextDecoder().decode(generateCommandOutput.stdout);

	const certificateTextMatch = standardOutputText.match(
		/-+BEGIN CERTIFICATE.+END CERTIFICATE-+/s
	);

	if ( ! certificateTextMatch ) {
		throw new Error('Unable to read certificate output.');
	}

	const privateKeyTextMatch = standardOutputText.match(
		/-+BEGIN PRIVATE KEY.+END PRIVATE KEY-+/s
	);

	if ( ! privateKeyTextMatch ) {
		throw new Error('Unable to read certificate private key output.');
	}

	const certificateText = certificateTextMatch[0];
	const privateKeyText = privateKeyTextMatch[0];

	return createCertificateInfoObject(certificateText, privateKeyText, standardOutputText);
}

export async function getCertificateEndDate(certificateText) {
	const getInfoCommand = new Deno.Command('openssl', {
		args: [
			'x509',
			'-enddate',
			'-noout',
		],
		stderr: 'piped',
		stdin: 'piped',
		stdout: 'piped',
	});

	const getInfoCommandSpawn = getInfoCommand.spawn();

	const stdinWriter = getInfoCommandSpawn.stdin.getWriter();

	await stdinWriter.write(
		new TextEncoder().encode(certificateText)
	);

	await stdinWriter.close();

	const getInfoCommandOutput = await getInfoCommandSpawn.output();

	if ( ! getInfoCommandOutput.success ) {
		const errorOutputText = new TextDecoder().decode(getInfoCommandOutput.stderr);

		throw new Error(
			'Unable to get certificate information.\n'
			+ errorOutputText
		);
	}

	const standardOutputText = new TextDecoder().decode(getInfoCommandOutput.stdout);

	return new Date(standardOutputText);
}

export function createCertificateInfoObject(certificateText, privateKeyText, rawOutput) {
	const certificateInfo = {
		certificate: certificateText,
		privateKey: privateKeyText,
	};

	if ( rawOutput != undefined ) {
		certificateInfo.rawOutput = rawOutput;
	}

	return certificateInfo;
}

export function getTemporaryCertificateDirectoryPath() {
	const temporaryDirectoryName = 'personal-library_x509-temporary-certificate';

	// TODO: Write temporary file library.
	const temporaryDirectory = Deno.env.get('TEMP');

	if ( ! temporaryDirectory ) {
		throw new Deno.errors.NotFound('Operating system temporary directory not found.');
	}

	return path.joinPaths(temporaryDirectory, temporaryDirectoryName);
}

export async function getTemporaryCertificate() {
	const temporaryCertificateDirectoryPath = getTemporaryCertificateDirectoryPath();

	const temporaryCertificatePath = path.joinPaths(temporaryCertificateDirectoryPath, 'certificate.pem');
	const temporaryPrivateKeyPath = path.joinPaths(temporaryCertificateDirectoryPath, 'certificate-private-key.pem');

	// TODO: Create mkdir function in file library. Bypass AlreadyExists error, throw all else.
	try {
		await Deno.mkdir(temporaryCertificateDirectoryPath)
	}
	catch(error) {
		if ( ! (error instanceof Deno.errors.AlreadyExists) ) {
			throw error;
		}
	}

	let certificateInfo;

	try {
		const certificateText = await Deno.readTextFile(temporaryCertificatePath);
		const privateKeyText = await Deno.readTextFile(temporaryPrivateKeyPath);

		certificateInfo = createCertificateInfoObject(certificateText, privateKeyText);
	}
	catch {
		certificateInfo = await generateSelfSignedCertificate();

		try {
			await Deno.writeTextFile(temporaryCertificatePath, certificateInfo.certificate);
			await Deno.writeTextFile(temporaryPrivateKeyPath, certificateInfo.privateKey);
		} catch {}
	}

	return certificateInfo;
}

export async function deleteTemporaryCertificate() {
	const temporaryCertificateDirectoryPath = getTemporaryCertificateDirectoryPath();

	try {
		await Deno.remove(temporaryCertificateDirectoryPath, {
			recursive: true,
		});
	} catch {}
}





if ( import.meta.main ) {
	const certificateInfo = await generateSelfSignedCertificate();

	console.log(certificateInfo.certificate);
	console.log(certificateInfo.privateKey);
}
