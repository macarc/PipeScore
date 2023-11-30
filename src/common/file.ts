export async function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.addEventListener('error', rej);
    reader.addEventListener('load', (e) => {
      const data = e.target?.result;
      if (data) res(data.toString());
    });
  });
}
