import https from 'https';

https.get('https://alasr.co.za/beta/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const colors = new Set();
    const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
    let match;
    while ((match = hexRegex.exec(data)) !== null) {
      colors.add(match[0]);
    }
    
    const fontRegex = /font-family:\s*([^;>]+)/g;
    const fonts = new Set();
    while ((match = fontRegex.exec(data)) !== null) {
      fonts.add(match[1].trim());
    }

    console.log('Colors:', Array.from(colors));
    console.log('Fonts:', Array.from(fonts));
    
    const linkRegex = /<link[^>]+href="([^"]+\.css)"/g;
    const links = [];
    while ((match = linkRegex.exec(data)) !== null) {
      links.push(match[1]);
    }
    console.log('CSS Links:', links);
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
