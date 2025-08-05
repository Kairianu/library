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

	const certificateInfo = {
		opensslOutput: standardOutputText,
	};

	const certificateTextMatch = standardOutputText.match(
		/-+BEGIN CERTIFICATE.+END CERTIFICATE-+/s
	);

	if ( certificateTextMatch ) {
		certificateInfo.certificate = certificateTextMatch[0];
	}

	const keyTextMatch = standardOutputText.match(
		/-+BEGIN PRIVATE KEY.+END PRIVATE KEY-+/s
	);

	if ( keyTextMatch ) {
		certificateInfo.key = keyTextMatch[0];
	}

	return certificateInfo;
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
