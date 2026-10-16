'use strict';
function releaseRenderCaches(v){if(!v)return;v.releaseRemainsTextures?.(true);const release=c=>{if(c&&typeof c.getContext==='function'){c.width=1;c.height=1;}};if(v.spaceCloudCache){release(v.spaceCloudCache.canvas);v.spaceCloudCache=null;}release(v.starGlow);v.starGlow=undefined;for(const key of ['stainLayer','desertTerrain','mineTerrain','raidTerrain','raidBuildAreaCanvas']){release(v[key]);v[key]=null;}if(v.caveLayers){for(const c of v.caveLayers.values())release(c);v.caveLayers.clear();}if(v.images){release(v.images.staticRim);delete v.images.staticRim;delete v.images.rimCacheAttempted;}v.stainKey=null;v.stainGame=null;}
function pruneImages(cache,keep){for(const key of cache.keys())if(!keep.has(key))cache.delete(key);}
module.exports={releaseRenderCaches,pruneImages};
