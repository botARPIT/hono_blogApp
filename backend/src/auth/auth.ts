export async function fetchTokenFromGoogle (code: string, GOOGLE_CLIENT_ID: string, GOOGLE_CLIENT_SECRET: string){
    const token = await fetch("https://oauth2.googleapis.com/token", {
        method: 'POST',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        }, 
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: 'http://localhost:8787/api/v1/auth/callback/google',
            grant_type: "authorization_code",
        })
    })
    return token.json()
}