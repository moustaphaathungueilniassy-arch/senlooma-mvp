const fs = require('fs');
const file = 'src/app/(main)/annonces/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const \[debouncedFilters, setDebouncedFilters\] = useState\(filters\);/, 
`const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);`);

c = c.replace(/import \{ Filter, MapPin, Search, SlidersHorizontal, AlertCircle, RefreshCw \} from 'lucide-react';/,
`import { Filter, MapPin, Search, SlidersHorizontal, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';`);

c = c.replace(
`<h2 className="text-lg font-semibold flex items-center mb-4">
              <Filter className="w-5 h-5 mr-2 text-[#D4A843]" />
              Filtres
            </h2>
            
            <div className="space-y-4">`,
`<div className="flex justify-between items-center mb-4 md:mb-0">
              <h2 className="text-lg font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#D4A843]" />
                Filtres
              </h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="md:hidden flex items-center text-sm font-medium bg-white/10 px-3 py-1.5 rounded border border-white/20"
              >
                {isMobileFiltersOpen ? (
                  <><ChevronUp className="w-4 h-4 mr-1" /> Masquer</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-1" /> Afficher</>
                )}
              </button>
            </div>
            
            <div className={\`space-y-4 \${isMobileFiltersOpen ? 'block mt-4' : 'hidden'} md:block md:mt-4\`}>`
);

fs.writeFileSync(file, c);
