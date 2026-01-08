export async function fetchTokenFromGoogle(
    code: string,
    clientId: string,
    clientSecret: string,
    codeVerifier: string,
    redirectUri: string
) {
    const token = await fetch("https://oauth2.googleapis.com/token", {
        method: 'POST',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            code_verifier: codeVerifier
        })
    })
    return token.json()
}