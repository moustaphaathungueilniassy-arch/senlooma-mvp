const fs = require('fs');
const file = 'src/app/(main)/tableau-de-bord/messages/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/export default function MessagesPage\(\) \{/, 'function MessagesContent() {');

c = c + `

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin"></div></div>}>
      <MessagesContent />
    </React.Suspense>
  );
}
`;

fs.writeFileSync(file, c);
