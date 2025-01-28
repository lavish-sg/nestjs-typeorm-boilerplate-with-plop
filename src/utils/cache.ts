import * as NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 10 minutes

export default cache;
