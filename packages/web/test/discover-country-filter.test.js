const assert = require('assert');
const fs = require('fs');
const path = require('path');

const webRoot = path.resolve(__dirname, '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(webRoot, relativePath), 'utf8');

const filterSource = read(
  'components/discover/discover-filter-from.component.tsx'
);
const discoverQuery = read('queries/get-discovery.query.graphql');
const countriesQuery = read('queries/get-countries.query.graphql');

assert(
  filterSource.includes('title="Country of origin"') &&
    filterSource.includes('placeholder="Any country"'),
  'Discover should show an optional Country of origin filter'
);
assert(
  filterSource.includes('useGetLanguagesQuery') &&
    filterSource.includes('useGetCountriesQuery'),
  'The existing language options and TMDB country options should both be loaded'
);
assert(
  filterSource.includes('<Select.Option value="">Any country</Select.Option>'),
  'Any country should remain the default-compatible option'
);
assert(
  discoverQuery.includes('$originLanguage: String') &&
    discoverQuery.includes('$originCountry: String') &&
    discoverQuery.includes('originCountry: $originCountry'),
  'Discover GraphQL requests should carry language and country independently'
);
assert(
  countriesQuery.includes('countries: getCountries'),
  'The country dropdown should use the complete TMDB country list'
);

console.log('Discover country filter tests passed');
