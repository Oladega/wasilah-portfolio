import optimizedImageVariants from '@/data/optimized-image-variants.json';
import Image, {type ImageProps} from 'next/image';
import {imageVariants} from '@/data/image-variants';
export function ResponsiveImage({src,alt,sizes,width,priority,...props}:Omit<ImageProps,'src'>&{src:string}){
 const resolvedSizes=sizes??(typeof width==='number'?`${width}px`:'100vw');
 const srcSet=(optimizedImageVariants as Record<string,string>)[src]??imageVariants[src];
 if(!srcSet)return <Image alt={alt} src={src} sizes={resolvedSizes} width={width} priority={priority} {...props}/>;
 return <>{priority&&<link rel="preload" as="image" imageSrcSet={srcSet} imageSizes={resolvedSizes}/>}<picture><source srcSet={srcSet} sizes={resolvedSizes}/><Image alt={alt} src={src} sizes={resolvedSizes} width={width} {...props} loading={priority?'eager':props.loading} fetchPriority={priority?'high':props.fetchPriority}/></picture></>;
}
