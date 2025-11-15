export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const prefix = 'products/';

  try {
    const list = await fetch(`https://blob.vercel-storage.com/?prefix=${prefix}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await list.text();

    const products = [];
    text.split('\n')
      .filter(line => line.endsWith('.ics'))
      .forEach(line => {
        const file = line.trim().split('/').pop();
        const name = decodeURIComponent(file.replace(/\.ics$/, ''));
        products.push({ name, folder: name });
      });

    res.json(products);
  } catch (e) {
    res.json([]);
  }
}
