const { google } = require('googleapis');
const readline = require('readline');

// 1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성하고 아래 정보를 입력하세요.
// 리디렉션 URI는 'http://localhost:3000' 등으로 설정하세요.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000'; // 콘솔에 등록한 리디렉션 URI

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // 중요: 리프레시 토큰을 받기 위해 필수
        scope: SCOPES,
        prompt: 'consent', // 중요: 매번 동의 화면을 띄워 리프레시 토큰을 확실히 받음
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('--------------------------------------------------');
    console.log('로그인 후 리디렉션된 URL에서 "code=" 뒤의 값을 복사하여 아래에 붙여넣으세요.');

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);

            console.log('\n--------------------------------------------------');
            console.log('SUCCESS! Add these to your .env.local file:');
            console.log('--------------------------------------------------');
            console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
            console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
            console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
            console.log('--------------------------------------------------');

            if (!token.refresh_token) {
                console.warn('WARNING: No refresh token returned. Did you use access_type: offline and prompt: consent?');
            }
        });
    });
}

if (CLIENT_ID === 'YOUR_CLIENT_ID') {
    console.error('Error: Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the script or environment variables.');
    process.exit(1);
}

getAccessToken(oauth2Client);
